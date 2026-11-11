# 03. Database Design: Kerala CMO Grievance Redressal Portal

## 1. Entity-Relationship (ER) Diagram

```mermaid
erDiagram
    DEPARTMENTS ||--o{ USERS : "has officers"
    DEPARTMENTS ||--o{ GRIEVANCES : "ai_suggested_department"
    DEPARTMENTS ||--o{ DEPARTMENT_ASSIGNMENTS : "assigned_to"
    USERS ||--o{ GRIEVANCES : "files as citizen"
    USERS ||--o{ GRIEVANCE_HISTORY : "changed_by"
    USERS ||--o{ DEPARTMENT_ASSIGNMENTS : "assigned_by / officer_id"
    USERS ||--o{ INTERNAL_REMARKS : "authored_by"
    USERS ||--o{ FEEDBACK : "submitted_by"
    GRIEVANCES ||--o{ GRIEVANCE_HISTORY : "audit_trail"
    GRIEVANCES ||--o{ DEPARTMENT_ASSIGNMENTS : "department_action"
    GRIEVANCES ||--o{ ATTACHMENTS : "supporting_files"
    GRIEVANCES ||--o| FEEDBACK : "citizen_evaluation"
    GRIEVANCES ||--o{ INTERNAL_REMARKS : "cmo_confidential_notes"

    DEPARTMENTS {
        int id PK
        varchar name
        text description
        varchar slug UK
    }

    USERS {
        int id PK
        varchar name
        varchar email UK
        varchar mobile
        varchar password_hash
        varchar role
        int department_id FK
        timestamp created_at
    }

    GRIEVANCES {
        int id PK
        varchar reference_no UK
        int citizen_id FK
        varchar district
        varchar category
        varchar subject
        text description
        varchar priority
        varchar status
        int ai_suggested_department_id FK
        varchar ai_category
        varchar ai_priority
        text ai_summary
        varchar ai_provider
        numeric ai_confidence
        boolean ai_accepted
        int duplicate_of FK
        timestamp due_date
        boolean escalated
        timestamp created_at
        timestamp updated_at
    }

    GRIEVANCE_HISTORY {
        int id PK
        int grievance_id FK
        varchar from_status
        varchar to_status
        text remark
        int changed_by FK
        varchar changed_by_role
        timestamp created_at
    }

    DEPARTMENT_ASSIGNMENTS {
        int id PK
        int grievance_id FK
        int department_id FK
        int officer_id FK
        int assigned_by FK
        text instructions
        text action_taken_report
        timestamp submitted_to_cmo_at
        timestamp created_at
    }

    ATTACHMENTS {
        int id PK
        int grievance_id FK
        varchar filename
        varchar mime
        int size
        bytea data
        int uploaded_by FK
        timestamp created_at
    }

    FEEDBACK {
        int id PK
        int grievance_id FK
        int citizen_id FK
        int rating
        text comment
        boolean reopen_requested
        timestamp created_at
    }

    INTERNAL_REMARKS {
        int id PK
        int grievance_id FK
        int author_id FK
        text remark
        timestamp created_at
    }

    CONTACT_ENQUIRIES {
        int id PK
        varchar name
        varchar email
        varchar subject
        text message
        timestamp created_at
    }
```

## 2. Table Specifications & Constraints

### `departments`
Stores participating government bodies.
- `id`: Serial primary key
- `name`: Full official departmental title (e.g. `Public Works Department (PWD)`)
- `slug`: Unique shortcode (`pwd`, `kwa`, `kseb`, etc.)

### `users`
Multi-role user registry.
- `role`: Restricted to `citizen`, `cmo_admin`, or `dept_officer`.
- `password_hash`: Bcrypt hashed string with salt factor 10.
- `department_id`: Non-null for `dept_officer`, references `departments(id)`.

### `grievances`
Core complaint records.
- `reference_no`: Unique sequential alphanumeric ID formatted as `CMK-2026-XXXXXX`.
- `priority`: `Low` (14 days SLA), `Medium` (7 days SLA), `High` (3 days SLA).
- `status`: Enforced state `Submitted`, `Under Review`, `In Progress`, `Action Submitted`, or `Resolved`.
- `due_date`: Calculated upon creation based on priority SLA.
- `ai_accepted`: Boolean flag recording whether citizen/CMO confirmed the AI suggestion.

### `grievance_history`
Append-only immutable audit trail.
- Every status transition writes a new row containing previous status, target status, remark, changed_by user, and role.

### `attachments`
Stores proof photographs and documents.
- `data`: Stored as `BYTEA` in PostgreSQL, enabling stateless container deployment without ephemeral disk data loss.
- Max file size: 2 MB. Accepted MIME types: `image/jpeg`, `image/png`, `application/pdf`.

### `feedback`
Post-resolution evaluation.
- `rating`: Integer 1 to 5 stars.
- `reopen_requested`: Boolean trigger that transitions resolved cases back to `Under Review`.

## 3. Database Indexes
```sql
CREATE INDEX idx_grievances_ref_no ON grievances(reference_no);
CREATE INDEX idx_grievances_status ON grievances(status);
CREATE INDEX idx_grievances_district ON grievances(district);
CREATE INDEX idx_grievances_category ON grievances(category);
CREATE INDEX idx_grievances_dept ON grievances(ai_suggested_department_id);
CREATE INDEX idx_history_grievance ON grievance_history(grievance_id);
CREATE INDEX idx_dept_assignments_grievance ON department_assignments(grievance_id);
```
