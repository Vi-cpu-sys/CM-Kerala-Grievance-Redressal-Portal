import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { AIAnalysisResult, Department, GrievancePriority } from '../types';
import {
  Sparkles,
  Upload,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Check,
  Building,
  HelpCircle,
  FileText,
  AlertCircle,
  ArrowRight,
  X
} from 'lucide-react';

export const SubmitGrievance: React.FC = () => {
  const { user, isAuthenticated, quickSwitchDemo } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialDeptId = searchParams.get('dept');

  // Form states
  const [district, setDistrict] = useState('Ernakulam');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState<GrievancePriority>('Medium');
  const [departmentId, setDepartmentId] = useState<number | null>(initialDeptId ? Number(initialDeptId) : null);
  const [file, setFile] = useState<File | null>(null);

  // Metadata
  const [districts, setDistricts] = useState<string[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  // AI Assistant states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<AIAnalysisResult | null>(null);
  const [aiError, setAiError] = useState('');
  const [aiAccepted, setAiAccepted] = useState(false);

  // Submission states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<{
    referenceNo: string;
    subject: string;
  } | null>(null);
  const [submitError, setSubmitError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // If not authenticated, prompt to sign in or allow evaluation
    if (!isAuthenticated) {
      // User can still see page but will be guided to sign in
    }

    Promise.all([api.getDistricts(), api.getDepartments()]).then(([distRes, deptRes]) => {
      setDistricts(distRes.districts);
      setDepartments(deptRes.departments);
      if (initialDeptId) {
        setDepartmentId(Number(initialDeptId));
      }
    });
  }, [isAuthenticated, initialDeptId]);

  // AI Analyze Trigger
  const handleAIAnalyze = async () => {
    if (description.trim().length < 10) {
      setAiError('Please enter at least 10 characters in the description before running AI analysis.');
      return;
    }

    setIsAnalyzing(true);
    setAiError('');

    try {
      const result = await api.analyzeGrievance(description, district);
      setAiResult(result);
    } catch (err: any) {
      setAiError(err.message || 'AI analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Apply AI Suggestions
  const handleApplyAISuggestion = () => {
    if (!aiResult) return;
    setCategory(aiResult.category);
    setDepartmentId(aiResult.department_id);
    setPriority(aiResult.priority);
    setAiAccepted(true);
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setSubmitError('Please sign in or use the quick demo switcher to submit a grievance.');
      return;
    }

    if (!district || !subject || !description) {
      setSubmitError('District, subject, and description are required.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const formData = new FormData();
      formData.append('district', district);
      formData.append('subject', subject);
      formData.append('description', description);
      formData.append('category', category || aiResult?.category || 'General Civic Infrastructure');
      formData.append('priority', priority);
      if (departmentId || aiResult?.department_id) {
        formData.append('ai_suggested_department_id', String(departmentId || aiResult?.department_id));
      }
      if (aiResult) {
        formData.append('ai_category', aiResult.category);
        formData.append('ai_priority', aiResult.priority);
        formData.append('ai_summary', aiResult.summary);
        formData.append('ai_provider', aiResult.provider);
        formData.append('ai_confidence', String(aiResult.confidence));
        formData.append('ai_accepted', String(aiAccepted));
      }
      if (file) {
        formData.append('attachment', file);
      }

      const res = await api.submitGrievance(formData);
      setSubmissionSuccess({
        referenceNo: res.reference_no,
        subject
      });
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to submit grievance');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyRef = () => {
    if (submissionSuccess) {
      navigator.clipboard.writeText(submissionSuccess.referenceNo);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          File a Public Grievance
        </h1>
        <p className="text-slate-600 text-sm max-w-xl mx-auto">
          Submit your complaint with AI categorization, automated duplicate check, and time-bound SLA tracking directly under the Chief Minister&apos;s Office.
        </p>
      </div>

      {/* Success Modal */}
      {submissionSuccess && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 text-center animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold text-slate-900">
                Grievance Registered Successfully!
              </h2>
              <p className="text-xs text-slate-600">
                Your grievance has been submitted to the Chief Minister&apos;s Public Cell and entered into status <strong>Submitted</strong>.
              </p>
            </div>

            {/* Reference Box */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-1">
              <div className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                Official Reference Number
              </div>
              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl font-extrabold text-emerald-950 font-mono">
                  {submissionSuccess.referenceNo}
                </span>
                <button
                  onClick={copyRef}
                  className="p-1.5 rounded-lg bg-emerald-200 hover:bg-emerald-300 text-emerald-900 transition"
                  title="Copy Reference ID"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-900" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              {copied && <div className="text-[11px] text-emerald-700 font-medium">Copied to clipboard!</div>}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => navigate(`/track?ref=${encodeURIComponent(submissionSuccess.referenceNo)}`)}
                className="flex-1 py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm transition shadow-sm"
              >
                Track Status Now
              </button>
              <button
                onClick={() => {
                  setSubmissionSuccess(null);
                  navigate('/citizen');
                }}
                className="py-3 px-4 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-sm transition"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Auth warning if not signed in */}
      {!isAuthenticated && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-700" />
            <span>You are currently not signed in. Please sign in or use the quick citizen demo to file your grievance.</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={async () => {
                await quickSwitchDemo('citizen');
              }}
              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-lg text-xs transition shadow-xs"
            >
              Sign In as Demo Citizen
            </button>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="px-3 py-1.5 border border-amber-400 hover:bg-amber-100 text-amber-900 font-semibold rounded-lg text-xs transition"
            >
              Login Page
            </button>
          </div>
        </div>
      )}

      {submitError && (
        <div className="bg-rose-50 border border-rose-300 rounded-xl p-4 flex items-start gap-2.5 text-xs text-rose-900">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div>{submitError}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          {/* District & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                District in Kerala *
              </label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                {districts.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Urgency / Priority *
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as GrievancePriority)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="High">High Priority (3 Days SLA - Danger/Hazard)</option>
                <option value="Medium">Medium Priority (7 Days SLA - Standard)</option>
                <option value="Low">Low Priority (14 Days SLA - Routine)</option>
              </select>
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Subject of Grievance *
            </label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Hazardous pothole cluster on MG Road near Metro Pillar 420"
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Detailed Description */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Detailed Description of Grievance *
              </label>
              <span className="text-xs text-slate-400">
                Minimum 10 characters for AI analysis
              </span>
            </div>
            <textarea
              required
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the issue with specific location, landmarks, duration, and public impact..."
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* AI ASSISTANT TRIGGER BUTTON */}
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-1.5 font-bold text-emerald-950 text-sm">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  AI Grievance Assistant
                </div>
                <p className="text-xs text-emerald-800">
                  Analyze your complaint for automated department routing, 40-word summary, and duplicate prevention.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAIAnalyze}
                disabled={isAnalyzing || description.trim().length < 10}
                className="px-5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm transition disabled:opacity-50 shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {isAnalyzing ? 'Analyzing with AI...' : 'Analyze with AI'}
              </button>
            </div>

            {aiError && (
              <div className="text-xs text-rose-700 bg-rose-50 p-2.5 rounded-lg border border-rose-200">
                {aiError}
              </div>
            )}

            {/* AI RESULTS PANEL */}
            {aiResult && (
              <div className="bg-white rounded-xl p-4 border border-emerald-300 space-y-4 shadow-sm animate-in fade-in">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                        aiResult.provider.includes('gemini')
                          ? 'bg-purple-100 text-purple-800 border border-purple-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {aiResult.provider.includes('gemini')
                        ? 'Powered by Gemini AI'
                        : 'Fallback mode (no AI model)'}
                    </span>
                    <span className="text-xs text-slate-500">
                      Confidence: <strong>{Math.round(aiResult.confidence * 100)}%</strong>
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleApplyAISuggestion}
                    className={`px-3 py-1 rounded text-xs font-semibold transition flex items-center gap-1 ${
                      aiAccepted
                        ? 'bg-emerald-600 text-white'
                        : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900'
                    }`}
                  >
                    {aiAccepted ? <Check className="w-3.5 h-3.5" /> : null}
                    {aiAccepted ? 'AI Suggestions Accepted' : 'Accept Suggestions'}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <span className="text-slate-500 block mb-0.5">Suggested Department</span>
                    <strong className="text-slate-900 block">{aiResult.department_name}</strong>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <span className="text-slate-500 block mb-0.5">Suggested Category</span>
                    <strong className="text-slate-900 block">{aiResult.category}</strong>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <span className="text-slate-500 block mb-0.5">Assessed Priority</span>
                    <strong className="text-slate-900 block">{aiResult.priority} Priority</strong>
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold text-slate-700 mb-1">
                    AI Summary (Executive Triage):
                  </div>
                  <p className="text-xs text-slate-600 italic bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    &ldquo;{aiResult.summary}&rdquo;
                  </p>
                </div>

                {/* DUPLICATE DETECTION BANNER */}
                {aiResult.possible_duplicates && aiResult.possible_duplicates.length > 0 && (
                  <div className="bg-amber-50 border border-amber-300 rounded-lg p-3 space-y-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-amber-950 text-xs">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      Possible Duplicate Grievances Detected Nearby
                    </div>
                    <p className="text-[11px] text-amber-800">
                      The following existing open grievances match your issue description. You may still proceed if this is a distinct occurrence.
                    </p>
                    <div className="space-y-1 pt-1">
                      {aiResult.possible_duplicates.map((dup, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-[11px] bg-white p-2 rounded border border-amber-200"
                        >
                          <span className="font-mono font-semibold text-slate-800">
                            {dup.reference_no}: {dup.subject}
                          </span>
                          <span className="text-amber-800 font-bold">
                            {Math.round(dup.similarity * 100)}% Match
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Department Selection (Can be manual or AI suggested) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Target Department
              </label>
              <select
                value={departmentId || ''}
                onChange={(e) => setDepartmentId(e.target.value ? Number(e.target.value) : null)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="">-- Let CMO Auto-Assign via AI --</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Category
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Potholes & Road Damage"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Optional Attachment */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Supporting Document / Site Photo (Optional)
            </label>
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:border-emerald-500 transition relative">
                <input
                  type="file"
                  id="file-upload"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setFile(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center justify-center space-y-1.5"
                >
                  <Upload className="w-6 h-6 text-slate-400" />
                  <span className="text-xs font-semibold text-emerald-800">
                    {file ? file.name : 'Click to upload photograph or document'}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    JPEG, PNG, or PDF up to 2 MB (Stored securely in PostgreSQL bytea)
                  </span>
                </label>
                {file && (
                  <div className="mt-2 flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => setFile(null)}
                      className="inline-flex items-center gap-1 text-[11px] text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-md border border-rose-200 transition"
                    >
                      <X className="w-3 h-3" /> Remove selected file
                    </button>
                  </div>
                )}
              </div>
          </div>

          {/* Submit Action */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm transition shadow-md disabled:opacity-50 flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              {isSubmitting ? 'Submitting Grievance...' : 'Submit Grievance to CMO'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
