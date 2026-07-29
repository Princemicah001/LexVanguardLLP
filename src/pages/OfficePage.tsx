import { useEffect, useState } from "react";
import { useLocation, useParams } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { subscribeFirestoreMembers, ATTORNEY_NAMES } from "@/lib/users";
import { loadProfile, saveProfile, handleProfileImageError } from "@/lib/profile-store";
import { uploadToImgBB } from "@/lib/imgbb";
import {
  subscribeTasks, addTask, updateTaskStatus, deleteTask, ChambersTask,
  subscribeMatters, addMatter, updateMatterStatus, deleteMatter, ChambersMatter,
  subscribeLogs, addLog, clearLogs, ActivityLog,
  subscribeDocs, addDocument, deleteDocument, ChambersDocument
} from "@/lib/office-store";
import {
  Calendar, FileText, Scale, BookOpen, Search,
  Bell, CheckCircle, Briefcase, LogOut, ChevronRight,
  Users, BarChart2, AlertCircle, Star, Clock,
  X, Upload, Plus, Pencil, Loader2, Trash2, Filter, MessageSquare, ExternalLink
} from "lucide-react";
import Header from "@/components/Header";
import { InviteModal } from "@/components/InviteModal";
import { ChambersDirectMessages } from "@/components/ChambersDirectMessages";
import { ChambersFinanceSuite } from "@/components/ChambersFinanceSuite";
import { ChambersAdminSuite } from "@/components/ChambersAdminSuite";

const OFFICE_CONFIG: Record<string, {
  accentHex: string;
  greeting: string;
  quote: string;
  stats: { label: string; icon: React.ReactNode }[];
  quickLinks: { label: string; icon: React.ReactNode }[];
}> = {
  prince: {
    accentHex: "#D97706",
    greeting: "Managing Partner's Office",
    quote: "Leadership in law demands mastery of doctrine and strategy.",
    stats: [
      { label: "Active Cases", icon: <Briefcase className="w-4 h-4 text-amber-600" /> },
      { label: "Pending Reviews", icon: <Clock className="w-4 h-4 text-amber-600" /> },
      { label: "Deadlines", icon: <AlertCircle className="w-4 h-4 text-rose-500" /> },
      { label: "Clients", icon: <Users className="w-4 h-4 text-amber-600" /> }
    ],
    quickLinks: [
      { label: "Firm Overview", icon: <BarChart2 className="w-4 h-4 text-slate-500" /> },
      { label: "Personnel Directory", icon: <Users className="w-4 h-4 text-slate-500" /> },
      { label: "M&A Pipeline", icon: <Briefcase className="w-4 h-4 text-slate-500" /> },
      { label: "Corporate Filings", icon: <FileText className="w-4 h-4 text-slate-500" /> }
    ]
  },
  kelvin: {
    accentHex: "#2563EB",
    greeting: "Senior Partner's Chambers",
    quote: "The appellate court is where law is shaped with precedent.",
    stats: [
      { label: "Active Appeals", icon: <Scale className="w-4 h-4 text-blue-600" /> },
      { label: "Briefs Pending", icon: <FileText className="w-4 h-4 text-blue-600" /> },
      { label: "Court Dates", icon: <Calendar className="w-4 h-4 text-rose-500" /> },
      { label: "Cases Researched", icon: <BookOpen className="w-4 h-4 text-blue-600" /> }
    ],
    quickLinks: [
      { label: "Appellate Docket", icon: <Scale className="w-4 h-4 text-slate-500" /> },
      { label: "Brief Repository", icon: <FileText className="w-4 h-4 text-slate-500" /> },
      { label: "Case Law Research", icon: <BookOpen className="w-4 h-4 text-slate-500" /> },
      { label: "Court Filings", icon: <Star className="w-4 h-4 text-slate-500" /> }
    ]
  },
  counsel: {
    accentHex: "#D97706",
    greeting: "Counsel's Chambers",
    quote: "Diligent research and precise legal counsel form our foundation.",
    stats: [
      { label: "Active Matters", icon: <Briefcase className="w-4 h-4 text-amber-600" /> },
      { label: "Advisory Briefs", icon: <FileText className="w-4 h-4 text-amber-600" /> },
      { label: "Consultations", icon: <Clock className="w-4 h-4 text-amber-600" /> },
      { label: "Opinions Rendered", icon: <Scale className="w-4 h-4 text-amber-600" /> }
    ],
    quickLinks: [
      { label: "Counsel Docket", icon: <Scale className="w-4 h-4 text-slate-500" /> },
      { label: "Legal Opinions", icon: <FileText className="w-4 h-4 text-slate-500" /> },
      { label: "Precedent Research", icon: <BookOpen className="w-4 h-4 text-slate-500" /> },
      { label: "Client Advisory", icon: <Users className="w-4 h-4 text-slate-500" /> }
    ]
  }
};

