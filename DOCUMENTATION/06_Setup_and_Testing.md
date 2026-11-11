# 06. Setup and Testing Guide: Kerala CMO Grievance Redressal Portal

## 1. Quick Start (Local Development)

### Prerequisites
- Node.js 20+ / 22+
- npm 10+
- (Optional) PostgreSQL database instance or Neon / Supabase connection URL.

### Installation
```bash
# Clone repository
git clone <repo_url>
cd kerala-cmo-grievance-portal

# Install all dependencies
npm install

# Setup environment variables
cp .env.example .env
```

### Configure Environment Variables (`.env`)
```env
PORT=3000
NODE_ENV=development
JWT_SECRET=kerala-cmo-secret-key-2026
GEMINI_API_KEY=YOUR_GEMINI_API_KEY

# Optional: Real PostgreSQL database
DATABASE_URL=postgres://user:password@host:5432/neondb?sslmode=require
# If DATABASE_URL is left empty, the portal runs automatically on an embedded store pre-seeded with 40 grievances and 12 departments.
```

### Running the Application
```bash
# Start full-stack development server on port 3000
npm run dev

# Or start with production build
npm run build
npm start
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 2. Automated Test Suite

Run the full end-to-end integration and unit test suite with:
```bash
npm test
```

### Test Case Verification Table

| # | Test Scenario | Verified Behavior | Status |
| :--- | :--- | :--- | :--- |
| **1** | Health Check (`GET /health`) | Returns `status: ok`, version, and uptime | **PASS** |
| **2** | Citizen Registration & Login | Registers new user, signs JWT, verifies token upon login | **PASS** |
| **3** | CMO Admin Authentication | Logs in with seeded admin credentials, role verified as `cmo_admin` | **PASS** |
| **4** | Officer Authentication | Logs in with seeded officer credentials, verifies `department_id` | **PASS** |
| **5** | Role Access Denied (Citizen on CMO) | Citizen calling `/api/v1/cmo/stats` rejected with `403 Forbidden` | **PASS** |
| **6** | CMO Stats Access | Admin retrieves full KPI aggregates and district/department arrays | **PASS** |
| **7** | State Machine 409 Conflict | Transitioning `Submitted` directly to `Resolved` rejected with `409` | **PASS** |
| **8** | State Machine Transition Unit | Verifies allowed transition graph and role restrictions | **PASS** |
| **9** | Reference Number Generation | Sequential IDs generated following format `CMK-2026-XXXXXX` | **PASS** |
| **10**| Attachment Mime Type Rejection | Rejecting non-permitted files (`.exe`, scripts) with `400 Bad Request` | **PASS** |
| **11**| AI Fallback Classifier | Fallback keyword classifier maps road/water terms accurately | **PASS** |
| **12**| PII Sanitization | Strips phone numbers, emails, and Aadhaar numbers from input | **PASS** |
| **13**| Public Tracking Privacy | Strips citizen name, mobile, email, and internal remarks from public track | **PASS** |
| **14**| Officer Department Isolation | Officers rejected with `403` when submitting ATR for other departments | **PASS** |
