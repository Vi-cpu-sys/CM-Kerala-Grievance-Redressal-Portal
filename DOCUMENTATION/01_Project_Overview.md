# 01. Project Overview: Kerala CMO Public Grievance Redressal Portal

> **Recruitment Prototype Notice:** This prototype is created for the WhiteMatrix technical assessment. It is a simulation and not affiliated with or endorsed by the Government of Kerala or the Chief Minister's Office.

---

## 1. Executive Summary
The **Public Grievance Redressal Portal (Chief Minister's Office, Kerala)** is a unified, full-stack, AI-assisted civic governance platform. It allows citizens across all 14 districts of Kerala to register complaints, receive automated departmental triage via LLMs, track progress through an immutable milestone state machine, and evaluate resolution quality with formal reopen rights.

## 2. Core Problem Statement
Traditional grievance mechanisms suffer from:
1. **Misrouted Complaints:** Citizens often do not know which of the 12+ government departments (e.g., PWD vs. LSGD vs. KWA) holds legal jurisdiction over an issue.
2. **Duplication of Work:** Multiple citizens in the same ward file identical complaints for a single burst water main or road crater, clogging administrative queues.
3. **Lack of Enforceable SLA:** Grievances linger indefinitely without transparent escalation or accountability.
4. **Bureaucratic Dead-Ends:** Complaints are marked "resolved" on paper without physical verification or citizen satisfaction checks.

## 3. High-Impact Engineering Solutions Delivered
- **AI-Powered Triage Assistant:** Employs Gemini AI with strict JSON schema outputs to automatically categorize complaints, assign responsible departments, determine urgency, and craft a 40-word executive summary.
- **Built-in Resilient Fallback:** 100% offline keyword/TF-IDF classifier ensures zero downtime even during API key absence or network timeout (8-second cap).
- **Proactive Duplicate Detection:** Analyzes existing open grievances within the same district and category to warn citizens before submission.
- **Deterministic State Machine:** Server-authoritative transitions with strict HTTP 409 conflict validation preventing arbitrary status changes.
- **Role-Based Access Control (RBAC):** Distinct interfaces and data scoping for Citizens, CMO Administrators, and Department Officers.
- **Citizen Privacy Guard:** Public tracking endpoints scrub Personally Identifiable Information (PII) including phone numbers, emails, and internal remarks.
- **Citizen Reopen Authority:** Allows citizens to reopen resolved grievances if ground reality remains unaddressed.

## 4. Key Stakeholders & Role Matrix

| Stakeholder Role | Primary Functions | Access Scope |
| :--- | :--- | :--- |
| **Citizen (`citizen`)** | File grievances, track status, view public remarks, review Action Taken Report, rate satisfaction (1-5 stars), request reopen. | Personal grievances only; public tracking view. |
| **CMO Admin (`cmo_admin`)** | High-level KPI monitoring, triage verification, assigning departments/officers, adding confidential internal remarks, escalating overdue SLAs, approving resolutions. | Statewide view across all 14 districts and 12 departments. |
| **Department Officer (`dept_officer`)** | Field inspection, update work progress to "In Progress", author and upload Action Taken Reports (ATR) to CMO. | Restricted strictly to their assigned department. |
| **Public Visitor** | Public home portal, view departments, track grievance by Reference Number (stripped of personal PII). | Public pages and sanitized tracking. |