// ---------------- Modals ----------------

function CalendarModal({ onClose }: { onClose: () => void }) {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const monthName = today.toLocaleString('default', { month: 'long' });
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDay }, (_, i) => i);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs" onClick={onClose}>
      <div className="bg-white w-full max-w-sm rounded-xl shadow-xl border border-stone-200 overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
          <h3 className="text-sm font-semibold tracking-wide">{monthName} {year}</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {['S','M','T','W','T','F','S'].map((d,i) => (
              <div key={i} className="text-[11px] font-medium text-slate-400 py-1">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1 text-center">
            {blanks.map(i => <div key={`b${i}`} />)}
            {days.map(d => (
              <button key={d} className={`py-1.5 text-xs font-medium rounded-lg transition-colors
                ${d === today.getDate() ? 'bg-amber-500 text-slate-950 font-bold' : 'hover:bg-slate-100 text-slate-700'}`}>
                {d}
              </button>
            ))}
          </div>
        </div>
        <div className="p-3 bg-stone-50 border-t border-stone-100 text-center">
          <p className="text-[11px] text-slate-500">Court calendar synced with Chambers Docket</p>
        </div>
      </div>
    </div>
  );
}

function NewFileModal({ officeId, userName, onClose }: { officeId: string; userName: string; onClose: () => void }) {
  const [tab, setTab] = useState<'create' | 'upload'>('create');
  const [title, setTitle] = useState('');
  const [type, setType] = useState('Brief');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    await addDocument({
      officeId,
      title: title.trim(),
      type,
      uploadedBy: userName,
      size: "1.8 MB"
    });
    setSaving(false);
    setSaved(true);
    setTimeout(onClose, 1000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs" onClick={onClose}>
      <div className="bg-white w-full max-w-md rounded-xl shadow-xl border border-stone-200 overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
          <h3 className="text-sm font-semibold tracking-wide">File New Document</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex border-b border-stone-200 bg-stone-50">
          {(['create', 'upload'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2.5 text-xs font-semibold tracking-wide transition-colors ${tab === t ? 'bg-white text-slate-900 border-b-2 border-amber-500' : 'text-slate-500 hover:text-slate-900'}`}>
              {t === 'create' ? <><Plus className="w-3.5 h-3.5 inline mr-1.5" />New Record</> : <><Upload className="w-3.5 h-3.5 inline mr-1.5" />Upload File</>}
            </button>
          ))}
        </div>
        {saved ? (
          <div className="p-8 text-center">
            <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-800">Document saved to Chambers repository!</p>
          </div>
        ) : (
          <div className="p-5 space-y-4">
            {tab === 'create' ? (
              <>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Document Title</label>
                  <input value={title} onChange={e => setTitle(e.target.value)}
                    placeholder="e.g. Appellate Brief — Kariuki v. AG"
                    className="w-full border border-stone-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-500 text-slate-900" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Document Category</label>
                  <select value={type} onChange={e => setType(e.target.value)}
                    className="w-full border border-stone-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-500 text-slate-900">
                    {['Brief', 'Legal Memo', 'Contract', 'Research Note', 'Client Intake', 'Court Filing'].map(t => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <button onClick={handleSave} disabled={saving}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg py-2.5 text-xs font-semibold tracking-wide transition-colors flex items-center justify-center gap-2">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "File Document"}
                </button>
              </>
            ) : (
              <div className="border border-dashed border-stone-300 rounded-lg p-8 text-center hover:border-amber-500 transition-colors cursor-pointer bg-stone-50"
                   onClick={() => {
                     const name = prompt("Enter file name to upload:");
                     if (name) {
                       setTitle(name);
                       handleSave();
                     }
                   }}>
                <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-medium text-slate-700">Click to select document file</p>
                <p className="text-[11px] text-slate-400 mt-1">PDF, DOCX up to 25MB</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function NewTaskModal({ officeId, defaultAssignee, members, onClose }: { officeId: string; defaultAssignee: string; members: string[]; onClose: () => void }) {
  const [title, setTitle] = useState('');
  const [assignee, setAssignee] = useState(defaultAssignee);
  const [due, setDue] = useState('Apr 10, 2026');
  const [priority, setPriority] = useState<"Low" | "Medium" | "High">('High');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    await addTask({
      officeId,
      title: title.trim(),
      assignee,
      due,
      status: "Pending",
      priority,
      description: description.trim() || "Task created in Chambers workspace."
    });
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs" onClick={onClose}>
      <div className="bg-white w-full max-w-md rounded-xl shadow-xl border border-stone-200 overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
          <h3 className="text-sm font-semibold tracking-wide flex items-center gap-2">
            <Plus className="w-4 h-4 text-amber-400" /> Create Task Assignment
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Task Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)} required
              placeholder="e.g. Review Discovery Documents for TechCorp"
              className="w-full border border-stone-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-500 text-slate-900" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Assignee</label>
              <select value={assignee} onChange={e => setAssignee(e.target.value)}
                className="w-full border border-stone-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-500 text-slate-900">
                {members.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Priority</label>
              <select value={priority} onChange={e => setPriority(e.target.value as any)}
                className="w-full border border-stone-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-500 text-slate-900">
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Due Date</label>
            <input value={due} onChange={e => setDue(e.target.value)}
              placeholder="e.g. Apr 15, 2026 or Tomorrow 5 PM"
              className="w-full border border-stone-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-500 text-slate-900" />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Description & Requirements</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3}
              placeholder="Provide specific instructions for counsel..."
              className="w-full border border-stone-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-500 text-slate-900" />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-3.5 py-2 text-xs text-slate-600 hover:bg-stone-100 rounded-lg">Cancel</button>
            <button type="submit" disabled={saving}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-semibold rounded-lg flex items-center gap-1.5">
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Save Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function NewMatterModal({ officeId, defaultLead, members, onClose }: { officeId: string; defaultLead: string; members: string[]; onClose: () => void }) {
  const [title, setTitle] = useState('');
  const [client, setClient] = useState('');
  const [status, setStatus] = useState<"Active" | "Pending" | "In Review">('Active');
  const [urgency, setUrgency] = useState<"Low" | "Medium" | "High">('High');
  const [leadAttorney, setLeadAttorney] = useState(defaultLead);
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !client.trim()) return;
    setSaving(true);
    await addMatter({
      officeId,
      title: title.trim(),
      client: client.trim(),
      status,
      urgency,
      leadAttorney,
      description: description.trim() || "Active case file opened."
    });
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs" onClick={onClose}>
      <div className="bg-white w-full max-w-md rounded-xl shadow-xl border border-stone-200 overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
          <h3 className="text-sm font-semibold tracking-wide flex items-center gap-2">
            <Scale className="w-4 h-4 text-amber-400" /> Open New Matter File
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Matter Title / Case Name</label>
            <input value={title} onChange={e => setTitle(e.target.value)} required
              placeholder="e.g. Commercial Litigation Phase II"
              className="w-full border border-stone-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-500 text-slate-900" />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Client Name</label>
            <input value={client} onChange={e => setClient(e.target.value)} required
              placeholder="e.g. Vanguard Tech Corp"
              className="w-full border border-stone-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-500 text-slate-900" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
              <select value={status} onChange={e => setStatus(e.target.value as any)}
                className="w-full border border-stone-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-500 text-slate-900">
                <option value="Active">Active</option>
                <option value="In Review">In Review</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Lead Counsel</label>
              <select value={leadAttorney} onChange={e => setLeadAttorney(e.target.value)}
                className="w-full border border-stone-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-500 text-slate-900">
                {members.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Matter Description & Objectives</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3}
              placeholder="Summary of legal objectives, court forum, or arbitration terms..."
              className="w-full border border-stone-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-500 text-slate-900" />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-3.5 py-2 text-xs text-slate-600 hover:bg-stone-100 rounded-lg">Cancel</button>
            <button type="submit" disabled={saving}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5">
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Open Matter"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function NewActivityModal({ officeId, userName, onClose }: { officeId: string; userName: string; onClose: () => void }) {
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [iconType, setIconType] = useState<ActivityLog["iconType"]>("check");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    await addLog({
      officeId,
      iconType,
      title: title.trim(),
      details: details.trim(),
      actorName: userName,
      time: "Just now"
    });
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs" onClick={onClose}>
      <div className="bg-white w-full max-w-md rounded-xl shadow-xl border border-stone-200 overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
          <h3 className="text-sm font-semibold tracking-wide flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-400" /> Record System Log / Activity
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Activity Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)} required
              placeholder="e.g. Discovery Conference Held with Opposing Counsel"
              className="w-full border border-stone-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-500 text-slate-900" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Category / Icon</label>
              <select value={iconType} onChange={e => setIconType(e.target.value as any)}
                className="w-full border border-stone-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-500 text-slate-900">
                <option value="check">Check / Approval</option>
                <option value="file">Document / Brief</option>
                <option value="bell">Event / Hearing</option>
                <option value="alert">Deadline Notice</option>
                <option value="user">Personnel / Member</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Actor / Logged By</label>
              <input value={userName} disabled
                className="w-full border border-stone-200 bg-stone-50 rounded-lg px-3 py-2 text-xs text-slate-600" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Additional Notes</label>
            <textarea value={details} onChange={e => setDetails(e.target.value)} rows={2}
              placeholder="Details for the firm activity timeline..."
              className="w-full border border-stone-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-500 text-slate-900" />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-3.5 py-2 text-xs text-slate-600 hover:bg-stone-100 rounded-lg">Cancel</button>
            <button type="submit" disabled={saving}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-semibold rounded-lg flex items-center gap-1.5">
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Post to Log"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function TaskDetailModal({ task, onClose }: { task: ChambersTask; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs" onClick={onClose}>
      <div className="bg-white w-full max-w-md rounded-xl shadow-xl border border-stone-200 overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="bg-slate-900 text-white p-4 flex justify-between items-start">
          <div>
            <h3 className="text-sm font-semibold text-amber-400">{task.title}</h3>
            <p className="text-slate-400 text-xs mt-0.5">Due: {task.due}</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="p-2.5 bg-stone-50 rounded-lg border border-stone-100 text-center">
              <p className="text-slate-400 text-[10px] uppercase font-medium mb-0.5">Status</p>
              <p className={`font-semibold ${task.status === 'Completed' ? 'text-emerald-600' : task.status === 'In Progress' ? 'text-amber-600' : 'text-slate-600'}`}>{task.status}</p>
            </div>
            <div className="p-2.5 bg-stone-50 rounded-lg border border-stone-100 text-center">
              <p className="text-slate-400 text-[10px] uppercase font-medium mb-0.5">Priority</p>
              <p className={`font-semibold ${task.priority === 'High' ? 'text-rose-600' : 'text-amber-600'}`}>{task.priority}</p>
            </div>
            <div className="p-2.5 bg-stone-50 rounded-lg border border-stone-100 text-center">
              <p className="text-slate-400 text-[10px] uppercase font-medium mb-0.5">Assignee</p>
              <p className="font-semibold text-slate-700 text-[11px] truncate">{task.assignee}</p>
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 mb-1">Details & Scope</p>
            <p className="text-xs text-slate-700 leading-relaxed bg-stone-50 p-3 rounded-lg border border-stone-100">{task.description}</p>
          </div>
          <div className="flex justify-between items-center pt-2">
            <div className="flex gap-2">
              {task.status !== 'Completed' && (
                <button onClick={() => { updateTaskStatus(task.id, 'Completed'); onClose(); }}
                  className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700 transition-colors flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Complete
                </button>
              )}
              {task.status === 'Pending' && (
                <button onClick={() => { updateTaskStatus(task.id, 'In Progress'); onClose(); }}
                  className="px-3 py-1.5 bg-amber-500 text-slate-950 rounded-lg text-xs font-medium hover:bg-amber-600 transition-colors">
                  Start Working
                </button>
              )}
            </div>
            <button onClick={() => { deleteTask(task.id); onClose(); }} className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="p-3 bg-stone-50 border-t border-stone-100 text-right">
          <button onClick={onClose} className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function EditableStat({ label, icon, value }: { label: string; icon: React.ReactNode; value: string | number }) {
  return (
    <div className="bg-white border border-stone-200/80 rounded-xl p-4 shadow-xs">
      <div className="flex items-center justify-between mb-2">
        <div className="p-2 rounded-lg bg-stone-100/80">{icon}</div>
      </div>
      <span className="text-2xl font-bold text-slate-900 block">{value}</span>
      <span className="text-[11px] font-medium text-slate-500 mt-0.5 block">{label}</span>
    </div>
  );
}

// ---------------- Main Component ----------------

export default function OfficePage() {
  const params = useParams<{ officeId?: string }>();
  const officeId = params.officeId || "counsel";
  const [, setLocation] = useLocation();
  const { firmUser, loading, logout } = useAuth();

  const [showCalendar, setShowCalendar] = useState(false);
  const [showNewFile, setShowNewFile] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [showNewMatterModal, setShowNewMatterModal] = useState(false);
  const [showNewActivityModal, setShowNewActivityModal] = useState(false);
  const [activeTask, setActiveTask] = useState<ChambersTask | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState('');
  const [searching, setSearching] = useState(false);
  const [profile, setProfile] = useState(() => firmUser ? loadProfile(firmUser.name) : null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showAllAlerts, setShowAllAlerts] = useState(false);

  // Real Stores State
  const [tasks, setTasks] = useState<ChambersTask[]>([]);
  const [matters, setMatters] = useState<ChambersMatter[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [docs, setDocs] = useState<ChambersDocument[]>([]);
  const [memberNames, setMemberNames] = useState<string[]>(ATTORNEY_NAMES);

  // Filters
  const [taskFilter, setTaskFilter] = useState<"All" | "Pending" | "In Progress" | "Completed">("All");
  const [matterFilter, setMatterFilter] = useState<"All" | "Active" | "In Review" | "Pending">("All");
  const [activeSuiteTab, setActiveSuiteTab] = useState<"overview" | "dms" | "finance" | "admin">("overview");

  useEffect(() => {
    if (!loading && !firmUser) { setLocation("/login"); return; }
    if (firmUser) { setProfile(loadProfile(firmUser.name)); }
  }, [firmUser, loading, setLocation]);

  useEffect(() => {
    const unsubTasks = subscribeTasks(setTasks);
    const unsubMatters = subscribeMatters(setMatters);
    const unsubLogs = subscribeLogs(setLogs);
    const unsubDocs = subscribeDocs(setDocs);

    const unsubMembers = subscribeFirestoreMembers((members) => {
      const names = Array.from(new Set(members.map(m => m.name)));
      if (names.length > 0) setMemberNames(names);
    });

    return () => {
      unsubTasks();
      unsubMatters();
      unsubLogs();
      unsubDocs();
      unsubMembers();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!firmUser || !profile) return null;

  const config = OFFICE_CONFIG[officeId] || {
    accentHex: "#D97706",
    greeting: `${(officeId).charAt(0).toUpperCase() + (officeId).slice(1)}'s Chambers`,
    quote: "Diligent legal counsel is the cornerstone of justice.",
    stats: [
      { label: "Active Matters", icon: <Briefcase className="w-4 h-4 text-amber-600" /> },
      { label: "Pending Tasks", icon: <Clock className="w-4 h-4 text-amber-600" /> },
      { label: "Deadlines", icon: <AlertCircle className="w-4 h-4 text-rose-500" /> },
      { label: "Files", icon: <FileText className="w-4 h-4 text-amber-600" /> }
    ],
    quickLinks: [
      { label: "Office Overview", icon: <BarChart2 className="w-4 h-4 text-slate-500" /> },
      { label: "My Tasks", icon: <CheckCircle className="w-4 h-4 text-slate-500" /> },
      { label: "Document Library", icon: <FileText className="w-4 h-4 text-slate-500" /> },
      { label: "Legal Research", icon: <BookOpen className="w-4 h-4 text-slate-500" /> }
    ]
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    setTimeout(() => {
      setSearchResult(`LexAI Research for "${searchQuery}": Found 3 precedent decisions in Supreme Court & Court of Appeal repository matching query arguments.`);
      setSearching(false);
    }, 800);
  };

  const updateProfile = (field: keyof typeof profile, value: string) => {
    const updated = { ...profile!, [field]: value };
    setProfile(updated);
    saveProfile(updated);
  };

  // Filter calculations
  const activeMattersCount = matters.filter(m => m.status === "Active").length;
  const pendingTasksCount = tasks.filter(t => t.status !== "Completed").length;
  const highPriorityCount = tasks.filter(t => t.priority === "High" && t.status !== "Completed").length;
  const totalDocsCount = docs.length;

  const filteredTasks = tasks.filter(t => taskFilter === "All" || t.status === taskFilter);
  const filteredMatters = matters.filter(m => matterFilter === "All" || m.status === matterFilter);
  const visibleAlerts = showAllAlerts ? logs : logs.slice(0, 4);

  const isFounder = firmUser && (firmUser.role.level >= 100 || ['prince', 'kelvin', 'donel'].includes(firmUser.officeId));

  const renderLogIcon = (type: ActivityLog["iconType"]) => {
    switch (type) {
      case "file": return <FileText className="w-3.5 h-3.5 text-amber-600" />;
      case "check": return <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />;
      case "bell": return <Bell className="w-3.5 h-3.5 text-blue-600" />;
      case "alert": return <AlertCircle className="w-3.5 h-3.5 text-rose-500" />;
      case "user": return <Users className="w-3.5 h-3.5 text-indigo-600" />;
      default: return <Bell className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 text-slate-800 font-sans antialiased">
      {showCalendar && <CalendarModal onClose={() => setShowCalendar(false)} />}
      {showNewFile && <NewFileModal officeId={officeId} userName={firmUser.name} onClose={() => setShowNewFile(false)} />}
      {showInviteModal && <InviteModal onClose={() => setShowInviteModal(false)} />}
      {showNewTaskModal && <NewTaskModal officeId={officeId} defaultAssignee={firmUser.name} members={memberNames} onClose={() => setShowNewTaskModal(false)} />}
      {showNewMatterModal && <NewMatterModal officeId={officeId} defaultLead={firmUser.name} members={memberNames} onClose={() => setShowNewMatterModal(false)} />}
      {showNewActivityModal && <NewActivityModal officeId={officeId} userName={firmUser.name} onClose={() => setShowNewActivityModal(false)} />}
      {activeTask && <TaskDetailModal task={activeTask} onClose={() => setActiveTask(null)} />}

      {/* Header */}
      <div className="bg-slate-950 text-white">
        <Header />
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12 space-y-5">

        {/* Minimalist Header Bar */}
        <div className="bg-white rounded-xl border border-stone-200/80 shadow-2xs p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative shrink-0 group">
              <img
                src={profile.image}
                alt={firmUser.name}
                onError={(e) => handleProfileImageError(e, firmUser.name)}
                className="w-10 h-10 rounded-lg object-cover border border-stone-200"
              />
              <label className="absolute inset-0 bg-slate-900/80 text-white flex items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer p-1">
                {uploadingImage ? (
                  <Loader2 className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                ) : (
                  <Upload className="w-3.5 h-3.5 text-amber-400" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  disabled={uploadingImage}
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    try {
                      setUploadingImage(true);
                      const imageUrl = await uploadToImgBB(file, firmUser.name);
                      updateProfile('image', imageUrl);
                    } catch (err: any) {
                      alert("Upload failed: " + (err?.message || "Try again"));
                    } finally {
                      setUploadingImage(false);
                    }
                  }}
                />
              </label>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-slate-900">{firmUser.name}</h1>
                <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-mono font-semibold">
                  {firmUser.role.name}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {profile.practice} • {profile.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {isFounder && (
              <button onClick={() => setShowInviteModal(true)}
                className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">
                <Users className="w-3.5 h-3.5" /> Invite
              </button>
            )}
            <button onClick={() => setShowCalendar(true)}
              className="inline-flex items-center gap-1.5 bg-stone-100 hover:bg-stone-200 text-slate-800 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors">
              <Calendar className="w-3.5 h-3.5" /> Calendar
            </button>
            <button onClick={() => setShowNewFile(true)}
              className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors">
              <FileText className="w-3.5 h-3.5" /> New File
            </button>
            <button onClick={() => setLocation('/attorneys')}
              className="inline-flex items-center gap-1 bg-stone-100 hover:bg-stone-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors">
              Directory <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button onClick={logout}
              className="inline-flex items-center gap-1.5 border border-stone-200 hover:bg-rose-50 text-rose-600 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors">
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          </div>
        </div>

        {/* Suite Navigation Tabs */}
        <div className="bg-white rounded-xl border border-stone-200/80 shadow-2xs p-1.5 flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setActiveSuiteTab("overview")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
              activeSuiteTab === "overview"
                ? "bg-slate-900 text-white shadow-2xs"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <Briefcase className="w-3.5 h-3.5 text-amber-400" />
            Matters
          </button>

          <button
            onClick={() => setActiveSuiteTab("dms")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
              activeSuiteTab === "dms"
                ? "bg-slate-900 text-white shadow-2xs"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
            Direct Messages
          </button>

          <button
            onClick={() => setActiveSuiteTab("finance")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
              activeSuiteTab === "finance"
                ? "bg-slate-900 text-white shadow-2xs"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5 text-emerald-400" />
            Finance
          </button>

          <button
            onClick={() => setActiveSuiteTab("admin")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
              activeSuiteTab === "admin"
                ? "bg-slate-900 text-white shadow-2xs"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <Users className="w-3.5 h-3.5 text-purple-400" />
            Admin
          </button>
        </div>

        {/* SUITE RENDER: DIRECT MESSAGES */}
        {activeSuiteTab === "dms" && <ChambersDirectMessages />}

        {/* SUITE RENDER: FINANCE SUITE */}
        {activeSuiteTab === "finance" && <ChambersFinanceSuite />}

        {/* SUITE RENDER: ADMIN SUITE */}
        {activeSuiteTab === "admin" && <ChambersAdminSuite />}

        {/* SUITE RENDER: OVERVIEW / COUNSEL MATTERS */}
        {activeSuiteTab === "overview" && (
          <>
            {/* Dynamic Real Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <EditableStat label="Active Matters" icon={<Briefcase className="w-4 h-4 text-amber-600" />} value={activeMattersCount} />
              <EditableStat label="Pending Tasks" icon={<Clock className="w-4 h-4 text-amber-600" />} value={pendingTasksCount} />
              <EditableStat label="High Priority" icon={<AlertCircle className="w-4 h-4 text-rose-500" />} value={highPriorityCount} />
              <EditableStat label="Filed Documents" icon={<FileText className="w-4 h-4 text-amber-600" />} value={totalDocsCount} />
            </div>

            {/* Workspace Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Main Column */}
              <div className="lg:col-span-2 space-y-6">

                {/* Active Matters (Real Data) */}
                <div className="bg-white rounded-xl border border-stone-200/80 shadow-xs overflow-hidden">
              <div className="px-5 py-4 border-b border-stone-100 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Scale className="w-4 h-4 text-slate-600" />
                  <h3 className="text-sm font-bold text-slate-900">Active Matters & Docket</h3>
                  <span className="text-xs text-slate-400 font-normal">({matters.length})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex bg-stone-100 p-0.5 rounded-lg text-[11px]">
                    {(["All", "Active", "In Review", "Pending"] as const).map(f => (
                      <button key={f} onClick={() => setMatterFilter(f)}
                        className={`px-2.5 py-1 rounded-md transition-colors font-medium ${matterFilter === f ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"}`}>
                        {f}
                      </button>
                    ))}
                  </div>
                  <button onClick={() => setShowNewMatterModal(true)}
                    className="inline-flex items-center gap-1 bg-amber-500 hover:bg-amber-600 text-slate-950 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors">
                    <Plus className="w-3.5 h-3.5" /> Open Matter
                  </button>
                </div>
              </div>

              <div className="divide-y divide-stone-100">
                {filteredMatters.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    No matter files matching filter "{matterFilter}".
                  </div>
                ) : (
                  filteredMatters.map(m => (
                    <div key={m.id} className="p-4 hover:bg-stone-50/80 transition-colors flex items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-semibold text-slate-900">{m.title}</h4>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                            m.urgency === 'High' ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {m.urgency} Urgency
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Client: <strong className="text-slate-700">{m.client}</strong> {m.leadAttorney && `• Lead: ${m.leadAttorney}`} — {m.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <select value={m.status} onChange={e => updateMatterStatus(m.id, e.target.value as any)}
                          className="px-2 py-1 bg-stone-50 border border-stone-200 rounded-lg text-[10px] font-medium text-slate-700 focus:outline-none">
                          <option value="Active">Active</option>
                          <option value="In Review">In Review</option>
                          <option value="Pending">Pending</option>
                          <option value="Closed">Closed</option>
                        </select>
                        <button onClick={() => deleteMatter(m.id)} className="p-1 text-slate-400 hover:text-rose-600 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Chambers Tasks (Real Data) */}
            <div className="bg-white rounded-xl border border-stone-200/80 shadow-xs overflow-hidden">
              <div className="px-5 py-4 border-b border-stone-100 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-slate-600" />
                  <h3 className="text-sm font-bold text-slate-900">Chambers Tasks & Assignments</h3>
                  <span className="text-xs text-slate-400 font-normal">({tasks.length})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex bg-stone-100 p-0.5 rounded-lg text-[11px]">
                    {(["All", "Pending", "In Progress", "Completed"] as const).map(f => (
                      <button key={f} onClick={() => setTaskFilter(f)}
                        className={`px-2.5 py-1 rounded-md transition-colors font-medium ${taskFilter === f ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"}`}>
                        {f}
                      </button>
                    ))}
                  </div>
                  <button onClick={() => setShowNewTaskModal(true)}
                    className="inline-flex items-center gap-1 bg-slate-900 hover:bg-slate-800 text-white px-2.5 py-1 rounded-lg text-xs font-medium transition-colors">
                    <Plus className="w-3.5 h-3.5 text-amber-400" /> Add Task
                  </button>
                </div>
              </div>

              <div className="divide-y divide-stone-100">
                {filteredTasks.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    No tasks found matching filter "{taskFilter}".
                  </div>
                ) : (
                  filteredTasks.map(task => (
                    <div key={task.id} className="p-4 hover:bg-stone-50/80 transition-colors flex items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className={`text-xs font-semibold ${task.status === 'Completed' ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                            {task.title}
                          </h4>
                          <span className={`text-[9px] px-1.5 py-0.2 rounded font-medium ${
                            task.priority === 'High' ? 'bg-rose-50 text-rose-700 border border-rose-200/50' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {task.priority}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">Assigned: <strong className="text-slate-700">{task.assignee}</strong> • Due: {task.due}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button onClick={() => updateTaskStatus(task.id, task.status === 'Completed' ? 'In Progress' : 'Completed')}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-colors ${
                            task.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                            task.status === 'In Progress' ? 'bg-amber-100 text-amber-900 hover:bg-amber-200' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}>
                          {task.status}
                        </button>
                        <button onClick={() => setActiveTask(task)}
                          className="text-xs font-medium text-slate-600 hover:text-amber-600 transition-colors p-1">
                          Details
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Document Repository */}
            <div className="bg-white rounded-xl border border-stone-200/80 shadow-xs overflow-hidden">
              <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-600" />
                  <h3 className="text-sm font-bold text-slate-900">Document Repository & Briefs</h3>
                </div>
                <button onClick={() => setShowNewFile(true)}
                  className="text-xs text-amber-600 hover:underline font-medium inline-flex items-center gap-1">
                  <Plus className="w-3.5 h-3.5" /> File Document
                </button>
              </div>

              <div className="divide-y divide-stone-100">
                {docs.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs">No filed documents.</div>
                ) : (
                  docs.map(doc => (
                    <div key={doc.id} className="p-4 hover:bg-stone-50/80 transition-colors flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-stone-100 rounded-lg text-slate-600">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-semibold text-slate-900">{doc.title}</h4>
                          <p className="text-[11px] text-slate-500 mt-0.5">Category: {doc.type} • Filed by {doc.uploadedBy} on {doc.uploadedAt}</p>
                        </div>
                      </div>
                      <button onClick={() => deleteDocument(doc.id)} className="p-1 text-slate-400 hover:text-rose-600 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            {/* System Log & Real Activity Stream */}
            <div className="bg-white rounded-xl border border-stone-200/80 shadow-xs p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5 text-amber-600" /> Chambers Activity Log
                </h3>
                <div className="flex items-center gap-2">
                  <button onClick={() => setShowNewActivityModal(true)} title="Add Log Entry"
                    className="text-amber-600 hover:text-amber-700 p-0.5">
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setShowAllAlerts(!showAllAlerts)} className="text-[11px] text-amber-600 hover:underline">
                    {showAllAlerts ? 'Less' : 'All'}
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {visibleAlerts.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No activity entries yet.</p>
                ) : (
                  visibleAlerts.map((alert) => (
                    <div key={alert.id} className="flex items-start gap-2.5">
                      <div className="mt-0.5 p-1 bg-stone-100 rounded">{renderLogIcon(alert.iconType)}</div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-slate-800 leading-tight">{alert.title}</p>
                        {alert.details && <p className="text-[10px] text-slate-500 mt-0.5">{alert.details}</p>}
                        <p className="text-[10px] text-slate-400 mt-0.5">{alert.time}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl border border-stone-200/80 shadow-xs p-5 space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Quick Actions</h3>
              <div className="space-y-1">
                {config.quickLinks.map((link, i) => (
                  <button key={i} onClick={() => {
                    if (link.label.includes("Directory")) setLocation("/attorneys");
                    else if (link.label.includes("Research")) setSearchQuery("Appellate Precedents 2026");
                    else if (link.label.includes("Overview")) setShowNewMatterModal(true);
                  }} className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-stone-50 transition-colors text-left group">
                    <div className="flex items-center gap-2.5">
                      {link.icon}
                      <span className="text-xs font-medium text-slate-700 group-hover:text-slate-900">{link.label}</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500" />
                  </button>
                ))}
              </div>
            </div>

            {/* Account Card */}
            <div className="bg-white rounded-xl border border-stone-200/80 shadow-xs p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-slate-900 text-amber-400 flex items-center justify-center font-bold text-xs">
                  {firmUser.name.charAt(0)}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">{firmUser.name}</p>
                  <p className="text-[10px] text-slate-500">{firmUser.role.name}</p>
                </div>
              </div>
              <button onClick={logout}
                className="w-full flex items-center justify-center gap-1.5 border border-stone-200 hover:bg-rose-50 text-rose-600 rounded-lg py-2 text-xs font-medium transition-colors">
                <LogOut className="w-3.5 h-3.5" /> Sign Out
              </button>
            </div>

          </div>

        </div>
        </>
        )}

      </main>
    </div>
  );
}
