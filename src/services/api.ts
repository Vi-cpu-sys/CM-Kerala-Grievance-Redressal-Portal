import { AIAnalysisResult, Department, Grievance, User } from '../types';

const API_BASE = '/api/v1';

export function getAuthToken(): string | null {
  return localStorage.getItem('cmo_auth_token');
}

export function setAuthToken(token: string | null) {
  if (token) {
    localStorage.setItem('cmo_auth_token', token);
  } else {
    localStorage.removeItem('cmo_auth_token');
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // If body is not FormData, set Content-Type JSON
  if (options.body && !(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || `Request failed with status ${res.status}`);
  }

  return data as T;
}

export const api = {
  // Auth
  register: (data: { name: string; email: string; mobile: string; password: string; role?: string; department_id?: number | null }) =>
    request<{ message: string; token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  login: (data: { email: string; password: string }) =>
    request<{ message: string; token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  logout: () =>
    request<{ message: string }>('/auth/logout', { method: 'POST' }),

  getMe: () =>
    request<{ user: User }>('/auth/me'),

  // Metadata
  getDepartments: () =>
    request<{ departments: Department[] }>('/departments'),

  getDistricts: () =>
    request<{ districts: string[] }>('/districts'),

  // AI Assistant
  analyzeGrievance: (description: string, district?: string) =>
    request<AIAnalysisResult>('/ai/analyze', {
      method: 'POST',
      body: JSON.stringify({ description, district })
    }),

  // Grievances
  submitGrievance: (formData: FormData) =>
    request<{ message: string; reference_no: string; grievance: Grievance }>('/grievances', {
      method: 'POST',
      body: formData
    }),

  getGrievances: (params: {
    status?: string;
    district?: string;
    category?: string;
    priority?: string;
    search?: string;
    overdue?: boolean;
    page?: number;
    limit?: number;
  } = {}) => {
    const q = new URLSearchParams();
    if (params.status && params.status !== 'all') q.set('status', params.status);
    if (params.district && params.district !== 'all') q.set('district', params.district);
    if (params.category && params.category !== 'all') q.set('category', params.category);
    if (params.priority && params.priority !== 'all') q.set('priority', params.priority);
    if (params.search) q.set('search', params.search);
    if (params.overdue) q.set('overdue', 'true');
    if (params.page) q.set('page', params.page.toString());
    if (params.limit) q.set('limit', params.limit.toString());

    const queryString = q.toString() ? `?${q.toString()}` : '';
    return request<{ items: Grievance[]; total: number; page: number; totalPages: number }>(`/grievances${queryString}`);
  },

  getGrievanceById: (id: number) =>
    request<{ grievance: Grievance }>(`/grievances/${id}`),

  trackGrievance: (referenceNo: string) =>
    request<{ tracking: Grievance }>(`/track/${encodeURIComponent(referenceNo.trim())}`),

  // Workflow actions
  updateStatus: (id: number, status: string, remark?: string) =>
    request<{ message: string; grievance: Grievance }>(`/grievances/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, remark })
    }),

  assignGrievance: (id: number, department_id: number, officer_id?: number | null, instructions?: string) =>
    request<{ message: string; grievance: Grievance }>(`/grievances/${id}/assign`, {
      method: 'POST',
      body: JSON.stringify({ department_id, officer_id, instructions })
    }),

  escalateGrievance: (id: number, reason?: string) =>
    request<{ message: string; grievance: Grievance }>(`/grievances/${id}/escalate`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    }),

  submitActionReport: (id: number, report: string) =>
    request<{ message: string; grievance: Grievance }>(`/grievances/${id}/action-report`, {
      method: 'POST',
      body: JSON.stringify({ report })
    }),

  addInternalRemark: (id: number, remark: string) =>
    request<{ message: string; remark: any }>(`/grievances/${id}/remarks`, {
      method: 'POST',
      body: JSON.stringify({ remark })
    }),

  submitFeedback: (id: number, rating: number, comment?: string, reopen_requested: boolean = false) =>
    request<{ message: string; feedback: any; grievance: Grievance }>(`/grievances/${id}/feedback`, {
      method: 'POST',
      body: JSON.stringify({ rating, comment, reopen_requested })
    }),

  getPublicStats: () =>
    request<{
      kpi: {
        total: number;
        pending: number;
        resolved: number;
        resolutionRate: number;
      };
    }>('/stats/public'),

  // Analytics (CMO)
  getCmoStats: () =>
    request<{
      kpi: {
        total: number;
        pending: number;
        resolved: number;
        overdue: number;
        escalated: number;
        resolutionRate: number;
      };
      statusSplit: Array<{ name: string; count: number }>;
      districtWise: Array<{ district: string; count: number }>;
      departmentWise: Array<{ department: string; fullName: string; count: number; resolved: number }>;
      monthlyTrend: Array<{ month: string; submitted: number; resolved: number }>;
    }>('/cmo/stats'),

  // Contact form
  submitContact: (data: { name: string; email: string; subject: string; message: string }) =>
    request<{ message: string }>('/contact', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  // Attachment URL helper
  getAttachmentUrl: (id: number) => {
    const token = getAuthToken();
    return `/api/v1/attachments/${id}${token ? `?token=${encodeURIComponent(token)}` : ''}`;
  }
};
