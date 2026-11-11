# 04. REST API Documentation: Kerala CMO Grievance Redressal Portal

Base URL: `/api/v1`

---

## 1. Authentication Endpoints

### `POST /auth/register`
Registers a new citizen profile.
- **Access:** Public
- **Request Body:**
```json
{
  "name": "Ananya Menon",
  "email": "ananya.menon@example.com",
  "mobile": "+919847112233",
  "password": "Password@2026",
  "role": "citizen"
}
```
- **Response (201 Created):**
```json
{
  "message": "Registration successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 14,
    "name": "Ananya Menon",
    "email": "ananya.menon@example.com",
    "role": "citizen"
  }
}
```

### `POST /auth/login`
Authenticates a user and returns a signed JWT token.
- **Access:** Public
- **Request Body:**
```json
{
  "email": "cmo.admin@kerala.gov.fake",
  "password": "Admin@CMO2026"
}
```
- **Response (200 OK):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "Dr. K. Sreekumar IAS",
    "email": "cmo.admin@kerala.gov.fake",
    "role": "cmo_admin"
  }
}
```

---

## 2. AI Grievance Assistant

### `POST /ai/analyze`
Calls the LLM or fallback keyword engine with prompt-injection defenses and PII sanitization.
- **Access:** Authenticated (`citizen`, `cmo_admin`)
- **Request Body:**
```json
{
  "description": "Severe dangerous potholes on MG Road Ernakulam between metro pillar 420 and 428 causing accidents.",
  "district": "Ernakulam"
}
```
- **Response (200 OK):**
```json
{
  "category": "Potholes & Road Damage",
  "department_id": 1,
  "department_name": "Public Works Department (PWD)",
  "priority": "High",
  "summary": "Hazardous road craters on MG Road Ernakulam near metro pillars causing two-wheeler accidents.",
  "confidence": 0.96,
  "reasoning": "Road surface craters and traffic hazards fall under PWD highway jurisdiction.",
  "is_emergency": false,
  "possible_duplicates": [
    {
      "reference_no": "CMK-2026-000101",
      "subject": "Deep craters on MG Road Ernakulam",
      "similarity": 0.85
    }
  ],
  "provider": "gemini-2.5-flash",
  "latency_ms": 642
}
```

---

## 3. Grievances Management

### `POST /grievances` (Multipart / JSON)
Submits a new grievance with optional file attachment.
- **Access:** Authenticated (`citizen`, `cmo_admin`)
- **Headers:** `Authorization: Bearer <TOKEN>`, `Content-Type: multipart/form-data`
- **Fields:**
  - `district`: `"Ernakulam"`
  - `category`: `"Potholes & Road Damage"`
  - `subject`: `"Deep craters on MG Road near Metro Pillar 420"`
  - `description`: `"Dangerous potholes causing water accumulation..."`
  - `priority`: `"High"`
  - `attachment`: Binary file (optional, max 2MB)
- **Response (201 Created):**
```json
{
  "message": "Grievance submitted successfully",
  "reference_no": "CMK-2026-000146",
  "grievance": {
    "id": 46,
    "reference_no": "CMK-2026-000146",
    "status": "Submitted",
    "due_date": "2026-11-14T05:50:00.000Z"
  }
}
```

### `GET /grievances`
Role-scoped list of grievances with multi-parameter filtering and pagination.
- **Access:** Authenticated
- **Query Params:** `status`, `district`, `category`, `priority`, `search`, `overdue=true`, `page`, `limit`
- **Response (200 OK):**
```json
{
  "items": [
    {
      "id": 1,
      "reference_no": "CMK-2026-000101",
      "subject": "Deep craters on MG Road near Metro Pillar 420",
      "district": "Ernakulam",
      "priority": "High",
      "status": "In Progress",
      "is_overdue": false
    }
  ],
  "total": 42,
  "page": 1,
  "totalPages": 3
}
```

---

## 4. Public Tracking Endpoint

### `GET /track/:referenceNo`
Publicly available milestone tracker. **Strictly strips citizen PII and confidential remarks.**
- **Access:** Public (no auth required)
- **Response (200 OK):**
```json
{
  "tracking": {
    "id": 1,
    "reference_no": "CMK-2026-000101",
    "district": "Ernakulam",
    "category": "Potholes & Road Damage",
    "subject": "Deep craters on MG Road near Metro Pillar 420",
    "description": "Hazardous craters on the main carriageway...",
    "priority": "High",
    "status": "In Progress",
    "department_name": "Public Works Department (PWD)",
    "due_date": "2026-11-14T10:00:00.000Z",
    "is_overdue": false,
    "escalated": false,
    "history": [
      {
        "from_status": null,
        "to_status": "Submitted",
        "remark": "Grievance submitted by citizen via portal.",
        "changed_by_role": "citizen",
        "created_at": "2026-11-09T10:00:00.000Z"
      },
      {
        "from_status": "Submitted",
        "to_status": "In Progress",
        "remark": "Assigned to Public Works Department (PWD) by CMO.",
        "changed_by_role": "cmo_admin",
        "created_at": "2026-11-09T14:00:00.000Z"
      }
    ]
  }
}
```

---

## 5. Workflow State Machine Endpoints

### `PATCH /grievances/:id/status`
Updates status via the state machine. Rejects invalid transitions with `409 Conflict`.
- **Access:** Authenticated (`cmo_admin`, `dept_officer`)
- **Request Body:**
```json
{
  "status": "Under Review",
  "remark": "CMO cell opened grievance for assessment."
}
```
- **Error Response (409 Conflict) on illegal transition:**
```json
{
  "error": "Invalid state transition from 'Submitted' to 'Resolved'. Allowed transitions: Under Review"
}
```

### `POST /grievances/:id/assign`
Assigns department and officer with binding instructions.
- **Access:** Authenticated (`cmo_admin`)
- **Request Body:**
```json
{
  "department_id": 1,
  "instructions": "Execute urgent asphalt patching within 48 hours."
}
```

### `POST /grievances/:id/action-report`
Submits the official Action Taken Report (ATR) and moves status to `Action Submitted`.
- **Access:** Authenticated (`dept_officer`)
- **Request Body:**
```json
{
  "report": "Field engineer completed hot mix bitumen patching on MG Road. Road is now traffic safe."
}
```

### `POST /grievances/:id/feedback`
Submits citizen evaluation or requests case reopen.
- **Access:** Authenticated (`citizen`)
- **Request Body (Reopen Scenario):**
```json
{
  "rating": 1,
  "comment": "Potholes were only filled with loose sand and washed away in the rain. Issue not resolved.",
  "reopen_requested": true
}
```
- **Response (200 OK):**
```json
{
  "message": "Grievance reopened and sent to CMO Under Review.",
  "grievance": {
    "status": "Under Review"
  }
}
```

---

## 6. Analytical & Public Endpoints

### `GET /cmo/stats`
Returns aggregated counts for KPI cards and Recharts visualizations.
- **Access:** Authenticated (`cmo_admin`)

### `POST /contact`
Submits public enquiry saved to `contact_enquiries`.
- **Access:** Public
- **Request Body:** `{ "name": "...", "email": "...", "subject": "...", "message": "..." }`

### `GET /health`
Returns system operational status, version, and uptime.
- **Access:** Public
