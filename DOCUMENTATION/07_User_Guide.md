# 07. User & Operational Guide: Kerala CMO Grievance Redressal Portal

This guide provides end-to-end instructions for testing all user journeys in the prototype.

---

## 1. Quick Evaluator Switcher
At the top of every screen, an **Evaluator Quick Switch** toolbar is visible:
- Click **"Citizen (Ananya)"** to act as a citizen.
- Click **"CMO Admin (IAS)"** to open the Chief Minister's Office command center.
- Click **"PWD Officer (Er. Rajesh)"** to act as a department executive engineer.

---

## 2. Citizen Journey: Filing & Tracking a Grievance

### Step 1: File a Grievance
1. Click **"Submit Grievance"** in the top navigation or home hero.
2. Select District (e.g., *Ernakulam*).
3. Select Priority (e.g., *High Priority*).
4. Enter Subject: `Dangerous open trench along MG Road near Metro Pillar 425`.
5. Enter Description: `A 4-foot deep trench opened by utility contractors has no safety barricades or warning lamps. Water logged during rain makes it invisible.`
6. Click **"Analyze with AI"**:
   - The AI Assistant panel analyzes the description.
   - Shows suggested department: *Public Works Department (PWD)*.
   - Shows suggested category: *Potholes & Road Damage* or *Bridge Safety & Repair*.
   - Generates a concise ≤40-word summary and calculates confidence.
   - Flags possible duplicates if existing complaints exist in Ernakulam.
7. Click **"Accept Suggestions"** to auto-populate the form fields.
8. (Optional) Attach a photo or PDF (under 2 MB).
9. Click **"Submit Grievance to CMO"**.
10. A modal appears displaying your new reference number (e.g., `CMK-2026-000146`). Click the **Copy** button.

### Step 2: Track Your Grievance (Public Tracking)
1. Go to **"Track Grievance"** in the top navigation.
2. Paste the reference number into the input box and click **"Track Grievance"**.
3. View the public status, assigned department, SLA due date, and audit trail timeline.
4. Notice that **no personal data** (your name, email, phone number) is visible to the public.

### Step 3: Citizen Dashboard & Reopening Resolved Grievances
1. Click on **"Citizen Dashboard"**.
2. Click on a grievance in **"Resolved"** status (or Grievance `CMK-2026-000103`).
3. Scroll to the **"Citizen Satisfaction & Reopen Option"** card.
4. Select a star rating (e.g., 2 stars), enter a comment: `The trench was only covered with loose sand; water leak is recurring.`
5. Check the box: **"Request REOPEN (The physical problem was not resolved by the department)"**.
6. Click **"Submit Feedback & Reopen Grievance"**.
7. The grievance state transitions back to **"Under Review"** with the citizen comment logged in the audit trail.

---

## 3. CMO Administrator Journey: Supervision & Directives

### Step 1: Command Center Overview
1. Log in or click **"CMO Admin (IAS)"** on the top toolbar.
2. Navigate to `/cmo` or click **"CMO Dashboard"**.
3. Review the high-level KPI cards:
   - Total Grievances
   - Pending / In Progress
   - Successfully Resolved
   - SLA Overdue (highlighted in red)
   - CMO Escalated
4. Review the analytical charts:
   - District-wise distribution
   - Current status breakdown
   - Department workload vs resolution
   - Monthly trend line

### Step 2: Triage & Assign Department
1. In the **Master Grievances Registry** table, find a grievance with status **"Submitted"** (or use the status filter).
2. Click **"Manage"**.
3. In the modal:
   - Review citizen statement, attached files, and AI recommendation card.
   - Click **"Set Under Review"** to formally acknowledge the complaint.
   - Select the target department (e.g., *Public Works Department (PWD)*) and input executive instructions: `Immediate site inspection and Action Taken Report required within 48h.`
   - Click **"Forward to Department (Set In Progress)"**.
   - Status updates immediately to **"In Progress"** with history logged.

### Step 3: Escalate an Overdue Grievance
1. Check the box **"Show SLA Overdue Only"** in the table filters.
2. Click **"Manage"** on an overdue grievance.
3. Click **"Escalate Priority"** under CMO Directive Controls.
4. The grievance is marked with a purple **"CMO Escalated"** badge and the escalation order is permanently recorded in the audit trail.

### Step 4: Review ATR & Mark Resolved
1. Filter status to **"Action Submitted"**.
2. Click **"Manage"** on a grievance where the officer has submitted an Action Taken Report.
3. Read the officer's report under **"Department Action Taken Report (ATR)"**.
4. Click **"Mark as Resolved"**.
5. Status changes to **"Resolved"**, closing the official SLA clock and prompting the citizen for feedback.

### Step 5: Add Confidential Internal Remark
1. In any grievance modal, scroll to **"Add Confidential Internal Remark"**.
2. Type a note: `Special Chief Secretary inspection scheduled for this site next Tuesday.`
3. Click **"Save Remark"**.
4. The note is preserved strictly for CMO visibility and is hidden from citizens.

---

## 4. Department Officer Journey: Field Action & ATR

### Step 1: View Department Cases
1. Click **"PWD Officer (Er. Rajesh)"** on the top toolbar.
2. Navigate to `/officer`.
3. Notice that the dashboard strictly displays grievances assigned to the officer's department (*Public Works Department*).

### Step 2: Submit Action Taken Report (ATR)
1. Find a grievance with status **"In Progress"** or **"Under Review"**.
2. Click **"Action & Submit ATR"**.
3. If in *Under Review*, click **"Start In Progress"** to log field mobilization.
4. In the **Submit Official Action Taken Report (ATR)** text area, type:
   `Site team deployed cold-mix asphalt patch over 40 sq meters. Leveled with roller and opened for normal traffic.`
5. Click **"Submit ATR to CMO"**.
6. The status transitions to **"Action Submitted"** and moves to the CMO desk for final resolution approval.
