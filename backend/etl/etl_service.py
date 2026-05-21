import pandas as pd
import io
from datetime import datetime
from sqlalchemy.orm import Session
from models import Feedback, ETLRun


def extract(file_bytes: bytes, filename: str) -> pd.DataFrame:
    """Read CSV or Excel file bytes into a DataFrame."""
    ext = filename.rsplit(".", 1)[-1].lower()
    if ext == "csv":
        df = pd.read_csv(io.BytesIO(file_bytes))
    elif ext in ("xlsx", "xls"):
        df = pd.read_excel(io.BytesIO(file_bytes), engine="openpyxl")
    else:
        raise ValueError(f"Unsupported file type: .{ext}")
    return df


def transform(df: pd.DataFrame) -> dict:
    """
    Clean and validate the DataFrame.
    Returns a dict with cleaned df and counts of invalid/duplicate rows.
    """
    total = len(df)

    # Normalize column names: lowercase and strip whitespace
    df.columns = [c.strip().lower().replace(" ", "_") for c in df.columns]

    # Keep only expected columns; add missing optional ones
    required_cols = {"participant_name", "program_name", "rating"}
    missing = required_cols - set(df.columns)
    if missing:
        raise ValueError(f"Missing required columns: {missing}")

    if "comments" not in df.columns:
        df["comments"] = None
    if "submitted_date" not in df.columns:
        df["submitted_date"] = None

    df = df[["participant_name", "program_name", "rating", "comments", "submitted_date"]].copy()

    # Capture actual NaN in required fields before any string conversion
    required_null_mask = (
        df["participant_name"].isna() |
        df["program_name"].isna() |
        df["rating"].isna()
    )

    # Strip whitespace from string fields (fillna first so pd.NA doesn't survive astype)
    df["participant_name"] = df["participant_name"].fillna("").astype(str).str.strip()
    df["program_name"] = df["program_name"].fillna("").astype(str).str.strip()
    df["comments"] = df["comments"].fillna("").astype(str).str.strip()
    df["comments"] = df["comments"].replace({"nan": None, "": None})

    # Title-case name fields
    df["participant_name"] = df["participant_name"].str.title()
    df["program_name"] = df["program_name"].str.title()

    # Parse submitted_date; invalid dates become None
    df["submitted_date"] = pd.to_datetime(df["submitted_date"], errors="coerce")

    # Track invalid records (missing required fields or out-of-range rating)
    invalid_mask = (
        required_null_mask |
        df["participant_name"].isin(["", "Nan", "None"]) |
        df["program_name"].isin(["", "Nan", "None"]) |
        ~df["rating"].apply(lambda r: _is_valid_rating(r))
    )
    invalid_count = int(invalid_mask.sum())
    df_valid = df[~invalid_mask].copy()

    # Convert rating to int after filtering
    df_valid["rating"] = df_valid["rating"].astype(int)

    # Remove duplicates based on name + program + date
    before_dedup = len(df_valid)
    df_valid = df_valid.drop_duplicates(
        subset=["participant_name", "program_name", "submitted_date"]
    )
    duplicate_count = before_dedup - len(df_valid)

    return {
        "df": df_valid,
        "total": total,
        "valid": len(df_valid),
        "invalid": invalid_count,
        "duplicates": duplicate_count,
    }


def _is_valid_rating(value) -> bool:
    try:
        r = int(float(value))
        return 1 <= r <= 5
    except (ValueError, TypeError):
        return False


def load(df: pd.DataFrame, db: Session) -> int:
    """Insert cleaned records into the feedback table. Returns count inserted."""
    records = []
    for _, row in df.iterrows():
        submitted_at = row["submitted_date"] if pd.notna(row["submitted_date"]) else datetime.utcnow()
        records.append(Feedback(
            participant_name=row["participant_name"],
            program_name=row["program_name"],
            rating=int(row["rating"]),
            comments=row["comments"] if row["comments"] not in (None, "None", "nan", "") else None,
            submitted_at=submitted_at,
        ))
    db.bulk_save_objects(records)
    db.commit()
    return len(records)


def run_etl(file_bytes: bytes, filename: str, db: Session) -> ETLRun:
    """Orchestrates Extract → Transform → Load and persists an ETLRun record."""
    etl_run = ETLRun(filename=filename, status="pending")
    db.add(etl_run)
    db.commit()
    db.refresh(etl_run)

    try:
        df_raw = extract(file_bytes, filename)
        result = transform(df_raw)
        loaded = load(result["df"], db)

        etl_run.total_records = result["total"]
        etl_run.valid_records = result["valid"]
        etl_run.invalid_records = result["invalid"]
        etl_run.duplicate_records = result["duplicates"]
        etl_run.loaded_records = loaded
        etl_run.status = "success"
    except Exception as exc:
        db.rollback()
        etl_run.status = "failed"
        etl_run.error_message = str(exc)

    db.commit()
    db.refresh(etl_run)
    return etl_run
