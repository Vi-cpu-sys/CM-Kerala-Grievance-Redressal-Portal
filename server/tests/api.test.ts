import assert from 'node:assert/strict';
import test from 'node:test';
import request from 'supertest';
import { createApp } from '../../server';
import { fallbackKeywordClassifier, sanitizePII } from '../aiService';
import { db } from '../db';
import { validateStatusTransition } from '../stateMachine';

test('CMO Kerala Grievance Redressal Portal Test Suite', async (t) => {
  const app = await createApp();

  // Test 1: Health check
  await t.test('GET /health returns 200 OK', async () => {
    const res = await request(app).get('/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'ok');
  });

  // Test 2: User Register & Login
  let citizenToken = '';
  let cmoToken = '';
  let officerToken = '';

  await t.test('POST /api/v1/auth/register and /api/v1/auth/login works for citizen', async () => {
    const testEmail = `citizen_test_${Date.now()}@test.com`;
    const regRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Test Citizen User',
        email: testEmail,
        mobile: '+919876543210',
        password: 'Password@2026',
        role: 'citizen'
      });

    assert.equal(regRes.status, 201);
    assert.ok(regRes.body.token);
    assert.equal(regRes.body.user.role, 'citizen');

    // Login with same credentials
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: testEmail,
        password: 'Password@2026'
      });

    assert.equal(loginRes.status, 200);
    assert.ok(loginRes.body.token);
    citizenToken = loginRes.body.token;
  });

  // Test 3: Log in as CMO Admin
  await t.test('POST /api/v1/auth/login with CMO admin credentials', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'cmo.admin@kerala.gov.fake',
        password: 'Admin@CMO2026'
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.user.role, 'cmo_admin');
    cmoToken = res.body.token;
  });

  // Test 4: Log in as PWD Officer
  await t.test('POST /api/v1/auth/login with PWD Officer credentials', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'pwd.officer@kerala.gov.fake',
        password: 'Officer@PWD2026'
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.user.role, 'dept_officer');
    assert.equal(res.body.user.department_id, 1);
    officerToken = res.body.token;
  });

  // Test 5: Role access control (RBAC): Citizen blocked from CMO route
  await t.test('Citizen cannot access CMO stats (403 Forbidden)', async () => {
    const res = await request(app)
      .get('/api/v1/cmo/stats')
      .set('Authorization', `Bearer ${citizenToken}`);

    assert.equal(res.status, 403);
    assert.match(res.body.error, /Access denied/);
  });

  // Test 6: CMO Admin can access CMO stats
  await t.test('CMO Admin can access /api/v1/cmo/stats', async () => {
    const res = await request(app)
      .get('/api/v1/cmo/stats')
      .set('Authorization', `Bearer ${cmoToken}`);

    assert.equal(res.status, 200);
    assert.ok(res.body.kpi);
    assert.ok(Array.isArray(res.body.districtWise));
    assert.ok(Array.isArray(res.body.departmentWise));
  });

  // Test 7: State machine invalid transition rejected with 409 Conflict
  await t.test('State machine rejects invalid transition with 409 Conflict', async () => {
    // Grievance 1 is in 'Submitted' status in seed data
    const res = await request(app)
      .patch('/api/v1/grievances/1/status')
      .set('Authorization', `Bearer ${cmoToken}`)
      .send({
        status: 'Resolved', // Invalid: Submitted cannot jump directly to Resolved
        remark: 'Attempting invalid jump'
      });

    assert.equal(res.status, 409);
    assert.match(res.body.error, /Invalid state transition/);
  });

  // Test 8: State machine unit validation logic
  await t.test('validateStatusTransition enforces strictly allowed graph', () => {
    // Submitted -> Under Review: Valid
    assert.equal(validateStatusTransition('Submitted', 'Under Review', 'cmo_admin').valid, true);

    // Submitted -> Resolved: Invalid
    assert.equal(validateStatusTransition('Submitted', 'Resolved', 'cmo_admin').valid, false);

    // Resolved -> Under Review (Reopen by Citizen): Valid
    assert.equal(validateStatusTransition('Resolved', 'Under Review', 'citizen').valid, true);

    // Resolved -> Under Review (Reopen by Officer): Invalid (only citizen/CMO can reopen)
    assert.equal(validateStatusTransition('Resolved', 'Under Review', 'dept_officer').valid, false);
  });

  // Test 9: Reference Number Uniqueness
  await t.test('Reference numbers generated are unique and follow CMK-2026-XXXXXX', async () => {
    const sub1 = await request(app)
      .post('/api/v1/grievances')
      .set('Authorization', `Bearer ${citizenToken}`)
      .field('district', 'Ernakulam')
      .field('category', 'Potholes & Road Damage')
      .field('subject', 'Test Road Issue 1')
      .field('description', 'Pothole description for test case 1')
      .field('priority', 'High');

    const sub2 = await request(app)
      .post('/api/v1/grievances')
      .set('Authorization', `Bearer ${citizenToken}`)
      .field('district', 'Kozhikode')
      .field('category', 'Pipeline Leakage & Burst')
      .field('subject', 'Test Water Issue 2')
      .field('description', 'Pipeline burst description for test case 2')
      .field('priority', 'Medium');

    assert.equal(sub1.status, 201);
    assert.equal(sub2.status, 201);
    assert.notEqual(sub1.body.reference_no, sub2.body.reference_no);
    assert.match(sub1.body.reference_no, /^CMK-2026-\d{6}$/);
    assert.match(sub2.body.reference_no, /^CMK-2026-\d{6}$/);
  });

  // Test 10: File rejection on invalid mime type
  await t.test('File upload rejects invalid file mime types', async () => {
    const res = await request(app)
      .post('/api/v1/grievances')
      .set('Authorization', `Bearer ${citizenToken}`)
      .field('district', 'Ernakulam')
      .field('category', 'Potholes & Road Damage')
      .field('subject', 'File Upload Test')
      .field('description', 'Testing upload filter rejection')
      .attach('attachment', Buffer.from('console.log("bad")'), {
        filename: 'script.exe',
        contentType: 'application/x-msdownload'
      });

    assert.equal(res.status, 400);
    assert.match(res.body.error, /Only JPEG, PNG, and PDF files/);
  });

  // Test 11: AI Fallback Path
  await t.test('Fallback keyword classifier functions with 100% accuracy on standard departments', () => {
    const departments = [
      { id: 1, name: 'Public Works Department (PWD)' },
      { id: 5, name: 'Kerala Water Authority (KWA)' }
    ];

    const result = fallbackKeywordClassifier('Deep dangerous potholes and broken road tarring on the highway', departments);
    assert.equal(result.department_id, 1);
    assert.equal(result.priority, 'High'); // 'danger' triggers High priority
    assert.ok(result.confidence > 0.5);

    const waterResult = fallbackKeywordClassifier('Drinking water pipeline burst and tap leakage in our street', departments);
    assert.equal(waterResult.department_id, 5);
  });

  // Test 12: PII Sanitization
  await t.test('sanitizePII strips phone numbers, emails, and Aadhaar numbers', () => {
    const input = 'Call citizen at +91 9847112233 or email user@test.com with Aadhaar 1234 5678 9012 about the issue';
    const sanitized = sanitizePII(input);

    assert.ok(!sanitized.includes('9847112233'));
    assert.ok(!sanitized.includes('user@test.com'));
    assert.ok(!sanitized.includes('1234 5678 9012'));
    assert.ok(sanitized.includes('[REDACTED_PHONE]'));
    assert.ok(sanitized.includes('[REDACTED_EMAIL]'));
    assert.ok(sanitized.includes('[REDACTED_AADHAAR]'));
  });

  // Test 13: Public Track endpoint hides citizen personal data & internal remarks
  await t.test('Public track endpoint hides citizen personal PII and internal remarks', async () => {
    const res = await request(app).get('/api/v1/track/CMK-2026-000101');
    assert.equal(res.status, 200);
    assert.ok(res.body.tracking);
    assert.equal(res.body.tracking.reference_no, 'CMK-2026-000101');

    // Sensitive citizen personal details MUST BE UNDEFINED
    assert.equal(res.body.tracking.citizen_name, undefined);
    assert.equal(res.body.tracking.citizen_mobile, undefined);
    assert.equal(res.body.tracking.citizen_id, undefined);
    assert.equal(res.body.tracking.internal_remarks, undefined);
  });

  // Test 14: Officer department isolation
  await t.test('Officer cannot submit Action Taken Report on grievances from other departments', async () => {
    // PWD officer (dept 1) tries to submit ATR on grievance 2 (KWA, dept 5)
    const res = await request(app)
      .post('/api/v1/grievances/2/action-report')
      .set('Authorization', `Bearer ${officerToken}`)
      .send({
        report: 'Action taken report submitted by wrong department officer'
      });

    assert.equal(res.status, 403);
    assert.match(res.body.error, /You can only submit ATR for your department/);
  });
});
