# Feedback Management System (FMS)

A full-stack web application for collecting, managing, and analysing participant feedback for training programs and events.

---

## Project Overview

The Feedback Management System allows program coordinators and participants to:
- Collect structured feedback from participants via a submission form
- View live dashboard analytics — overall and per-program
- Search and filter feedback by keyword, program name, or rating
- Perform full CRUD operations on feedback records
- Bulk-import feedback from CSV or Excel files through an ETL pipeline
- Download filtered CSV reports per program or across all programs
- Access role-specific views — Admin has full access; User can submit and browse feedback

---

## Features

### Shared (Admin & User)
- Role selection screen on first load — choose Admin or User
- Dashboard with total feedback count, average rating, program-wise breakdown, and recent feedback table
- Program filter dropdown on the dashboard to scope all stats to a single program
- Full feedback list with search by keyword, program name, and rating
- Feedback detail view with star rating display

### User Role
- Submit feedback form (participant name, program, rating 1–5, comments)

### Admin Role
- Inline edit and delete on feedback detail view (with confirmation)
- **Import Data (ETL)** — upload CSV or Excel files to bulk-import feedback records
  - Automatic validation: rejects missing required fields and out-of-range ratings
  - Deduplication based on participant + program + date
  - Run history table showing total / loaded / duplicates / invalid counts per run
- **Analysis page** — program-wise analytics dashboard
  - Overall view: total records, average rating, rating distribution chart, program ranking table
  - Program view (select from dropdown): per-program stats, rating breakdown, and feedback insights
    - What Went Well — comments from 4–5 star reviews
    - Needs Improvement — comments from 1–2 star reviews
    - Neutral Observations — comments from 3 star reviews
  - Download CSV report for all programs or a specific program
  - Click any program row to drill directly into that program's insights

---

## Technology Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Frontend  | React 18, React Router v6         |
| Backend   | FastAPI (Python 3.10+)            |
| Database  | SQLite via SQLAlchemy ORM         |
| HTTP      | Axios                             |
| Server    | Uvicorn (ASGI)                    |
| ETL       | pandas, openpyxl                  |

---

## Project Structure

```
AFDE_May26_Anuvarshini_FMS-/
├── frontend/                   React SPA
│   ├── src/
│   │   ├── components/
│   │   │   └── Navbar.jsx      Sidebar navigation (role-aware)
│   │   ├── pages/
│   │   │   ├── RoleSelect.jsx          Role selection screen
│   │   │   ├── Dashboard.jsx           Dashboard with program filter
│   │   │   ├── FeedbackList.jsx        Feedback table with search
│   │   │   ├── FeedbackDetail.jsx      View / edit / delete feedback
│   │   │   ├── SubmitFeedback.jsx      User feedback submission form
│   │   │   ├── ETLUpload.jsx           Admin CSV/Excel file import
│   │   │   └── ETLAnalytics.jsx        Admin analytics + insights
│   │   ├── services/
│   │   │   └── api.js                  Axios API client
│   │   ├── App.js                      Routes and role-based rendering
│   │   └── App.css                     Global styles
│   └── public/
├── backend/                    FastAPI application
│   ├── routers/
│   │   ├── feedback.py         Feedback CRUD + search endpoints
│   │   └── etl.py              ETL upload, analytics, and download endpoints
│   ├── etl/
│   │   └── etl_service.py      Extract → Transform → Load pipeline
│   ├── main.py                 App entry point with CORS config
│   ├── models.py               SQLAlchemy ORM models (Feedback, ETLRun)
│   ├── schemas.py              Pydantic request/response schemas
│   ├── crud.py                 Feedback database operations
│   ├── database.py             SQLAlchemy engine and session setup
│   └── feedback.db             SQLite database (auto-created on first run)
├── data/
│   └── sample_feedback.csv     Sample data file for testing ETL import
├── docs/
│   └── API_DOCUMENTATION.md    Full API endpoint reference
├── screenshots/                Phase 1 UI screenshots
├── screenshots_phase2/         Phase 2 UI screenshots
├── requirements.txt            Python dependencies
└── .gitignore
```

---

## Setup Instructions

### Prerequisites

- Python 3.10+
- Node.js 16+ and npm

### Backend Setup

```bash
# Create and activate virtual environment
python -m venv .myenv
.myenv\Scripts\activate          # Windows
# source .myenv/bin/activate     # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Start the backend server (from project root)
.myenv\Scripts\uvicorn backend.main:app --reload
```

Backend runs at: `http://localhost:8000`
Interactive API docs: `http://localhost:8000/docs`

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

Frontend runs at: `http://localhost:3000`

### Database

The SQLite database (`backend/feedback.db`) is created automatically when the backend starts for the first time. No manual setup required.

---

## API Reference

See [docs/API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md) for the full endpoint reference with request/response examples.

### Quick Reference

| Method | Endpoint                    | Description                              |
|--------|-----------------------------|------------------------------------------|
| GET    | `/feedback`                 | Get all feedback records                 |
| GET    | `/feedback/{id}`            | Get a single feedback record             |
| POST   | `/feedback`                 | Submit new feedback                      |
| PUT    | `/feedback/{id}`            | Update an existing feedback record       |
| DELETE | `/feedback/{id}`            | Delete a feedback record                 |
| GET    | `/search`                   | Search/filter feedback                   |
| POST   | `/etl/upload`               | Upload CSV/Excel and run ETL pipeline    |
| GET    | `/etl/runs`                 | Get ETL run history                      |
| GET    | `/etl/analytics`            | Get overall analytics summary            |
| GET    | `/etl/analytics/programs`   | Get per-program analytics                |
| GET    | `/etl/report/download`      | Download feedback as CSV report          |

---

## Screenshots

- Phase 1: [screenshots/](screenshots/)
- Phase 2: [screenshots_phase2/](screenshots_phase2/) — see [screenshots_phase2/README.md](screenshots_phase2/README.md) for a description of each screenshot

---

## Testing

Test the API using the auto-generated Swagger UI at `http://localhost:8000/docs`, or use the sample data file at `data/sample_feedback.csv` to test the ETL import flow via the Import Data page.
