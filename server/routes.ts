import express, { Request, Response, Router } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { aiService } from './aiService';
import { AuthenticatedRequest, authenticateToken, comparePassword, generateToken, hashPassword, requireRoles } from './auth';
import { KERALA_DISTRICTS } from './data/constants';
import { db } from './db';
import { validateStatusTransition } from './stateMachine';
import { GrievancePriority, GrievanceStatus, UserRole } from './types';

export const apiRouter = Router();

// Multer config for file upload (memory storage, max 2MB, jpg/png/pdf only)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
  fileFilter: (_req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and PDF files under 2 MB are accepted.'));
    }
  }
});

// ==========================================
// 1. AUTHENTICATION ENDPOINTS
// ==========================================

const RegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  mobile: z.string().regex(/^[0-9+ -]{10,15}$/, 'Invalid mobile phone number'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['citizen', 'dept_officer', 'cmo_admin']).default('citizen'),
  department_id: z.number().int().optional().nullable()
});

apiRouter.post('/auth/register', async (req: Request, res: Response) => {
  try {
    const validated = RegisterSchema.parse(req.body);

    const existing = await db.getUserByEmail(validated.email);
    if (existing) {
      return res.status(400).json({ error: 'An account with this email address already exists.' });
    }

    const password_hash = await hashPassword(validated.password);
    const user = await db.createUser({
      name: validated.name,
      email: validated.email,
      mobile: validated.mobile,
      password_hash,
      role: validated.role as UserRole,
      department_id: validated.department_id || null
    });

    const token = generateToken(user);

    return res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        department_id: user.department_id
      }
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.issues.map(e => e.message).join(', ') });
    }
    return res.status(500).json({ error: err.message || 'Registration failed' });
  }
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

apiRouter.post('/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = LoginSchema.parse(req.body);

    const user = await db.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isValid = await comparePassword(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = generateToken(user);

    return res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        department_id: user.department_id
      }
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.issues.map(e => e.message).join(', ') });
    }
    return res.status(500).json({ error: err.message || 'Login failed' });
  }
});

apiRouter.post('/auth/logout', authenticateToken, (_req: Request, res: Response) => {
  return res.json({ message: 'Logged out successfully' });
});

apiRouter.get('/auth/me', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const user = await db.getUserById(req.user!.userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  return res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      role: user.role,
      department_id: user.department_id
    }
  });
});

// ==========================================
// 2. METADATA: DEPARTMENTS & DISTRICTS
// ==========================================

apiRouter.get('/departments', async (_req: Request, res: Response) => {
  const departments = await db.getDepartments();
  return res.json({ departments });
});

apiRouter.get('/districts', (_req: Request, res: Response) => {
  return res.json({ districts: KERALA_DISTRICTS });
});

// ==========================================
// 3. AI GRIEVANCE ASSISTANT
// ==========================================

const AIAnalyzeSchema = z.object({
  description: z.string().min(10, 'Description must be at least 10 characters'),
  district: z.string().optional()
});

apiRouter.post('/ai/analyze', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { description, district } = AIAnalyzeSchema.parse(req.body);

    const departments = await db.getDepartments();
    const openGrievances = await db.getOpenGrievancesForDuplicateCheck();

    const analysis = await aiService.analyzeGrievance(
      description,
      district,
      departments,
      openGrievances
    );

    return res.json(analysis);
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.issues.map(e => e.message).join(', ') });
    }
    return res.status(500).json({ error: err.message || 'AI analysis failed' });
  }
});

// ==========================================
// 4. GRIEVANCES (CRUD & ROLE-SCOPED)
// ==========================================

// Citizen Submit Grievance (supports multipart or JSON with optional attachment)
apiRouter.post(
  '/grievances',
  authenticateToken,
  requireRoles('citizen', 'cmo_admin'),
  (req, res, next) => {
    upload.single('attachment')(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ error: 'Attachment file size exceeds 2 MB limit.' });
        }
        return res.status(400).json({ error: err.message });
      } else if (err) {
        return res.status(400).json({ error: err.message });
      }
      next();
    });
  },
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const {
        district,
        category,
        subject,
        description,
        priority,
        ai_suggested_department_id,
        ai_category,
        ai_priority,
        ai_summary,
        ai_provider,
        ai_confidence,
        ai_accepted
      } = req.body;

      if (!district || !category || !subject || !description) {
        return res.status(400).json({ error: 'District, category, subject, and description are required.' });
      }

      let fileAttachment = null;
      if (req.file) {
        fileAttachment = {
          filename: req.file.originalname,
          mime: req.file.mimetype,
          size: req.file.size,
          data: req.file.buffer
        };
      } else if (req.body.attachment_base64 && req.body.attachment_filename) {
        // Base64 JSON support
        fileAttachment = {
          filename: req.body.attachment_filename,
          mime: req.body.attachment_mime || 'application/octet-stream',
          size: req.body.attachment_size || 1024,
          data: Buffer.from(req.body.attachment_base64, 'base64')
        };
      }

      const grievance = await db.createGrievance({
        citizen_id: req.user!.userId,
        district,
        category,
        subject,
        description,
        priority: (priority as GrievancePriority) || 'Medium',
        ai_suggested_department_id: ai_suggested_department_id ? Number(ai_suggested_department_id) : null,
        ai_category: ai_category || null,
        ai_priority: ai_priority || null,
        ai_summary: ai_summary || null,
        ai_provider: ai_provider || null,
        ai_confidence: ai_confidence ? Number(ai_confidence) : null,
        ai_accepted: ai_accepted === 'true' || ai_accepted === true,
        attachment: fileAttachment
      });

      return res.status(201).json({
        message: 'Grievance submitted successfully',
        reference_no: grievance.reference_no,
        grievance
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to submit grievance' });
    }
  }
);

// Get Grievances (Role-scoped with filters, search, pagination)
apiRouter.get('/grievances', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { role, userId, departmentId } = req.user!;
    const { status, district, category, priority, search, overdue, page, limit } = req.query;

    const result = await db.getGrievances({
      role,
      userId,
      departmentId,
      status: status as string,
      district: district as string,
      category: category as string,
      priority: priority as string,
      search: search as string,
      overdueOnly: overdue === 'true',
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20
    });

    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to retrieve grievances' });
  }
});

// Get Grievance by ID
apiRouter.get('/grievances/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' });

    const grievance = await db.getGrievanceById(id);
    if (!grievance) {
      return res.status(404).json({ error: 'Grievance not found' });
    }

    // Role-based visibility guard
    const { role, userId, departmentId } = req.user!;
    if (role === 'citizen' && grievance.citizen_id !== userId) {
      return res.status(403).json({ error: 'Access denied. You can only view your own grievances.' });
    }
    if (role === 'dept_officer') {
      const matchDept = grievance.department_id === departmentId || grievance.ai_suggested_department_id === departmentId;
      if (!matchDept) {
        return res.status(403).json({ error: 'Access denied. Grievance belongs to a different department.' });
      }
    }

    // Citizens should never see internal remarks
    if (role === 'citizen') {
      delete grievance.internal_remarks;
    }

    return res.json({ grievance });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 5. PUBLIC TRACKING (NO PERSONAL PII)
// ==========================================

apiRouter.get('/track/:referenceNo', async (req: Request, res: Response) => {
  try {
    const refNo = req.params.referenceNo;
    const trackingData = await db.getPublicTrackingData(refNo);

    if (!trackingData) {
      return res.status(404).json({
        error: `No grievance found matching reference number '${refNo}'. Please verify the reference ID.`
      });
    }

    return res.json({ tracking: trackingData });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 6. WORKFLOW & STATE MACHINE TRANSITIONS
// ==========================================

const StatusUpdateSchema = z.object({
  status: z.enum(['Submitted', 'Under Review', 'In Progress', 'Action Submitted', 'Resolved']),
  remark: z.string().optional()
});

apiRouter.patch(
  '/grievances/:id/status',
  authenticateToken,
  requireRoles('cmo_admin', 'dept_officer'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { status: toStatus, remark } = StatusUpdateSchema.parse(req.body);

      const existing = await db.getGrievanceById(id);
      if (!existing) {
        return res.status(404).json({ error: 'Grievance not found' });
      }

      // Check state machine validity
      const transition = validateStatusTransition(existing.status, toStatus, req.user!.role);
      if (!transition.valid) {
        return res.status(409).json({ error: transition.reason });
      }

      const currentUser = await db.getUserById(req.user!.userId);
      const updated = await db.updateGrievanceStatus(
        id,
        toStatus as GrievanceStatus,
        remark || `Status changed to ${toStatus}`,
        currentUser!
      );

      return res.json({ message: 'Status updated successfully', grievance: updated });
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ error: err.issues.map(e => e.message).join(', ') });
      }
      return res.status(500).json({ error: err.message });
    }
  }
);

// Assign Department & Officer (CMO Only)
const AssignSchema = z.object({
  department_id: z.number().int(),
  officer_id: z.number().int().optional().nullable(),
  instructions: z.string().default('Immediate action and ATR required.')
});

apiRouter.post(
  '/grievances/:id/assign',
  authenticateToken,
  requireRoles('cmo_admin'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { department_id, officer_id, instructions } = AssignSchema.parse(req.body);

      const cmoAdmin = await db.getUserById(req.user!.userId);
      const updated = await db.assignGrievance(id, department_id, officer_id || null, instructions, cmoAdmin!);

      return res.json({ message: 'Grievance assigned successfully', grievance: updated });
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ error: err.issues.map(e => e.message).join(', ') });
      }
      return res.status(500).json({ error: err.message });
    }
  }
);

