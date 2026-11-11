export type UserRole = 'citizen' | 'cmo_admin' | 'dept_officer';

export type GrievanceStatus = 
  | 'Submitted' 
  | 'Under Review' 
  | 'In Progress' 
  | 'Action Submitted' 
  | 'Resolved';

export type GrievancePriority = 'Low' | 'Medium' | 'High';

export interface User {
  id: number;
  name: string;
  email: string;
  mobile: string;
  role: UserRole;
  department_id?: number | null;
  department_name?: string;
}

export interface Department {
  id: number;
  name: string;
  description: string;
  slug: string;
  grievanceCount?: number;
}

export interface GrievanceHistory {
  id: number;
  grievance_id: number;
  from_status: GrievanceStatus | null;
  to_status: GrievanceStatus;
  remark: string | null;
  changed_by: number | null;
  changed_by_name?: string;
  changed_by_role: string;
  created_at: string;
}

export interface DepartmentAssignment {
  id: number;
  grievance_id: number;
  department_id: number;
  department_name?: string;
  officer_id?: number | null;
  officer_name?: string;
  assigned_by?: number | null;
  instructions?: string | null;
  action_taken_report?: string | null;
  submitted_to_cmo_at?: string | null;
  created_at: string;
}

export interface Attachment {
  id: number;
  grievance_id: number;
  filename: string;
  mime: string;
  size: number;
  created_at: string;
}

export interface Feedback {
  id: number;
  grievance_id: number;
  citizen_id: number;
  rating: number;
  comment?: string | null;
  reopen_requested?: boolean;
  created_at: string;
}

export interface InternalRemark {
  id: number;
  grievance_id: number;
  author_id: number;
  author_name?: string;
  remark: string;
  created_at: string;
}

export interface Grievance {
  id: number;
  reference_no: string;
  citizen_id: number;
  citizen_name?: string;
  citizen_mobile?: string;
  district: string;
  category: string;
  subject: string;
  description: string;
  priority: GrievancePriority;
  status: GrievanceStatus;
  ai_suggested_department_id?: number | null;
  ai_suggested_department_name?: string;
  ai_category?: string | null;
  ai_priority?: GrievancePriority | null;
  ai_summary?: string | null;
  ai_provider?: string | null;
  ai_confidence?: number | null;
  ai_accepted: boolean;
  duplicate_of?: number | null;
  due_date: string;
  escalated: boolean;
  is_overdue?: boolean;
  created_at: string;
  updated_at: string;
  department_id?: number | null;
  department_name?: string;
  officer_id?: number | null;
  officer_name?: string;
  history?: GrievanceHistory[];
  assignments?: DepartmentAssignment[];
  attachments?: Attachment[];
  feedback?: Feedback | null;
  internal_remarks?: InternalRemark[];
}

export interface AIAnalysisResult {
  category: string;
  department_id: number;
  department_name: string;
  priority: GrievancePriority;
  summary: string;
  confidence: number;
  reasoning: string;
  is_emergency: boolean;
  possible_duplicates: Array<{
    reference_no: string;
    subject: string;
    similarity: number;
  }>;
  provider: string;
  latency_ms: number;
}
