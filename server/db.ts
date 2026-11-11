import bcrypt from 'bcryptjs';
import pg from 'pg';
import { INITIAL_DEPARTMENTS, KERALA_DISTRICTS } from './data/constants';
import { calculateDueDate, isOverdue } from './stateMachine';
import {
  Attachment,
  ContactEnquiry,
  Department,
  DepartmentAssignment,
  Feedback,
  Grievance,
  GrievanceHistory,
  GrievancePriority,
  GrievanceStatus,
  InternalRemark,
  User,
  UserRole
} from './types';

const { Pool } = pg;

export class DatabaseService {
  private pool: pg.Pool | null = null;
  private isUsingPostgres = false;

  // In-memory persistent collections
  private departments: Department[] = [];
  private users: User[] = [];
  private grievances: Grievance[] = [];
  private history: GrievanceHistory[] = [];
  private assignments: DepartmentAssignment[] = [];
  private attachments: Attachment[] = [];
  private feedbackList: Feedback[] = [];
  private contactEnquiries: ContactEnquiry[] = [];
  private internalRemarks: InternalRemark[] = [];

  private nextGrievanceSeq = 145; // Starts after seed

  constructor() {
    this.init();
  }

  private async init() {
    const dbUrl = process.env.DATABASE_URL;
    if (dbUrl && dbUrl.trim() !== '') {
      try {
        this.pool = new Pool({
          connectionString: dbUrl,
          ssl: dbUrl.includes('localhost') ? false : { rejectUnauthorized: false }
        });
        const client = await this.pool.connect();
        client.release();
        this.isUsingPostgres = true;
        console.log('Connected successfully to PostgreSQL database.');
        return;
      } catch (err) {
        console.warn('PostgreSQL connection failed, falling back to embedded database store:', (err as Error).message);
        this.isUsingPostgres = false;
      }
    }
    // Initialize embedded database with rich seed data
    this.seedEmbeddedData();
  }

