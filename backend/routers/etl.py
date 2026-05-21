import csv
import io
from fastapi import APIRouter, Depends, File, UploadFile, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import func, case
from typing import List, Optional
from database import get_db
from models import ETLRun, Feedback
from schemas import ETLRunResponse, ETLAnalyticsResponse, ProgramStat, RatingDistribution
from etl.etl_service import run_etl

router = APIRouter(prefix="/etl", tags=["ETL"])

ALLOWED_EXTENSIONS = {"csv", "xlsx", "xls"}


@router.post("/upload", response_model=ETLRunResponse, status_code=201)
async def upload_and_run_etl(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """Upload a CSV or Excel file and trigger the ETL pipeline. Admin only."""
    ext = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type. Allowed: {', '.join(ALLOWED_EXTENSIONS)}",
        )
    file_bytes = await file.read()
    etl_run = run_etl(file_bytes, file.filename, db)
    return etl_run


@router.get("/runs", response_model=List[ETLRunResponse])
def get_etl_runs(db: Session = Depends(get_db)):
    """Return all ETL run history, newest first."""
    return db.query(ETLRun).order_by(ETLRun.run_at.desc()).all()


@router.get("/analytics", response_model=ETLAnalyticsResponse)
def get_analytics(db: Session = Depends(get_db)):
    """Return summary analytics computed from the feedback table."""
    total = db.query(func.count(Feedback.feedback_id)).scalar() or 0
    avg = db.query(func.avg(Feedback.rating)).scalar()
    avg_rating = round(float(avg), 2) if avg else 0.0
    total_runs = db.query(func.count(ETLRun.run_id)).scalar() or 0

    # Per-program aggregated stats
    programs = (
        db.query(
            Feedback.program_name,
            func.count(Feedback.feedback_id).label("total_feedback"),
            func.avg(Feedback.rating).label("avg_rating"),
            func.sum(case((Feedback.rating == 1, 1), else_=0)).label("r1"),
            func.sum(case((Feedback.rating == 2, 1), else_=0)).label("r2"),
            func.sum(case((Feedback.rating == 3, 1), else_=0)).label("r3"),
            func.sum(case((Feedback.rating == 4, 1), else_=0)).label("r4"),
            func.sum(case((Feedback.rating == 5, 1), else_=0)).label("r5"),
        )
        .group_by(Feedback.program_name)
        .all()
    )

    program_stats = [
        ProgramStat(
            program_name=p.program_name,
            total_feedback=p.total_feedback,
            avg_rating=round(float(p.avg_rating), 2),
            rating_1=p.r1 or 0,
            rating_2=p.r2 or 0,
            rating_3=p.r3 or 0,
            rating_4=p.r4 or 0,
            rating_5=p.r5 or 0,
        )
        for p in programs
    ]

    # Rating distribution
    rating_dist_rows = (
        db.query(Feedback.rating, func.count(Feedback.feedback_id).label("count"))
        .group_by(Feedback.rating)
        .order_by(Feedback.rating)
        .all()
    )
    rating_distribution = [
        RatingDistribution(rating=r.rating, count=r.count) for r in rating_dist_rows
    ]

    top_program = None
    bottom_program = None
    if program_stats:
        sorted_programs = sorted(program_stats, key=lambda p: p.avg_rating, reverse=True)
        top_program = sorted_programs[0].program_name
        bottom_program = sorted_programs[-1].program_name

    return ETLAnalyticsResponse(
        total_imported=total,
        avg_rating=avg_rating,
        total_etl_runs=total_runs,
        program_stats=program_stats,
        rating_distribution=rating_distribution,
        top_program=top_program,
        bottom_program=bottom_program,
    )


@router.get("/analytics/programs", response_model=List[ProgramStat])
def get_program_analytics(db: Session = Depends(get_db)):
    """Return per-program aggregated stats from the feedback table."""
    programs = (
        db.query(
            Feedback.program_name,
            func.count(Feedback.feedback_id).label("total_feedback"),
            func.avg(Feedback.rating).label("avg_rating"),
            func.sum(case((Feedback.rating == 1, 1), else_=0)).label("r1"),
            func.sum(case((Feedback.rating == 2, 1), else_=0)).label("r2"),
            func.sum(case((Feedback.rating == 3, 1), else_=0)).label("r3"),
            func.sum(case((Feedback.rating == 4, 1), else_=0)).label("r4"),
            func.sum(case((Feedback.rating == 5, 1), else_=0)).label("r5"),
        )
        .group_by(Feedback.program_name)
        .order_by(func.avg(Feedback.rating).desc())
        .all()
    )
    return [
        ProgramStat(
            program_name=p.program_name,
            total_feedback=p.total_feedback,
            avg_rating=round(float(p.avg_rating), 2),
            rating_1=p.r1 or 0,
            rating_2=p.r2 or 0,
            rating_3=p.r3 or 0,
            rating_4=p.r4 or 0,
            rating_5=p.r5 or 0,
        )
        for p in programs
    ]


@router.get("/report/download")
def download_report(program_name: Optional[str] = None, db: Session = Depends(get_db)):
    """Stream feedback records as a downloadable CSV report, optionally filtered by program."""
    query = db.query(Feedback).order_by(Feedback.submitted_at.desc())
    if program_name:
        query = query.filter(Feedback.program_name == program_name)
    rows = query.all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["feedback_id", "participant_name", "program_name", "rating", "comments", "submitted_at"])
    for row in rows:
        writer.writerow([
            row.feedback_id,
            row.participant_name,
            row.program_name,
            row.rating,
            row.comments or "",
            row.submitted_at.strftime("%Y-%m-%d %H:%M:%S") if row.submitted_at else "",
        ])

    output.seek(0)
    safe_name = program_name.replace(" ", "_") if program_name else "all"
    filename = f"feedback_report_{safe_name}.csv"
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )
