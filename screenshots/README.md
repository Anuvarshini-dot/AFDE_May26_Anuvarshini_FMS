# Screenshots

This folder contains screenshots of the Feedback Management System (FMS) application.

---

## 01 — Role Selection Page
**File:** `01_login_page.png`

The landing page shown when the application is first opened. The user selects their role before entering the system.

- **Admin** — Access to Dashboard and All Feedback (with edit and delete)
- **User** — Access to Dashboard, All Feedback (view only), and Submit Feedback

---

## 02 — Dashboard Page
**File:** `02_Dashboard_page.png`

The main dashboard displayed after selecting a role. Shows:

- **Total Feedback** count and **Overall Rating** summary cards at the top
- **Program-wise Feedback** section with individual cards per program, each showing feedback count, average rating, and a star bar
- **Recent Feedback** table listing the latest submissions with participant name, program, rating badge, and date

---

## 03 — Admin: All Feedback Tab
**File:** `03_Admin_feedback_tab.png`

The All Feedback page as seen by an **Admin**. Includes:

- Search bar to filter by keyword in comments
- Filter by program name and rating dropdown
- Feedback table with columns: ID, Participant, Program, Rating, Comments, Date, and Action (View link)
- Admin role indicator and Switch Role button in the sidebar

---

## 04 — Admin: Feedback Detail View
**File:** `04_Admin_feedback_view_page.png`

The Feedback Details page as seen by an **Admin**. Displays full details of a single feedback record:

- Feedback ID, Participant Name, Program Name, Rating badge, Comments, and Submitted At timestamp
- **Edit** and **Delete** action buttons visible in the top-right corner (Admin only)
- Back to Feedback List link at the bottom

---

## 05 — User: Feedback Detail View
**File:** `05_User_feedback_view_page.png`

The same Feedback Details page as seen by a **User**. Displays the same information but:

- **Edit and Delete buttons are hidden** — read-only view
- User role indicator shown in the sidebar
- All three navigation links visible: Dashboard, All Feedback, Submit Feedback

---

## 06 — User: Submit Feedback Page
**File:** `06_User_submit_feedback_page.png`

The Submit Feedback form available to **Users**. Fields include:

- Participant Name (required)
- Training / Event / Product Name (required)
- Rating — dropdown from 1 (Poor) to 5 (Excellent) (required)
- Comments — optional text area
- Submit Feedback button

---

## 07 — Swagger UI (API Documentation)
**File:** `07_Swagger_UI.png`

The auto-generated FastAPI Swagger UI accessible at `http://localhost:8000/docs`. Lists all available backend API endpoints:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/feedback` | Get all feedback records |
| POST | `/feedback` | Create a new feedback record |
| GET | `/feedback/{feedback_id}` | Get a single feedback by ID |
| PUT | `/feedback/{feedback_id}` | Update a feedback record |
| DELETE | `/feedback/{feedback_id}` | Delete a feedback record |
| GET | `/search` | Search feedback by keyword, rating, or program |
| GET | `/` | Root health check |
