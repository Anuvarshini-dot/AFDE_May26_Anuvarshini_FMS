# Feedback Management System (FMS)

A full-stack web application for collecting, managing, and analyzing participant feedback for training programs and events.

---

## Project Overview

The Feedback Management System allows program coordinators to:
- Collect structured feedback from participants
- View analytics such as average rating and sentiment
- Search and filter feedback by keyword, program, or rating
- Perform full CRUD operations on feedback records

---

## Features Implemented

- Submit feedback with participant name, program name, rating (1–5), and comments
- Dashboard with total count, average rating, and recent feedback
- Full list view with search by keyword, program name, and rating filter
- Detail view with inline edit and delete with confirmation
- Responsive UI with color-coded rating badges
- RESTful API with proper HTTP methods and status codes

---

## Technology Stack

| Layer     | Technology              |
|-----------|-------------------------|
| Frontend  | React 18, React Router  |
| Backend   | FastAPI (Python)        |
| Database  | SQLite via SQLAlchemy   |
| HTTP      | Axios                   |
| Server    | Uvicorn (ASGI)          |

---

## Project Structure

```
feedback-management-system/
├── frontend/               React SPA
│   ├── src/
│   │   ├── components/     Reusable components (Navbar)
│   │   ├── pages/          Route-level page components
│   │   └── services/       Axios API client
│   └── public/
├── backend/                FastAPI application
│   ├── routers/            API route handlers
│   ├── main.py             App entry point
│   ├── models.py           SQLAlchemy ORM models
│   ├── schemas.py          Pydantic schemas
│   ├── crud.py             Database operations
│   └── database.py         DB connection setup
├── database/               Schema scripts
│   └── schema.sql          SQLite DDL
├── screenshots/            UI and API screenshots
├── docs/                   Additional documentation
│   └── API_DOCUMENTATION.md
├── requirements.txt        Python dependencies
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

# Start the backend server
cd backend
uvicorn main:app --reload
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

### Database Setup

The SQLite database (`feedback.db`) is created automatically when the backend starts for the first time.

To recreate the schema manually:

```bash
sqlite3 backend/feedback.db < database/schema.sql
```

---

## API Details

See [docs/API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md) for the full endpoint reference with request/response examples.

### Quick Reference

| Method | Endpoint                  | Description              |
|--------|---------------------------|--------------------------|
| GET    | `/feedback`               | Get all feedback         |
| GET    | `/feedback/{id}`          | Get single feedback      |
| POST   | `/feedback`               | Create new feedback      |
| PUT    | `/feedback/{id}`          | Update feedback          |
| DELETE | `/feedback/{id}`          | Delete feedback          |
| GET    | `/search`                 | Search/filter feedback   |

---

## Screenshots

Screenshots are stored in the [screenshots/](screenshots/) folder.

---

## Running Tests

Test the API using the auto-generated Swagger UI at `http://localhost:8000/docs` or import the endpoints into Postman.