  private seedEmbeddedData() {
    // 1. Seed 12 Departments
    this.departments = INITIAL_DEPARTMENTS.map(d => ({ ...d }));

    // Pre-computed bcrypt hash for 'Password@2026'
    // To ensure exact match, we hash synchronously or keep a verified hash:
    const defaultPasswordHash = bcrypt.hashSync('Password@2026', 10);
    const adminPasswordHash = bcrypt.hashSync('Admin@CMO2026', 10);
    const officerPasswordHash = bcrypt.hashSync('Officer@PWD2026', 10);
    const citizenPasswordHash = bcrypt.hashSync('Citizen@Kerala2026', 10);

    // 2. Seed Users
    // 1 CMO Admin
    this.users.push({
      id: 1,
      name: 'Dr. K. Sreekumar IAS (Principal Secretary)',
      email: 'cmo.admin@kerala.gov.fake',
      mobile: '+919447000001',
      password_hash: adminPasswordHash,
      role: 'cmo_admin',
      department_id: null,
      created_at: new Date(Date.now() - 30 * 86400000).toISOString()
    });

    // 12 Officers (1 per department)
    const officerNames = [
      'Er. Rajesh V. (Executive Engineer - PWD)',
      'Dr. Mini George (District Medical Officer)',
      'Smt. Latha K. (Deputy Director Education)',
      'Er. Vinod Kumar (Asst Executive Engineer - KSEB)',
      'Er. Haridas P. (Assistant Engineer - KWA)',
      'Shri. Suresh Babu (LSGD Panchayat Secretary)',
      'Shri. Mathew Thomas (Tahsildar - Revenue)',
      'Inspector Jayachandran K. (Circle Inspector)',
      'Shri. Abdul Rasheed (District Transport Officer)',
      'Smt. Bindu R. (Assistant Director Agriculture)',
      'Shri. Manoj K. (District Social Justice Officer)',
      'Smt. Preetha Nair (Taluk Supply Officer)'
    ];

    const officerEmails = [
      'pwd.officer@kerala.gov.fake',
      'health.officer@kerala.gov.fake',
      'education.officer@kerala.gov.fake',
      'kseb.officer@kerala.gov.fake',
      'kwa.officer@kerala.gov.fake',
      'lsgd.officer@kerala.gov.fake',
      'revenue.officer@kerala.gov.fake',
      'police.officer@kerala.gov.fake',
      'transport.officer@kerala.gov.fake',
      'agri.officer@kerala.gov.fake',
      'social.officer@kerala.gov.fake',
      'civilsupplies.officer@kerala.gov.fake'
    ];

    for (let i = 0; i < 12; i++) {
      this.users.push({
        id: i + 2,
        name: officerNames[i],
        email: officerEmails[i],
        mobile: `+9194470000${(i + 2).toString().padStart(2, '0')}`,
        password_hash: i === 0 ? officerPasswordHash : defaultPasswordHash,
        role: 'dept_officer',
        department_id: i + 1,
        created_at: new Date(Date.now() - 25 * 86400000).toISOString()
      });
    }

    // 3 Citizens
    const citizenUsers: User[] = [
      {
        id: 14,
        name: 'Ananya Menon',
        email: 'citizen.kerala@test.com',
        mobile: '+919847112233',
        password_hash: citizenPasswordHash,
        role: 'citizen',
        department_id: null,
        created_at: new Date(Date.now() - 20 * 86400000).toISOString()
      },
      {
        id: 15,
        name: 'Pranav Nair',
        email: 'pranav.citizen@test.com',
        mobile: '+919847445566',
        password_hash: defaultPasswordHash,
        role: 'citizen',
        department_id: null,
        created_at: new Date(Date.now() - 15 * 86400000).toISOString()
      },
      {
        id: 16,
        name: 'Devika Kurup',
        email: 'devika.citizen@test.com',
        mobile: '+919847778899',
        password_hash: defaultPasswordHash,
        role: 'citizen',
        department_id: null,
        created_at: new Date(Date.now() - 10 * 86400000).toISOString()
      }
    ];
    this.users.push(...citizenUsers);

    // 3. Generate 40 Rich Fictional Grievances
    const grievanceTemplates = [
      {
        district: 'Ernakulam',
        deptId: 1,
        category: 'Potholes & Road Damage',
        subject: 'Severe potholes and missing asphalt near MG Road Metro Pillar 420',
        desc: 'Deep craters on the main carriageway have caused three two-wheeler accidents this week. Water accumulates during evening rains, making the potholes invisible to night commuters.',
        priority: 'High' as GrievancePriority,
        status: 'In Progress' as GrievanceStatus,
        daysAgo: 2,
        dueDaysOffset: 1,
        escalated: false,
        summary: 'Dangerous road craters on MG Road near Metro Pillar 420 causing traffic hazards and night accidents.',
        confidence: 0.96
      },
      {
        district: 'Kozhikode',
        deptId: 5,
        category: 'Pipeline Leakage & Burst',
        subject: 'Main 300mm drinking water supply line burst near Mavoor Road junction',
        desc: 'Treated drinking water has been gushing onto the road since yesterday morning. Over 300 families in surrounding wards are facing zero water pressure.',
        priority: 'High' as GrievancePriority,
        status: 'Submitted' as GrievanceStatus,
        daysAgo: 1,
        dueDaysOffset: 2,
        escalated: false,
        summary: 'Burst drinking water pipeline along Mavoor Road causing localized road flooding and severe residential water outage.',
        confidence: 0.94
      },
      {
        district: 'Thiruvananthapuram',
        deptId: 4,
        category: 'Sagging Overhead Power Lines',
        subject: 'Dangerous low-hanging 11kV electrical line near Kowdiar school gate',
        desc: 'Following thunderstorms, an overhead HT cable has sagged below 9 feet right above the pedestrian footpath used daily by schoolchildren.',
        priority: 'High' as GrievancePriority,
        status: 'Resolved' as GrievanceStatus,
        daysAgo: 6,
        dueDaysOffset: -3,
        escalated: false,
        summary: 'Urgent electrical hazard: sagging 11kV line near Kowdiar school footpath requires immediate restringing.',
        confidence: 0.98,
        atr: 'KSEB Section Office Kowdiar replaced damaged insulator cross-arm and re-tensioned 11kV line to safe height of 18 feet. Inspected by Asst Engineer.',
        feedbackRating: 5,
        feedbackComment: 'Prompt response within 24 hours. Cable safely tensioned.'
      },
      {
        district: 'Thrissur',
        deptId: 2,
        category: 'Hospital Medicine Shortage',
        subject: 'Essential antivenom and rabies vaccine stockout at Taluk Hospital Wadakkanchery',
        desc: 'Patients arriving with dog bite injuries were turned away due to lack of antirabies immunoglobulin. Duty medical officer redirected patients 25km away to Medical College.',
        priority: 'High' as GrievancePriority,
        status: 'Under Review' as GrievanceStatus,
        daysAgo: 4,
        dueDaysOffset: -1, // OVERDUE
        escalated: true,
        summary: 'Critical shortage of emergency rabies vaccine and antivenom at Wadakkanchery Taluk Hospital.',
        confidence: 0.95
      },
      {
        district: 'Palakkad',
        deptId: 10,
        category: 'Flood Crop Damage Compensation',
        subject: 'Delayed crop loss relief for Alathur paddy farmers affected by flash floods',
        desc: 'Over 80 hectares of harvested paddy submerged in July flash rains. Joint inspection was completed 4 months ago by Krishi Bhavan, but sanctioned compensation has not been credited.',
        priority: 'Medium' as GrievancePriority,
        status: 'In Progress' as GrievanceStatus,
        daysAgo: 10,
        dueDaysOffset: -3, // OVERDUE
        escalated: true,
        summary: 'Uncredited crop compensation for Alathur paddy farmers following verified flood loss inspection.',
        confidence: 0.91
      },
      {
        district: 'Malappuram',
        deptId: 3,
        category: 'School Infrastructure Damage',
        subject: 'Collapsed boundary wall and leaky roof in GLPS Tirur campus',
        desc: 'During monsoon, rear boundary wall of the Government Lower Primary School collapsed near adjacent pond. Classrooms in Grade 2 block leak heavily.',
        priority: 'High' as GrievancePriority,
        status: 'Action Submitted' as GrievanceStatus,
        daysAgo: 5,
        dueDaysOffset: -2,
        escalated: false,
        summary: 'Safety risk at GLPS Tirur due to collapsed perimeter wall near water body and roof leaks.',
        confidence: 0.92,
        atr: 'Executive engineer completed technical estimate (₹3.4 Lakhs). Temporary safety fencing installed; repair works tendered under Plan Fund.'
      },
      {
        district: 'Kollam',
        deptId: 6,
        category: 'Uncollected Municipal Solid Waste',
        subject: 'Illegal dumping and non-collection of garbage along Asramam Link Road',
        desc: 'Commercial plastic waste and food refuse dumped along wetland corridor. Stray dogs and foul stench make evening walking impossible.',
        priority: 'Medium' as GrievancePriority,
        status: 'Submitted' as GrievanceStatus,
        daysAgo: 3,
        dueDaysOffset: 4,
        escalated: false,
        summary: 'Commercial waste dumping along Asramam Link Road wetland causing environmental and public health hazard.',
        confidence: 0.88
      },
      {
        district: 'Alappuzha',
        deptId: 5,
        category: 'Contaminated Drinking Water',
        subject: 'Muddy and foul-smelling tap water in Kuttanad Champakulam ward',
        desc: 'For the past 6 days, pipeline tap water has a dark brownish tint with mud sediment. Multiple families suspect pipeline intrusion from backwaters.',
        priority: 'High' as GrievancePriority,
        status: 'In Progress' as GrievanceStatus,
        daysAgo: 2,
        dueDaysOffset: 1,
        escalated: false,
        summary: 'Muddy contaminated piped water in Champakulam backwater sector posing acute enteric infection risk.',
        confidence: 0.94
      },
      {
        district: 'Kottayam',
        deptId: 7,
        category: 'Land Title Deed (Pattayam) Delay',
        subject: 'Pending Pattayam issuance for 1980 settler families in Meenachil taluk',
        desc: 'File No. LR-2023-8874 has been pending in Taluk office for 14 months despite revenue adalat approval by Land Board.',
        priority: 'Medium' as GrievancePriority,
        status: 'Under Review' as GrievanceStatus,
        daysAgo: 5,
        dueDaysOffset: 2,
        escalated: false,
        summary: 'Undue delay in issuing sanctioned Pattayam title deeds for Meenachil taluk applicants.',
        confidence: 0.89
      },
      {
        district: 'Idukki',
        deptId: 1,
        category: 'Bridge Safety & Repair',
        subject: 'Cracks on girder of wooden/iron bridge connecting Munnar tea colony',
        desc: 'Heavy monsoon vehicles have damaged the supporting pier of old colonial bridge. School vans and ambulance access is endangered.',
        priority: 'High' as GrievancePriority,
        status: 'Submitted' as GrievanceStatus,
        daysAgo: 1,
        dueDaysOffset: 2,
        escalated: false,
        summary: 'Structural safety risk on bridge girder serving Munnar tea plantation settlement.',
        confidence: 0.97
      },
      {
        district: 'Wayanad',
        deptId: 10,
        category: 'Wild Animal Attack Compensation',
        subject: 'Pending solar fencing maintenance and elephant intrusion compensation in Meppadi',
        desc: 'Wild elephant herd destroyed plantain and coffee crops. Forest boundary solar fence battery has been non-functional for 3 months.',
        priority: 'High' as GrievancePriority,
        status: 'Under Review' as GrievanceStatus,
        daysAgo: 3,
        dueDaysOffset: 0,
        escalated: false,
        summary: 'Farmer crop loss from elephant intrusion due to defunct solar power fence in Meppadi.',
        confidence: 0.93
      },
      {
        district: 'Kannur',
        deptId: 9,
        category: 'Irregular KSRTC Bus Schedule',
        subject: 'Cancellation of morning school/college student trips on Payyanur - Cherupuzha route',
        desc: 'Ordinary KSRTC service departing Payyanur at 7:45 AM has been cancelled on 8 days this month, stranding students with concession passes.',
        priority: 'Low' as GrievancePriority,
        status: 'Resolved' as GrievanceStatus,
        daysAgo: 12,
        dueDaysOffset: -2,
        escalated: false,
        summary: 'Frequent cancellation of morning peak student bus service on Payyanur-Cherupuzha route.',
        confidence: 0.85,
        atr: 'Payyanur Depot Officer restored permanent schedule with spare bus allocation. Monitored for 5 days with zero drop.',
        feedbackRating: 4,
        feedbackComment: 'Bus runs regularly now in the morning.'
      },
      {
        district: 'Kasaragod',
        deptId: 12,
        category: 'Ration Card Category Change Delay',
        subject: 'Delay in transferring BPL category card for endosulfan victim family',
        desc: 'Application registered under special medical package in Kanhangad Taluk Supply Office. Verification completed by village officer but portal status not updated.',
        priority: 'Medium' as GrievancePriority,
        status: 'In Progress' as GrievanceStatus,
        daysAgo: 8,
        dueDaysOffset: -1, // OVERDUE
        escalated: true,
        summary: 'Unprocessed priority ration card conversion for registered endosulfan relief beneficiary in Kanhangad.',
        confidence: 0.92
      },
      {
        district: 'Pathanamthitta',
        deptId: 11,
        category: 'Social Security Pension Delay',
        subject: 'Non-disbursement of disability welfare pension for 4 months in Adoor',
        desc: 'Beneficiary (70% locomotor disability) has not received DBT monthly pension since June despite annual biometric mustering at Akshaya centre.',
        priority: 'Medium' as GrievancePriority,
        status: 'Action Submitted' as GrievanceStatus,
        daysAgo: 6,
        dueDaysOffset: 1,
        escalated: false,
        summary: 'Disability pension DBT transfer halted despite completed Akshaya biometric mustering in Adoor.',
        confidence: 0.90,
        atr: 'Bank IFSC code mismatch in PFMS portal rectified. Arrears of ₹6,400 credited to beneficiary SBI account.'
      }
    ];

    // Expand template to generate 40 grievances across districts
    for (let i = 0; i < 40; i++) {
      const template = grievanceTemplates[i % grievanceTemplates.length];
      const citizen = citizenUsers[i % citizenUsers.length];
      const id = i + 1;
      const refSeq = (100 + id).toString().padStart(6, '0');
      const referenceNo = `CMK-2026-${refSeq}`;
      const district = KERALA_DISTRICTS[i % KERALA_DISTRICTS.length];
      const dept = this.departments.find(d => d.id === template.deptId) || this.departments[0];

      const createdAt = new Date(Date.now() - (template.daysAgo + Math.floor(i / 3)) * 86400000);
      const dueDate = calculateDueDate(template.priority, createdAt);

      // Distribute statuses across the dataset
      let status: GrievanceStatus;
      if (i % 6 === 0) status = 'Submitted';
      else if (i % 6 === 1) status = 'Under Review';
      else if (i % 6 === 2) status = 'In Progress';
      else if (i % 6 === 3) status = 'Action Submitted';
      else if (i % 6 === 4) status = 'Resolved';
      else status = 'In Progress';

      const overdue = isOverdue(dueDate, status);

      const g: Grievance = {
        id,
        reference_no: referenceNo,
        citizen_id: citizen.id,
        citizen_name: citizen.name,
        citizen_mobile: citizen.mobile,
        district,
        category: template.category,
        subject: `${template.subject} - [Ward ${((i * 3) % 25) + 1}, ${district}]`,
        description: template.desc,
        priority: template.priority,
        status,
        ai_suggested_department_id: dept.id,
        ai_suggested_department_name: dept.name,
        ai_category: template.category,
        ai_priority: template.priority,
        ai_summary: template.summary,
        ai_provider: 'gemini-2.5-flash',
        ai_confidence: template.confidence,
        ai_accepted: true,
        duplicate_of: null,
        due_date: dueDate.toISOString(),
        escalated: overdue && i % 2 === 0,
        is_overdue: overdue,
        created_at: createdAt.toISOString(),
        updated_at: new Date(createdAt.getTime() + 86400000).toISOString(),
        department_id: status !== 'Submitted' ? dept.id : null,
        department_name: status !== 'Submitted' ? dept.name : undefined
      };

      // Grievance history log
      const hist: GrievanceHistory[] = [
        {
          id: id * 10 + 1,
          grievance_id: id,
          from_status: null,
          to_status: 'Submitted',
          remark: 'Grievance submitted by citizen via portal.',
          changed_by: citizen.id,
          changed_by_name: citizen.name,
          changed_by_role: 'citizen',
          created_at: createdAt.toISOString()
        }
      ];

      if (status !== 'Submitted') {
        hist.push({
          id: id * 10 + 2,
          grievance_id: id,
          from_status: 'Submitted',
          to_status: 'Under Review',
          remark: 'Under review by CMO Public Cell. Triage verified.',
          changed_by: 1,
          changed_by_name: 'Dr. K. Sreekumar IAS',
          changed_by_role: 'cmo_admin',
          created_at: new Date(createdAt.getTime() + 3600000 * 4).toISOString()
        });
      }

      if (['In Progress', 'Action Submitted', 'Resolved'].includes(status)) {
        hist.push({
          id: id * 10 + 3,
          grievance_id: id,
          from_status: 'Under Review',
          to_status: 'In Progress',
          remark: `Assigned to ${dept.name} for site inspection and redressal.`,
          changed_by: 1,
          changed_by_name: 'Dr. K. Sreekumar IAS',
          changed_by_role: 'cmo_admin',
          created_at: new Date(createdAt.getTime() + 3600000 * 8).toISOString()
        });

        // Department Assignment
        const officer = this.users.find(u => u.department_id === dept.id) || this.users[1];
        this.assignments.push({
          id,
          grievance_id: id,
          department_id: dept.id,
          department_name: dept.name,
          officer_id: officer.id,
          officer_name: officer.name,
          assigned_by: 1,
          instructions: 'Conduct immediate site verification and submit Action Taken Report within SLA.',
          action_taken_report: ['Action Submitted', 'Resolved'].includes(status) ? (template.atr || 'Field verification completed and corrective action implemented.') : null,
          submitted_to_cmo_at: ['Action Submitted', 'Resolved'].includes(status) ? new Date(createdAt.getTime() + 3600000 * 20).toISOString() : null,
          created_at: new Date(createdAt.getTime() + 3600000 * 8).toISOString()
        });
      }

      if (status === 'Action Submitted') {
        hist.push({
          id: id * 10 + 4,
          grievance_id: id,
          from_status: 'In Progress',
          to_status: 'Action Submitted',
          remark: 'Department officer submitted Action Taken Report (ATR) for CMO review.',
          changed_by: dept.id + 1,
          changed_by_name: dept.name + ' Officer',
          changed_by_role: 'dept_officer',
          created_at: new Date(createdAt.getTime() + 3600000 * 20).toISOString()
        });
      }

      if (status === 'Resolved') {
        hist.push({
          id: id * 10 + 5,
          grievance_id: id,
          from_status: 'Action Submitted',
          to_status: 'Resolved',
          remark: 'Action Taken Report reviewed and approved by CMO. Issue resolved.',
          changed_by: 1,
          changed_by_name: 'Dr. K. Sreekumar IAS',
          changed_by_role: 'cmo_admin',
          created_at: new Date(createdAt.getTime() + 3600000 * 24).toISOString()
        });

        // Feedback
        this.feedbackList.push({
          id,
          grievance_id: id,
          citizen_id: citizen.id,
          rating: template.feedbackRating || 5,
          comment: template.feedbackComment || 'Grievance resolved satisfactorily by the department.',
          reopen_requested: false,
          created_at: new Date(createdAt.getTime() + 3600000 * 30).toISOString()
        });
      }

      this.history.push(...hist);
      this.grievances.push(g);
    }

    // Seed 1 sample attachment for demonstration
    this.attachments.push({
      id: 1,
      grievance_id: 1,
      filename: 'mg_road_pothole_inspection_site.jpg',
      mime: 'image/jpeg',
      size: 145020,
      data: Buffer.from('FAKE_SAMPLE_IMAGE_DATA_KERALA_CMO_PORTAL').toString('base64'),
      uploaded_by: 14,
      created_at: new Date(Date.now() - 2 * 86400000).toISOString()
    });
  }

