import assert from 'node:assert/strict';
import test from 'node:test';
import { Grievance } from '../../src/types';
import { formatGrievanceReportData } from '../../src/utils/pdfReport';

test('PDF Report Formatting Utilities', async (t) => {
  await t.test('formatGrievanceReportData correctly maps and structures tabular data', () => {
    const mockGrievances: Grievance[] = [
      {
        id: 1,
        reference_no: 'CMK-2026-000101',
        citizen_id: 14,
        citizen_name: 'Ananya Menon',
        district: 'Ernakulam',
        category: 'Potholes & Road Damage',
        subject: 'Severe potholes and missing asphalt near MG Road Metro Pillar 420',
        description: 'Road craters causing traffic hazards.',
        priority: 'High',
        status: 'In Progress',
        ai_accepted: true,
        due_date: new Date(Date.now() + 86400000).toISOString(),
        escalated: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        department_name: 'Public Works Department (PWD)'
      },
      {
        id: 2,
        reference_no: 'CMK-2026-000102',
        citizen_id: 15,
        citizen_name: 'Pranav Nair',
        district: 'Kozhikode',
        category: 'Pipeline Leakage & Burst',
        subject: 'Main 300mm drinking water supply line burst near Mavoor Road junction',
        description: 'Water pipeline burst.',
        priority: 'Medium',
        status: 'Submitted',
        ai_accepted: true,
        due_date: new Date(Date.now() - 86400000 * 2).toISOString(), // overdue
        escalated: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        department_name: 'Kerala Water Authority (KWA)'
      }
    ];

    const formatted = formatGrievanceReportData(mockGrievances);

    assert.equal(formatted.length, 2);

    // Row 1 checks
    assert.equal(formatted[0][0], '1'); // Index
    assert.equal(formatted[0][1], 'CMK-2026-000101'); // Ref
    assert.match(formatted[0][2], /Ananya Menon/); // Citizen
    assert.match(formatted[0][2], /Ernakulam/); // District
    assert.match(formatted[0][3], /Potholes & Road Damage/); // Category
    assert.equal(formatted[0][4], 'Public Works Department'); // Shortened dept
    assert.match(formatted[0][5], /High \(!\)/); // High priority alert marker
    assert.equal(formatted[0][6], 'In Progress');

    // Row 2 checks (Overdue detection)
    assert.equal(formatted[1][0], '2');
    assert.equal(formatted[1][1], 'CMK-2026-000102');
    assert.match(formatted[1][7], /\[OVERDUE\]/);
  });
});
