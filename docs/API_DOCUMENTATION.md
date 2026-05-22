# API Documentation — Feedback Management System

Base URL: `http://localhost:8000`

Interactive docs (Swagger UI): `http://localhost:8000/docs`

---

## Feedback Endpoints

### 1. Get All Feedback

**GET** `/feedback`

Returns all feedback records.

**Response 200**
```json
[
  {
    "feedback_id": 1,
    "participant_name": "Alice Johnson",
    "program_name": "Python Bootcamp",
    "rating": 5,
    "comments": "Excellent content and delivery.",
    "submitted_at": "2026-05-14T10:30:00"
  }
]
```

---

### 2. Get Feedback by ID

**GET** `/feedback/{feedback_id}`

| Parameter   | Type    | Description        |
|-------------|---------|--------------------|
| feedback_id | integer | Feedback record ID |

**Response 200** — feedback object (same shape as above)

**Response 404**
```json
{ "detail": "Feedback not found" }
```

---

### 3. Create Feedback

**POST** `/feedback`

**Request Body**
```json
{
  "participant_name": "Bob Smith",
  "program_name": "React Workshop",
  "rating": 4,
  "comments": "Very hands-on and practical."
}
```

| Field            | Type    | Required | Constraints |
|------------------|---------|----------|-------------|
| participant_name | string  | Yes      | —           |
| program_name     | string  | Yes      | —           |
| rating           | integer | Yes      | 1 – 5       |
| comments         | string  | No       | —           |

**Response 201** — created feedback object

---

### 4. Update Feedback

**PUT** `/feedback/{feedback_id}`

All fields are optional — only provided fields are updated.

**Request Body**
```json
{
  "rating": 5,
  "comments": "Updated: truly outstanding program."
}
```

**Response 200** — updated feedback object

**Response 404**
```json
{ "detail": "Feedback not found" }
```

---

### 5. Delete Feedback

**DELETE** `/feedback/{feedback_id}`

**Response 200**
```json
{ "message": "Feedback deleted successfully" }
```

**Response 404**
```json
{ "detail": "Feedback not found" }
```

---

### 6. Search / Filter Feedback

**GET** `/search`

All query parameters are optional and combinable.

| Parameter    | Type    | Description                                            |
|--------------|---------|--------------------------------------------------------|
| keyword      | string  | Case-insensitive search across name, program, comments |
| rating       | integer | Exact rating match (1–5)                               |
| program_name | string  | Case-insensitive program name match                    |

**Example**
```
GET /search?keyword=python&rating=5
GET /search?program_name=Data+Science+Fundamentals
```

**Response 200** — array of matching feedback objects

---

## ETL Endpoints

### 7. Upload File and Run ETL

**POST** `/etl/upload`

Accepts a CSV or Excel file, runs the ETL pipeline (extract → transform → load), and returns a run summary. Admin only.

**Request** — `multipart/form-data`

| Field | Type | Description                        |
|-------|------|------------------------------------|
| file  | file | CSV (.csv) or Excel (.xlsx, .xls)  |

**ETL Pipeline behaviour**
- Normalises column names (lowercase, underscores)
- Required columns: `participant_name`, `program_name`, `rating`
- Optional columns: `comments`, `submitted_date`
- Filters out rows with missing required fields or ratings outside 1–5
- Removes duplicates based on participant + program + date
- Title-cases participant and program names

**Response 201**
```json
{
  "run_id": 3,
  "filename": "sample_feedback.csv",
  "total_records": 105,
  "valid_records": 103,
  "invalid_records": 1,
  "duplicate_records": 1,
  "loaded_records": 103,
  "status": "success",
  "error_message": null,
  "run_at": "2026-05-22T10:00:00"
}
```

**Response 400** — unsupported file type
```json
{ "detail": "Unsupported file type. Allowed: csv, xlsx, xls" }
```

---

### 8. Get ETL Run History

**GET** `/etl/runs`

Returns all ETL runs ordered newest first.

**Response 200** — array of ETL run objects (same shape as above)

---

### 9. Get Overall Analytics

**GET** `/etl/analytics`

Returns summary analytics computed from all feedback records.

**Response 200**
```json
{
  "total_imported": 103,
  "avg_rating": 3.85,
  "total_etl_runs": 3,
  "program_stats": [
    {
      "program_name": "Python Basics",
      "total_feedback": 22,
      "avg_rating": 4.1,
      "rating_1": 1,
      "rating_2": 2,
      "rating_3": 4,
      "rating_4": 8,
      "rating_5": 7
    }
  ],
  "rating_distribution": [
    { "rating": 1, "count": 5 },
    { "rating": 2, "count": 10 },
    { "rating": 3, "count": 20 },
    { "rating": 4, "count": 38 },
    { "rating": 5, "count": 30 }
  ],
  "top_program": "Machine Learning Advanced",
  "bottom_program": "Web Development Bootcamp"
}
```

---

### 10. Get Per-Program Analytics

**GET** `/etl/analytics/programs`

Returns per-program aggregated stats sorted by average rating descending.

**Response 200** — array of program stat objects
```json
[
  {
    "program_name": "Machine Learning Advanced",
    "total_feedback": 25,
    "avg_rating": 4.4,
    "rating_1": 0,
    "rating_2": 1,
    "rating_3": 3,
    "rating_4": 10,
    "rating_5": 11
  }
]
```

---

### 11. Download CSV Report

**GET** `/etl/report/download`

Streams all feedback records (or a filtered subset) as a downloadable CSV file.

| Query Parameter | Type   | Required | Description                                      |
|-----------------|--------|----------|--------------------------------------------------|
| program_name    | string | No       | Filter records to a specific program             |

**Examples**
```
GET /etl/report/download                              → feedback_report_all.csv
GET /etl/report/download?program_name=Python+Basics   → feedback_report_Python_Basics.csv
```

**Response** — CSV file download (`Content-Disposition: attachment`)

CSV columns: `feedback_id`, `participant_name`, `program_name`, `rating`, `comments`, `submitted_at`

---

## Error Responses

| Status | Meaning                                 |
|--------|-----------------------------------------|
| 200    | OK — request succeeded                  |
| 201    | Created — resource created              |
| 400    | Bad Request — e.g. unsupported file type|
| 404    | Not Found — record does not exist       |
| 422    | Unprocessable Entity — validation error |
| 500    | Internal Server Error                   |

---

## Data Models

### Feedback

| Field            | Type     | Constraints                 |
|------------------|----------|-----------------------------|
| feedback_id      | integer  | Primary key, auto-increment |
| participant_name | string   | Required, not null          |
| program_name     | string   | Required, not null          |
| rating           | integer  | Required, 1–5               |
| comments         | text     | Optional, nullable          |
| submitted_at     | datetime | Auto-set on creation (UTC)  |

### ETLRun

| Field             | Type     | Constraints                        |
|-------------------|----------|------------------------------------|
| run_id            | integer  | Primary key, auto-increment        |
| filename          | string   | Name of the uploaded file          |
| total_records     | integer  | Total rows in the file             |
| valid_records     | integer  | Rows that passed validation        |
| invalid_records   | integer  | Rows rejected (missing/bad data)   |
| duplicate_records | integer  | Rows removed as duplicates         |
| loaded_records    | integer  | Rows successfully inserted         |
| status            | string   | `pending` / `success` / `failed`   |
| error_message     | text     | Populated on failure, else null    |
| run_at            | datetime | Timestamp of the run (UTC)         |
