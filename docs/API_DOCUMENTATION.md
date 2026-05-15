# API Documentation — Feedback Management System

Base URL: `http://localhost:8000`

Interactive docs (Swagger UI): `http://localhost:8000/docs`

---

## Endpoints

### 1. Get All Feedback

**GET** `/feedback`

Returns all feedback records ordered by submission date (newest first).

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

**Path Parameter**

| Parameter    | Type    | Description     |
|--------------|---------|-----------------|
| feedback_id  | integer | Feedback record ID |

**Response 200**
```json
{
  "feedback_id": 1,
  "participant_name": "Alice Johnson",
  "program_name": "Python Bootcamp",
  "rating": 5,
  "comments": "Excellent content and delivery.",
  "submitted_at": "2026-05-14T10:30:00"
}
```

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

| Field            | Type    | Required | Constraints      |
|------------------|---------|----------|------------------|
| participant_name | string  | Yes      | —                |
| program_name     | string  | Yes      | —                |
| rating           | integer | Yes      | 1 – 5            |
| comments         | string  | No       | —                |

**Response 201**
```json
{
  "feedback_id": 2,
  "participant_name": "Bob Smith",
  "program_name": "React Workshop",
  "rating": 4,
  "comments": "Very hands-on and practical.",
  "submitted_at": "2026-05-15T09:00:00"
}
```

---

### 4. Update Feedback

**PUT** `/feedback/{feedback_id}`

Updates an existing feedback record. All fields are optional — only provided fields are updated.

**Path Parameter**

| Parameter    | Type    | Description        |
|--------------|---------|--------------------|
| feedback_id  | integer | Feedback record ID |

**Request Body**
```json
{
  "rating": 5,
  "comments": "Updated: truly outstanding program."
}
```

**Response 200**
```json
{
  "feedback_id": 2,
  "participant_name": "Bob Smith",
  "program_name": "React Workshop",
  "rating": 5,
  "comments": "Updated: truly outstanding program.",
  "submitted_at": "2026-05-15T09:00:00"
}
```

**Response 404**
```json
{ "detail": "Feedback not found" }
```

---

### 5. Delete Feedback

**DELETE** `/feedback/{feedback_id}`

**Path Parameter**

| Parameter    | Type    | Description        |
|--------------|---------|--------------------|
| feedback_id  | integer | Feedback record ID |

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

Searches and filters feedback. All query parameters are optional and combinable.

**Query Parameters**

| Parameter    | Type    | Description                                          |
|--------------|---------|------------------------------------------------------|
| keyword      | string  | Case-insensitive search across name, program, comments |
| rating       | integer | Exact rating match (1–5)                             |
| program_name | string  | Case-insensitive program name match                  |

**Example Request**

```
GET /search?keyword=python&rating=5
```

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

## Error Responses

| Status | Meaning                        |
|--------|--------------------------------|
| 200    | OK — request succeeded         |
| 201    | Created — resource created     |
| 404    | Not Found — record missing     |
| 422    | Unprocessable Entity — validation error |
| 500    | Internal Server Error          |

---

## Data Model

### Feedback

| Field            | Type     | Constraints                    |
|------------------|----------|--------------------------------|
| feedback_id      | integer  | Primary key, auto-increment    |
| participant_name | string   | Required                       |
| program_name     | string   | Required                       |
| rating           | integer  | Required, 1–5                  |
| comments         | text     | Optional                       |
| submitted_at     | datetime | Auto-set on creation (UTC)     |