// Escalate Overdue Grievance (CMO Only)
apiRouter.post(
  '/grievances/:id/escalate',
  authenticateToken,
  requireRoles('cmo_admin'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const reason = req.body.reason || 'Escalated by CMO due to SLA breach.';

      const cmoAdmin = await db.getUserById(req.user!.userId);
      const updated = await db.escalateGrievance(id, cmoAdmin!, reason);

      return res.json({ message: 'Grievance escalated successfully', grievance: updated });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
);

// Submit Action Taken Report (Officer Only)
const ActionReportSchema = z.object({
  report: z.string().min(10, 'Action Taken Report must be at least 10 characters')
});

apiRouter.post(
  '/grievances/:id/action-report',
  authenticateToken,
  requireRoles('dept_officer'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { report } = ActionReportSchema.parse(req.body);

      const grievance = await db.getGrievanceById(id);
      if (!grievance) return res.status(404).json({ error: 'Grievance not found' });

      if (grievance.department_id !== req.user!.departmentId && grievance.ai_suggested_department_id !== req.user!.departmentId) {
        return res.status(403).json({ error: 'Access denied. You can only submit ATR for your department.' });
      }

      const officer = await db.getUserById(req.user!.userId);
      const updated = await db.submitActionReport(id, report, officer!);

      return res.json({ message: 'Action Taken Report submitted to CMO', grievance: updated });
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ error: err.issues.map(e => e.message).join(', ') });
      }
      return res.status(500).json({ error: err.message });
    }
  }
);

// Internal Remarks (CMO Only)
apiRouter.post(
  '/grievances/:id/remarks',
  authenticateToken,
  requireRoles('cmo_admin'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { remark } = req.body;
      if (!remark) return res.status(400).json({ error: 'Remark is required' });

      const cmoAdmin = await db.getUserById(req.user!.userId);
      const saved = await db.addInternalRemark(id, cmoAdmin!, remark);

      return res.status(201).json({ message: 'Internal remark recorded', remark: saved });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
);

// Feedback & Reopen (Citizen Only)
const FeedbackSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
  reopen_requested: z.boolean().default(false)
});

apiRouter.post(
  '/grievances/:id/feedback',
  authenticateToken,
  requireRoles('citizen'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { rating, comment, reopen_requested } = FeedbackSchema.parse(req.body);

      const grievance = await db.getGrievanceById(id);
      if (!grievance) return res.status(404).json({ error: 'Grievance not found' });

      if (grievance.citizen_id !== req.user!.userId) {
        return res.status(403).json({ error: 'You can only provide feedback on your own grievances.' });
      }

      const result = await db.submitFeedback(
        id,
        req.user!.userId,
        rating,
        comment || '',
        reopen_requested
      );

      return res.json({
        message: reopen_requested
          ? 'Grievance reopened and sent to CMO Under Review.'
          : 'Thank you for your feedback.',
        ...result
      });
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ error: err.issues.map(e => e.message).join(', ') });
      }
      return res.status(500).json({ error: err.message });
    }
  }
);

// ==========================================
// 7. ATTACHMENT STREAMING
// ==========================================

apiRouter.get('/attachments/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const attachment = await db.getAttachment(id);
    if (!attachment) {
      return res.status(404).json({ error: 'Attachment not found' });
    }

    const buffer = typeof attachment.data === 'string'
      ? Buffer.from(attachment.data, 'base64')
      : attachment.data || Buffer.from('SAMPLE_ATTACHMENT');

    res.setHeader('Content-Type', attachment.mime);
    res.setHeader('Content-Disposition', `inline; filename="${attachment.filename}"`);
    return res.send(buffer);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 8. PUBLIC & CMO STATS
// ==========================================

apiRouter.get('/stats/public', async (_req: Request, res: Response) => {
  try {
    const stats = await db.getCmoStats();
    return res.json({
      kpi: {
        total: stats.kpi.total,
        pending: stats.kpi.pending,
        resolved: stats.kpi.resolved,
        resolutionRate: stats.kpi.resolutionRate
      }
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

apiRouter.get('/cmo/stats', authenticateToken, requireRoles('cmo_admin'), async (_req: Request, res: Response) => {
  try {
    const stats = await db.getCmoStats();
    return res.json(stats);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 9. PUBLIC CONTACT ENQUIRY
// ==========================================

const ContactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  subject: z.string().min(3),
  message: z.string().min(10)
});

apiRouter.post('/contact', async (req: Request, res: Response) => {
  try {
    const data = ContactSchema.parse(req.body);
    const enquiry = await db.saveContactEnquiry(data);
    return res.status(201).json({
      message: 'Your enquiry has been received. Our helpdesk will respond via email within 2 business days.',
      enquiry
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.issues.map(e => e.message).join(', ') });
    }
    return res.status(500).json({ error: err.message });
  }
});