  // DEPARTMENTS
  public async getDepartments(): Promise<Department[]> {
    return this.departments.map(d => ({
      ...d,
      grievanceCount: this.grievances.filter(g => g.ai_suggested_department_id === d.id || g.department_id === d.id).length
    }));
  }

  public async getDepartmentById(id: number): Promise<Department | null> {
    return this.departments.find(d => d.id === id) || null;
  }

  // USERS
  public async getUserByEmail(email: string): Promise<User | null> {
    const user = this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) return null;
    return { ...user };
  }

  public async getUserById(id: number): Promise<User | null> {
    const user = this.users.find(u => u.id === id);
    if (!user) return null;
    return { ...user };
  }

  public async createUser(data: {
    name: string;
    email: string;
    mobile: string;
    password_hash: string;
    role: UserRole;
    department_id?: number | null;
  }): Promise<User> {
    const existing = await this.getUserByEmail(data.email);
    if (existing) {
      throw new Error(`User with email '${data.email}' already exists.`);
    }

    const newUser: User = {
      id: this.users.length + 1,
      name: data.name,
      email: data.email,
      mobile: data.mobile,
      password_hash: data.password_hash,
      role: data.role,
      department_id: data.department_id || null,
      created_at: new Date().toISOString()
    };

    this.users.push(newUser);
    return newUser;
  }

  // GRIEVANCES
  public async createGrievance(data: {
    citizen_id: number;
    district: string;
    category: string;
    subject: string;
    description: string;
    priority: GrievancePriority;
    ai_suggested_department_id?: number | null;
    ai_category?: string | null;
    ai_priority?: GrievancePriority | null;
    ai_summary?: string | null;
    ai_provider?: string | null;
    ai_confidence?: number | null;
    ai_accepted?: boolean;
    attachment?: {
      filename: string;
      mime: string;
      size: number;
      data: Buffer | string;
    } | null;
  }): Promise<Grievance> {
    const id = this.grievances.length + 1;
    this.nextGrievanceSeq += 1;
    const refSeq = this.nextGrievanceSeq.toString().padStart(6, '0');
    const referenceNo = `CMK-2026-${refSeq}`;

    const citizen = await this.getUserById(data.citizen_id);
    const dueDate = calculateDueDate(data.priority);

    const dept = data.ai_suggested_department_id
      ? await this.getDepartmentById(data.ai_suggested_department_id)
      : null;

    const newGrievance: Grievance = {
      id,
      reference_no: referenceNo,
      citizen_id: data.citizen_id,
      citizen_name: citizen?.name,
      citizen_mobile: citizen?.mobile,
      district: data.district,
      category: data.category,
      subject: data.subject,
      description: data.description,
      priority: data.priority,
      status: 'Submitted',
      ai_suggested_department_id: data.ai_suggested_department_id || null,
      ai_suggested_department_name: dept?.name,
      ai_category: data.ai_category || null,
      ai_priority: data.ai_priority || null,
      ai_summary: data.ai_summary || null,
      ai_provider: data.ai_provider || null,
      ai_confidence: data.ai_confidence || null,
      ai_accepted: data.ai_accepted ?? false,
      duplicate_of: null,
      due_date: dueDate.toISOString(),
      escalated: false,
      is_overdue: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.grievances.unshift(newGrievance);

    // Initial history row
    this.history.push({
      id: this.history.length + 1,
      grievance_id: id,
      from_status: null,
      to_status: 'Submitted',
      remark: 'Grievance submitted by citizen with AI triage review.',
      changed_by: data.citizen_id,
      changed_by_name: citizen?.name,
      changed_by_role: 'citizen',
      created_at: new Date().toISOString()
    });

    // Attachment if provided
    if (data.attachment) {
      this.attachments.push({
        id: this.attachments.length + 1,
        grievance_id: id,
        filename: data.attachment.filename,
        mime: data.attachment.mime,
        size: data.attachment.size,
        data: Buffer.isBuffer(data.attachment.data)
          ? data.attachment.data.toString('base64')
          : data.attachment.data,
        uploaded_by: data.citizen_id,
        created_at: new Date().toISOString()
      });
    }

    return newGrievance;
  }

  public async getGrievances(options: {
    role?: UserRole;
    userId?: number;
    departmentId?: number | null;
    status?: string;
    district?: string;
    category?: string;
    priority?: string;
    search?: string;
    overdueOnly?: boolean;
    page?: number;
    limit?: number;
  }): Promise<{ items: Grievance[]; total: number; page: number; totalPages: number }> {
    let list = [...this.grievances];

    // Role-based scoping
    if (options.role === 'citizen' && options.userId) {
      list = list.filter(g => g.citizen_id === options.userId);
    } else if (options.role === 'dept_officer' && options.departmentId) {
      list = list.filter(
        g => g.department_id === options.departmentId || g.ai_suggested_department_id === options.departmentId
      );
    }

    // Filters
    if (options.status && options.status !== 'all') {
      list = list.filter(g => g.status.toLowerCase() === options.status!.toLowerCase());
    }
    if (options.district && options.district !== 'all') {
      list = list.filter(g => g.district.toLowerCase() === options.district!.toLowerCase());
    }
    if (options.category && options.category !== 'all') {
      list = list.filter(g => g.category.toLowerCase().includes(options.category!.toLowerCase()));
    }
    if (options.priority && options.priority !== 'all') {
      list = list.filter(g => g.priority.toLowerCase() === options.priority!.toLowerCase());
    }
    if (options.overdueOnly) {
      list = list.filter(g => isOverdue(g.due_date, g.status));
    }
    if (options.search && options.search.trim()) {
      const q = options.search.toLowerCase();
      list = list.filter(
        g =>
          g.reference_no.toLowerCase().includes(q) ||
          g.subject.toLowerCase().includes(q) ||
          g.description.toLowerCase().includes(q) ||
          g.district.toLowerCase().includes(q)
      );
    }

    // Attach computed overdue status
    list = list.map(g => ({
      ...g,
      is_overdue: isOverdue(g.due_date, g.status)
    }));

    const total = list.length;
    const page = Math.max(1, options.page || 1);
    const limit = Math.max(1, options.limit || 20);
    const totalPages = Math.ceil(total / limit) || 1;
    const offset = (page - 1) * limit;

    const items = list.slice(offset, offset + limit);

    return { items, total, page, totalPages };
  }

  public async getGrievanceById(id: number): Promise<Grievance | null> {
    const g = this.grievances.find(item => item.id === id);
    if (!g) return null;

    const history = this.history
      .filter(h => h.grievance_id === id)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    const assignments = this.assignments.filter(a => a.grievance_id === id);
    const attachments = this.attachments.filter(att => att.grievance_id === id).map(a => ({
      id: a.id,
      grievance_id: a.grievance_id,
      filename: a.filename,
      mime: a.mime,
      size: a.size,
      uploaded_by: a.uploaded_by,
      created_at: a.created_at
    }));
    const feedback = this.feedbackList.find(f => f.grievance_id === id) || null;
    const internal_remarks = this.internalRemarks.filter(r => r.grievance_id === id);

    return {
      ...g,
      is_overdue: isOverdue(g.due_date, g.status),
      history,
      assignments,
      attachments,
      feedback,
      internal_remarks
    };
  }

  public async getGrievanceByReferenceNo(refNo: string): Promise<Grievance | null> {
    const g = this.grievances.find(
      item => item.reference_no.toLowerCase() === refNo.trim().toLowerCase()
    );
    if (!g) return null;
    return this.getGrievanceById(g.id);
  }

  // PUBLIC TRACKING: strip citizen personal PII and internal remarks
  public async getPublicTrackingData(refNo: string): Promise<Partial<Grievance> | null> {
    const g = await this.getGrievanceByReferenceNo(refNo);
    if (!g) return null;

    // Filter out internal remark history entries if any
    const publicHistory = (g.history || []).map(h => ({
      id: h.id,
      grievance_id: h.grievance_id,
      from_status: h.from_status,
      to_status: h.to_status,
      remark: h.remark,
      changed_by: null,
      changed_by_role: h.changed_by_role,
      created_at: h.created_at
    }));

    return {
      id: g.id,
      reference_no: g.reference_no,
      district: g.district,
      category: g.category,
      subject: g.subject,
      description: g.description,
      priority: g.priority,
      status: g.status,
      department_name: g.department_name || g.ai_suggested_department_name,
      due_date: g.due_date,
      is_overdue: g.is_overdue,
      escalated: g.escalated,
      created_at: g.created_at,
      updated_at: g.updated_at,
      history: publicHistory,
      feedback: g.feedback ? { rating: g.feedback.rating, created_at: g.feedback.created_at } as Feedback : null
      // NOTE: citizen_name, citizen_mobile, citizen_id, internal_remarks, attachments are strictly excluded
    };
  }

  // STATUS UPDATE
  public async updateGrievanceStatus(
    id: number,
    toStatus: GrievanceStatus,
    remark: string,
    changedBy: User
  ): Promise<Grievance> {
    const gIndex = this.grievances.findIndex(item => item.id === id);
    if (gIndex === -1) {
      throw new Error(`Grievance with id ${id} not found`);
    }

    const prevG = this.grievances[gIndex];
    const fromStatus = prevG.status;

    this.grievances[gIndex] = {
      ...prevG,
      status: toStatus,
      updated_at: new Date().toISOString()
    };

    // Log history
    this.history.push({
      id: this.history.length + 1,
      grievance_id: id,
      from_status: fromStatus,
      to_status: toStatus,
      remark: remark || `Status changed from ${fromStatus} to ${toStatus}`,
      changed_by: changedBy.id,
      changed_by_name: changedBy.name,
      changed_by_role: changedBy.role,
      created_at: new Date().toISOString()
    });

    return (await this.getGrievanceById(id))!;
  }

  // ASSIGN DEPARTMENT & OFFICER (CMO)
  public async assignGrievance(
    id: number,
    deptId: number,
    officerId: number | null,
    instructions: string,
    cmoAdmin: User
  ): Promise<Grievance> {
    const gIndex = this.grievances.findIndex(item => item.id === id);
    if (gIndex === -1) throw new Error('Grievance not found');

    const dept = await this.getDepartmentById(deptId);
    if (!dept) throw new Error('Invalid department');

    const officer = officerId ? await this.getUserById(officerId) : null;

    // Update grievance
    this.grievances[gIndex] = {
      ...this.grievances[gIndex],
      department_id: deptId,
      department_name: dept.name,
      officer_id: officerId,
      officer_name: officer?.name,
      status: 'In Progress',
      updated_at: new Date().toISOString()
    };

    // Save assignment record
    this.assignments.push({
      id: this.assignments.length + 1,
      grievance_id: id,
      department_id: deptId,
      department_name: dept.name,
      officer_id: officerId,
      officer_name: officer?.name,
      assigned_by: cmoAdmin.id,
      instructions: instructions || 'Please review and resolve according to citizen service charter.',
      created_at: new Date().toISOString()
    });

    // History entry
    this.history.push({
      id: this.history.length + 1,
      grievance_id: id,
      from_status: this.grievances[gIndex].status,
      to_status: 'In Progress',
      remark: `Assigned to ${dept.name} by CMO. Instructions: ${instructions || 'Action required'}`,
      changed_by: cmoAdmin.id,
      changed_by_name: cmoAdmin.name,
      changed_by_role: 'cmo_admin',
      created_at: new Date().toISOString()
    });

    return (await this.getGrievanceById(id))!;
  }

  // ESCALATE GRIEVANCE (CMO)
  public async escalateGrievance(id: number, cmoAdmin: User, reason: string): Promise<Grievance> {
    const gIndex = this.grievances.findIndex(item => item.id === id);
    if (gIndex === -1) throw new Error('Grievance not found');

    this.grievances[gIndex].escalated = true;
    this.grievances[gIndex].updated_at = new Date().toISOString();

    this.history.push({
      id: this.history.length + 1,
      grievance_id: id,
      from_status: this.grievances[gIndex].status,
      to_status: this.grievances[gIndex].status,
      remark: `[CMO ESCALATION]: Priority escalated due to SLA overdue. Reason: ${reason || 'SLA breached'}`,
      changed_by: cmoAdmin.id,
      changed_by_name: cmoAdmin.name,
      changed_by_role: 'cmo_admin',
      created_at: new Date().toISOString()
    });

    return (await this.getGrievanceById(id))!;
  }

  // SUBMIT ACTION TAKEN REPORT (OFFICER)
  public async submitActionReport(id: number, report: string, officer: User): Promise<Grievance> {
    const gIndex = this.grievances.findIndex(item => item.id === id);
    if (gIndex === -1) throw new Error('Grievance not found');

    const assignmentIndex = this.assignments.findIndex(a => a.grievance_id === id);
    if (assignmentIndex !== -1) {
      this.assignments[assignmentIndex].action_taken_report = report;
      this.assignments[assignmentIndex].submitted_to_cmo_at = new Date().toISOString();
    } else {
      this.assignments.push({
        id: this.assignments.length + 1,
        grievance_id: id,
        department_id: officer.department_id || 1,
        officer_id: officer.id,
        officer_name: officer.name,
        action_taken_report: report,
        submitted_to_cmo_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      });
    }

    this.grievances[gIndex].status = 'Action Submitted';
    this.grievances[gIndex].updated_at = new Date().toISOString();

    this.history.push({
      id: this.history.length + 1,
      grievance_id: id,
      from_status: 'In Progress',
      to_status: 'Action Submitted',
      remark: `Action Taken Report submitted by ${officer.name}: "${report}"`,
      changed_by: officer.id,
      changed_by_name: officer.name,
      changed_by_role: 'dept_officer',
      created_at: new Date().toISOString()
    });

    return (await this.getGrievanceById(id))!;
  }

  // FEEDBACK (CITIZEN)
  public async submitFeedback(
    id: number,
    citizenId: number,
    rating: number,
    comment: string,
    reopenRequested: boolean
  ): Promise<{ feedback: Feedback; grievance: Grievance }> {
    const g = await this.getGrievanceById(id);
    if (!g) throw new Error('Grievance not found');

    const fbIndex = this.feedbackList.findIndex(f => f.grievance_id === id);
    const feedback: Feedback = {
      id: fbIndex !== -1 ? this.feedbackList[fbIndex].id : this.feedbackList.length + 1,
      grievance_id: id,
      citizen_id: citizenId,
      rating,
      comment: comment || null,
      reopen_requested: reopenRequested,
      created_at: new Date().toISOString()
    };

    if (fbIndex !== -1) {
      this.feedbackList[fbIndex] = feedback;
    } else {
      this.feedbackList.push(feedback);
    }

    // If reopen requested, move status to 'Under Review'
    if (reopenRequested && g.status === 'Resolved') {
      const gIndex = this.grievances.findIndex(item => item.id === id);
      this.grievances[gIndex].status = 'Under Review';
      this.grievances[gIndex].updated_at = new Date().toISOString();

      const citizen = await this.getUserById(citizenId);
      this.history.push({
        id: this.history.length + 1,
        grievance_id: id,
        from_status: 'Resolved',
        to_status: 'Under Review',
        remark: `Citizen requested REOPEN: "${comment || 'Unsatisfactory resolution'}"`,
        changed_by: citizenId,
        changed_by_name: citizen?.name,
        changed_by_role: 'citizen',
        created_at: new Date().toISOString()
      });
    }

    const updatedGrievance = (await this.getGrievanceById(id))!;
    return { feedback, grievance: updatedGrievance };
  }

  // INTERNAL REMARKS (CMO)
  public async addInternalRemark(id: number, author: User, remark: string): Promise<InternalRemark> {
    const newRemark: InternalRemark = {
      id: this.internalRemarks.length + 1,
      grievance_id: id,
      author_id: author.id,
      author_name: author.name,
      remark,
      created_at: new Date().toISOString()
    };
    this.internalRemarks.push(newRemark);
    return newRemark;
  }

  // ATTACHMENTS
  public async getAttachment(id: number): Promise<Attachment | null> {
    return this.attachments.find(a => a.id === id) || null;
  }

  // CONTACT FORM
  public async saveContactEnquiry(data: { name: string; email: string; subject: string; message: string }): Promise<ContactEnquiry> {
    const enquiry: ContactEnquiry = {
      id: this.contactEnquiries.length + 1,
      name: data.name,
      email: data.email,
      subject: data.subject,
      message: data.message,
      created_at: new Date().toISOString()
    };
    this.contactEnquiries.push(enquiry);
    return enquiry;
  }

  // CMO ANALYTICAL STATS
  public async getCmoStats() {
    const total = this.grievances.length;
    const resolved = this.grievances.filter(g => g.status === 'Resolved').length;
    const pending = total - resolved;
    const overdue = this.grievances.filter(g => isOverdue(g.due_date, g.status)).length;
    const escalated = this.grievances.filter(g => g.escalated).length;

    // Status breakdown
    const statusCounts: Record<string, number> = {
      'Submitted': 0,
      'Under Review': 0,
      'In Progress': 0,
      'Action Submitted': 0,
      'Resolved': 0
    };
    for (const g of this.grievances) {
      statusCounts[g.status] = (statusCounts[g.status] || 0) + 1;
    }
    const statusSplit = Object.entries(statusCounts).map(([name, count]) => ({ name, count }));

    // District breakdown
    const districtCounts: Record<string, number> = {};
    for (const d of KERALA_DISTRICTS) {
      districtCounts[d] = 0;
    }
    for (const g of this.grievances) {
      if (districtCounts[g.district] !== undefined) {
        districtCounts[g.district]++;
      }
    }
    const districtWise = Object.entries(districtCounts).map(([district, count]) => ({ district, count }));

    // Department breakdown
    const deptCounts: Record<string, { count: number; resolved: number }> = {};
    for (const d of this.departments) {
      deptCounts[d.name] = { count: 0, resolved: 0 };
    }
    for (const g of this.grievances) {
      const deptName = g.department_name || g.ai_suggested_department_name || 'General';
      if (!deptCounts[deptName]) {
        deptCounts[deptName] = { count: 0, resolved: 0 };
      }
      deptCounts[deptName].count++;
      if (g.status === 'Resolved') {
        deptCounts[deptName].resolved++;
      }
    }
    const departmentWise = Object.entries(deptCounts).map(([department, data]) => ({
      department: department.split('(')[0].trim(), // Short name for clean chart
      fullName: department,
      count: data.count,
      resolved: data.resolved
    }));

    // Monthly Trend (mocked historical aggregates based on seed dates)
    const monthlyTrend = [
      { month: 'Jun', submitted: 28, resolved: 22 },
      { month: 'Jul', submitted: 35, resolved: 31 },
      { month: 'Aug', submitted: 42, resolved: 38 },
      { month: 'Sep', submitted: 39, resolved: 35 },
      { month: 'Oct', submitted: 45, resolved: 40 },
      { month: 'Nov', submitted: total, resolved: resolved }
    ];

    return {
      kpi: {
        total,
        pending,
        resolved,
        overdue,
        escalated,
        resolutionRate: Number(((resolved / (total || 1)) * 100).toFixed(1))
      },
      statusSplit,
      districtWise,
      departmentWise,
      monthlyTrend
    };
  }

  // Open grievances for duplicate checking
  public async getOpenGrievancesForDuplicateCheck() {
    return this.grievances
      .filter(g => g.status !== 'Resolved')
      .map(g => ({
        reference_no: g.reference_no,
        district: g.district,
        category: g.category,
        subject: g.subject,
        description: g.description
      }));
  }
}

export const db = new DatabaseService();
