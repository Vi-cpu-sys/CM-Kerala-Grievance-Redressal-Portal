# Public Grievance Redressal Portal — Chief Minister's Office (CMO), Kerala

> **Recruitment Prototype Notice:** Recruitment prototype developed for the **WhiteMatrix** technical assessment. Fictional sample data only. Not affiliated with or endorsed by the Government of Kerala or the Chief Minister's Office.

---

## 🏛️ Project Overview
A complete, production-grade, full-stack recruitment prototype of a **Public Grievance Redressal Portal** for the fictional Chief Minister's Office (CMO), Kerala scenario. 

The system features:
1. **Intelligent AI Grievance Assistant:** Built with Gemini AI (`gemini-2.5-flash`) for real-time categorization, 40-word executive summarization, and jurisdiction routing across 12 Kerala departments, paired with a resilient 100% offline keyword/TF-IDF fallback classifier.
2. **Deterministic State Machine:** Server-authoritative transitions with strict HTTP 409 conflict enforcement (`Submitted` -> `Under Review` -> `In Progress` -> `Action Submitted` -> `Resolved` -> `Reopen`).
3. **Proactive Duplicate Detection:** Text similarity checks against active complaints in the same district and category to prevent administrative duplication.
4. **Enforceable Citizen Charter SLAs:** Automated overdue flags (High 3d, Medium 7d, Low 14d) and direct CMO escalation controls.
5. **Role-Based Access Control (RBAC):** Distinct authenticated workspaces for **Citizens**, **CMO Administrators**, and **Department Officers**.
6. **Citizen Privacy Guard:** Public tracking endpoints scrub personal contact details (name, email, mobile) and internal CMO remarks.
7. **Citizen Feedback & Reopen Rights:** Citizens rate resolution satisfaction (1–5 stars) and hold the authority to reopen cases back to `Under Review`.

---

## 🔑 Demo Credentials Table

An **Evaluator Quick-Switch Toolbar** is mounted at the very top of every page for instant single-click role switching. Alternatively, use these pre-seeded accounts:

| Role | Name | Email | Password | Department Scope |
| :--- | :--- | :--- | :--- | :--- |
| **CMO Administrator** | Dr. K. Sreekumar IAS | `cmo.admin@kerala.gov.fake` | `Admin@CMO2026` | Statewide (All 14 Districts & 12 Departments) |
| **Department Officer** | Er. Rajesh V. (Executive Engineer) | `pwd.officer@kerala.gov.fake` | `Officer@PWD2026` | Public Works Department (PWD) |
| **Citizen (Default)** | Ananya Menon | `citizen.kerala@test.com` | `Citizen@Kerala2026` | Ernakulam District (Own Grievances) |
| **Citizen (Second)** | Pranav Nair | `pranav.citizen@test.com` | `Password@2026` | Kozhikode District |
| **Citizen (Third)** | Devika Kurup | `devika.citizen@test.com` | `Password@2026` | Thiruvananthapuram District |

*All other 11 departmental officers use password `Password@2026` with emails formatted as `<dept-slug>.officer@kerala.gov.fake` (e.g. `kseb.officer@kerala.gov.fake`, `kwa.officer@kerala.gov.fake`, etc.).*

---

## 🚀 Quick Start (Local Setup)

```bash
# 1. Install dependencies
npm install

# 2. Configure environment (embedded DB works out-of-the-box if DATABASE_URL is blank)
cp .env.example .env

# 3. Run development server (Express backend + Vite middleware on Port 3000)
npm run dev

# 4. Run test suite (14 end-to-end unit and integration test cases)
npm test

# 5. Production build & start
npm run build
npm start
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## ☁️ Deployment Guide (Render + Neon PostgreSQL)

This monorepo is architected for single-service deployment where Express serves the compiled React SPA:

### Option A: Render Infrastructure as Code (`render.yaml`)
1. Connect your repository to **Render**.
2. Render automatically detects `render.yaml`:
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Environment Variables:**
     - `NODE_ENV`: `production`
     - `PORT`: `3000`
     - `JWT_SECRET`: Automatic cryptographically secure secret
     - `GEMINI_API_KEY`: *(Optional)* Your Gemini API key (portal falls back seamlessly to internal keyword engine if omitted)
     - `DATABASE_URL`: *(Optional)* PostgreSQL connection string from Neon / Supabase / Render Postgres

### Option B: Neon / Supabase Database Provisioning
To run against real PostgreSQL:
1. Create a free PostgreSQL instance on [Neon](https://neon.tech) or [Supabase](https://supabase.com).
2. Execute `/db/schema.sql` to initialize tables and indexes.
3. (Optional) Execute `/db/seed.sql` for sample data.
4. Set `DATABASE_URL=postgres://...` in `.env` or Render environment settings.

---

## 📁 Repository & Documentation Layout
```
/README.md                                # Master overview, credentials, quick start, tools disclosure
/.env.example                             # Environment variable templates
/render.yaml                              # Render web service deployment spec
/DOCUMENTATION/
├── 01_Project_Overview.md                # Vision, core problems, stakeholder matrix
├── 02_System_Architecture.md             # Full architecture, layers, and Mermaid architecture diagram
├── 03_Database_Design.md                 # Complete schema, index strategy, and Mermaid ER diagram
├── 04_API_Documentation.md               # REST API spec with request & response JSON examples
├── 05_AI_Integration.md                  # Model, prompt engineering, safeguards, PII scrubbing, fallback
├── 06_Setup_and_Testing.md               # Setup steps, test case results table
└── 07_User_Guide.md                      # Step-by-step walkthroughs for Citizen, CMO, and Officer
/server/                                  # Express REST API, auth middleware, AI service, state machine
/server/tests/api.test.ts                 # End-to-end Node test runner & supertest suite
/db/
├── schema.sql                            # Production PostgreSQL table definitions, constraints, indexes
└── seed.sql                              # Initial seed data for departments and users
/src/                                     # React 19 + Tailwind CSS frontend application
```

---

## 🛠️ Tools Used (Mandatory Disclosure)

In strict adherence to the assessment instructions, here is the complete and honest disclosure of tools and technologies used to build this prototype:

1. **AI Coding Assistant:** Claude / Google AI Studio Build Assistant (assisted with architecture scaffolding, state machine logic, frontend design system, documentation, and unit test generation).
2. **LLM API & Provider:** Google GenAI TypeScript SDK (`@google/genai`) invoking model `gemini-2.5-flash` for automated complaint categorization, 40-word summarization, and priority assessment, coupled with a local rule-based/TF-IDF keyword fallback classifier.
3. **Frontend Stack:** React 19, React Router 7, Tailwind CSS v4, Lucide React icons, Recharts (analytics charts).
4. **Backend Stack:** Node.js 22, Express 4.21, Zod 4 (schema validation), BcryptJS (password hashing), JsonWebToken (stateless authentication), Multer (file validation & memory buffering), Helmet (HTTP security headers), CORS.
5. **Database:** PostgreSQL (Neon / Supabase compatible) via `pg.Pool`, with an embedded in-memory SQL fallback store for 100% functional standalone preview.
6. **Testing & QA:** Node.js built-in test runner (`node:test`, `node:assert/strict`) via `npx tsx --test`, Supertest for REST API testing, and Playwright CLI for headless browser visual verification.
7. **Hosting:** Prepared for single-service Render deployment (`render.yaml`) and Google Cloud Run.
