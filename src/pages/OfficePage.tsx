import { useEffect, useState } from "react";
import { useLocation, useParams } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { TASKS } from "@/lib/users";
import { loadProfile, saveProfile, handleProfileImageError } from "@/lib/profile-store";
import { uploadToImgBB } from "@/lib/imgbb";
import {
  Calendar, FileText, Scale, BookOpen, Search,
  Bell, CheckCircle, Briefcase, LogOut, ChevronRight,
  Users, BarChart2, AlertCircle, Star, Clock,
  X, Upload, Plus, Pencil, ChevronDown, Loader2
} from "lucide-react";
import Header from "@/components/Header";
import { makeAvatarSvg } from "@/lib/avatar";

const OFFICE_CONFIG: Record<string, {
  accent: string;
  accentHex: string;
  greeting: string;
  quote: string;
  stats: { label: string; value: string; icon: React.ReactNode }[];
  quickLinks: { label: string; icon: React.ReactNode; action?: string }[];
  matters: { title: string; client: string; status: string; urgency: string; description: string }[];
}> = {
  prince: {
    accent: "yellow-500",
    accentHex: "#EAB308",
    greeting: "Managing Partner's Office",
    quote: "\"Leadership in law demands both mastery of doctrine and mastery of strategy.\"",
    stats: [
      { label: "Active Cases", value: "—", icon: <Briefcase className="w-5 h-5 text-yellow-500" /> },
      { label: "Pending Reviews", value: "—", icon: <Clock className="w-5 h-5 text-yellow-500" /> },
      { label: "Deadlines", value: "—", icon: <AlertCircle className="w-5 h-5 text-red-400" /> },
      { label: "Clients", value: "—", icon: <Users className="w-5 h-5 text-yellow-500" /> }
    ],
    quickLinks: [
      { label: "Firm Overview", icon: <BarChart2 className="w-4 h-4" /> },
      { label: "Personnel Management", icon: <Users className="w-4 h-4" /> },
      { label: "M&A Pipeline", icon: <Briefcase className="w-4 h-4" /> },
      { label: "Corporate Filings", icon: <FileText className="w-4 h-4" /> }
    ],
    matters: [
      { title: "Add your first active matter", client: "Add client name", status: "Pending", urgency: "Medium", description: "Click Edit to update this matter with real case details." }
    ]
  },
  kelvin: {
    accent: "blue-400",
    accentHex: "#60A5FA",
    greeting: "Senior Partner's Chambers",
    quote: "\"The appellate court is where law is truly made — be ready to shape it.\"",
    stats: [
      { label: "Active Appeals", value: "—", icon: <Scale className="w-5 h-5 text-blue-400" /> },
      { label: "Briefs Pending", value: "—", icon: <FileText className="w-5 h-5 text-blue-400" /> },
      { label: "Court Dates", value: "—", icon: <Calendar className="w-5 h-5 text-red-400" /> },
      { label: "Cases Researched", value: "—", icon: <BookOpen className="w-5 h-5 text-blue-400" /> }
    ],
    quickLinks: [
      { label: "Appellate Docket", icon: <Scale className="w-4 h-4" /> },
      { label: "Brief Repository", icon: <FileText className="w-4 h-4" /> },
      { label: "Case Law Research", icon: <BookOpen className="w-4 h-4" /> },
      { label: "Court Filings", icon: <Star className="w-4 h-4" /> }
    ],
    matters: [
      { title: "Add your first active matter", client: "Add client name", status: "Pending", urgency: "Medium", description: "Click Edit to update this matter with real case details." }
    ]
  },
  counsel: {
    accent: "yellow-500",
    accentHex: "#EAB308",
    greeting: "Counsel's Chambers",
    quote: "\"Sound legal counsel is the cornerstone of justice and institutional integrity.\"",
    stats: [
      { label: "Active Matters", value: "—", icon: <Briefcase className="w-5 h-5 text-yellow-500" /> },
      { label: "Advisory Briefs", value: "—", icon: <FileText className="w-5 h-5 text-yellow-500" /> },
      { label: "Consultations", value: "—", icon: <Clock className="w-5 h-5 text-yellow-500" /> },
      { label: "Opinions Rendered", value: "—", icon: <Scale className="w-5 h-5 text-yellow-500" /> }
    ],
    quickLinks: [
      { label: "Counsel Docket", icon: <Scale className="w-4 h-4" /> },
      { label: "Legal Opinions", icon: <FileText className="w-4 h-4" /> },
      { label: "Precedent Research", icon: <BookOpen className="w-4 h-4" /> },
      { label: "Client Advisory", icon: <Users className="w-4 h-4" /> }
    ],
    matters: [
      { title: "Add your first active matter", client: "Add client name", status: "Pending", urgency: "Medium", description: "Click Edit to update this matter with real case details." }
    ]
  }
};


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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80" onClick={onClose}>
      <div className="bg-white w-full max-w-sm shadow-2xl border-t-4 border-yellow-500" onClick={e => e.stopPropagation()}>
        <div className="bg-black text-white p-5 flex justify-between items-center">
          <h3 className="font-extrabold uppercase tracking-wider">{monthName} {year}</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400 hover:text-white" /></button>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {['S','M','T','W','T','F','S'].map((d,i) => (
              <div key={i} className="text-[10px] font-bold text-gray-400 uppercase py-1">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1 text-center">
            {blanks.map(i => <div key={`b${i}`} />)}
            {days.map(d => (
              <button key={d} className={`py-2 text-sm font-bold rounded-sm transition-colors
                ${d === today.getDate() ? 'bg-yellow-500 text-black' : 'hover:bg-gray-100 text-gray-700'}`}>
                {d}
              </button>
            ))}
          </div>
        </div>
        <div className="p-5 pt-0">
          <p className="text-xs text-gray-500 text-center">Full calendar integration coming soon</p>
        </div>
      </div>
    </div>
  );
}

function NewFileModal({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<'create' | 'upload'>('create');
  const [title, setTitle] = useState('');
  const [type, setType] = useState('Brief');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (!title.trim()) return;
    setSaved(true);
    setTimeout(onClose, 1200);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80" onClick={onClose}>
      <div className="bg-white w-full max-w-md shadow-2xl border-t-4 border-yellow-500" onClick={e => e.stopPropagation()}>
        <div className="bg-black text-white p-5 flex justify-between items-center">
          <h3 className="font-extrabold uppercase tracking-wider">New File</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400 hover:text-white" /></button>
        </div>
        <div className="flex border-b border-gray-200">
          {(['create', 'upload'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest transition-colors ${tab === t ? 'border-b-2 border-yellow-500 text-black' : 'text-gray-400 hover:text-gray-700'}`}>
              {t === 'create' ? <><Plus className="w-3 h-3 inline mr-1" />Create</> : <><Upload className="w-3 h-3 inline mr-1" />Upload</>}
            </button>
          ))}
        </div>
        {saved ? (
          <div className="p-8 text-center">
            <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-3" />
            <p className="font-bold text-gray-800">File saved successfully!</p>
          </div>
        ) : (
          <div className="p-6 space-y-4">
            {tab === 'create' ? (
              <>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Document Title</label>
                  <input value={title} onChange={e => setTitle(e.target.value)}
                    placeholder="e.g. Appellate Brief — Kariuki v. AG"
                    className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-yellow-500 text-gray-900" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Document Type</label>
                  <select value={type} onChange={e => setType(e.target.value)}
                    className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-yellow-500 text-gray-900">
                    {['Brief', 'Memo', 'Contract', 'Research Note', 'Client Intake', 'Court Filing', 'Other'].map(t => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <button onClick={handleSave}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-black py-3 font-extrabold uppercase tracking-widest text-xs transition-colors">
                  Create Document
                </button>
              </>
            ) : (
              <div className="border-2 border-dashed border-gray-200 rounded-sm p-10 text-center hover:border-yellow-500 transition-colors cursor-pointer">
                <Upload className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                <p className="text-sm font-bold text-gray-600 mb-1">Drop files here or click to browse</p>
                <p className="text-xs text-gray-400">PDF, DOCX, TXT supported</p>
                <p className="text-xs text-gray-400 mt-3">File storage integration coming soon</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function TaskModal({ task, onClose }: { task: typeof TASKS[0]; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80" onClick={onClose}>
      <div className="bg-white w-full max-w-lg shadow-2xl border-t-4 border-yellow-500" onClick={e => e.stopPropagation()}>
        <div className="bg-black text-white p-5 flex justify-between items-start">
          <div>
            <h3 className="font-extrabold uppercase tracking-wider text-yellow-500">{task.title}</h3>
            <p className="text-gray-400 text-xs mt-1">Due: {task.due}</p>
          </div>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400 hover:text-white ml-4" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-3 gap-4 text-xs">
            <div className="text-center p-3 bg-gray-50 border border-gray-100">
              <p className="text-gray-400 uppercase tracking-wider mb-1">Status</p>
              <p className={`font-bold ${task.status === 'Completed' ? 'text-green-600' : task.status === 'In Progress' ? 'text-yellow-600' : 'text-gray-600'}`}>{task.status}</p>
            </div>
            <div className="text-center p-3 bg-gray-50 border border-gray-100">
              <p className="text-gray-400 uppercase tracking-wider mb-1">Priority</p>
              <p className={`font-bold ${task.priority === 'High' ? 'text-red-600' : 'text-yellow-600'}`}>{task.priority}</p>
            </div>
            <div className="text-center p-3 bg-gray-50 border border-gray-100">
              <p className="text-gray-400 uppercase tracking-wider mb-1">Assigned</p>
              <p className="font-bold text-gray-700 text-[10px] leading-tight">{task.assignee}</p>
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Description</p>
            <p className="text-sm text-gray-700 leading-relaxed">{task.description}</p>
          </div>
        </div>
        <div className="p-6 pt-0">
          <button onClick={onClose} className="w-full bg-black text-white py-3 font-bold uppercase tracking-widest text-xs hover:bg-gray-900 transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function EditableStat({ label, icon }: { label: string; icon: React.ReactNode }) {
  const [val, setVal] = useState('—');
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('—');

  const commit = () => { setVal(draft); setEditing(false); };

  return (
    <div className="bg-white border border-gray-200 p-6 shadow-sm group relative" title="Click value to edit">
      <div className="flex items-center justify-between mb-2">
        {icon}
        <button onClick={() => { setDraft(val); setEditing(true); }} className="opacity-0 group-hover:opacity-100 transition-opacity">
          <Pencil className="w-3 h-3 text-gray-400 hover:text-yellow-500" />
        </button>
      </div>
      {editing ? (
        <div>
          <input value={draft} onChange={e => setDraft(e.target.value)} onBlur={commit} onKeyDown={e => e.key === 'Enter' && commit()}
            className="text-2xl font-bold text-black w-full border-b-2 border-yellow-500 focus:outline-none bg-transparent" autoFocus />
          <p className="text-xs text-gray-400 mt-1">Press Enter to save</p>
        </div>
      ) : (
        <span className="text-3xl font-bold text-black block mb-1 cursor-pointer hover:text-yellow-500 transition-colors" onClick={() => { setDraft(val); setEditing(true); }}>
          {val}
        </span>
      )}
      <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">{label}</span>
    </div>
  );
}

export default function OfficePage() {
  const { officeId } = useParams<{ officeId: string }>();
  const { firmUser, loading, logout } = useAuth();
  const [, setLocation] = useLocation();

  const [showCalendar, setShowCalendar] = useState(false);
  const [showNewFile, setShowNewFile] = useState(false);
  const [activeTask, setActiveTask] = useState<typeof TASKS[0] | null>(null);
  const [showAllAlerts, setShowAllAlerts] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState('');
  const [searching, setSearching] = useState(false);
  const [profile, setProfile] = useState(() => firmUser ? loadProfile(firmUser.name) : null);

  useEffect(() => {
    if (!loading && !firmUser) { setLocation("/login"); return; }
    if (!loading && firmUser && firmUser.officeId !== officeId) { setLocation(`/office/${firmUser.officeId}`); }
    if (firmUser) setProfile(loadProfile(firmUser.name));

    const handleProfileUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && firmUser && customEvent.detail.name === firmUser.name) {
        setProfile(customEvent.detail);
      }
    };

    window.addEventListener("lexvanguard_profile_updated", handleProfileUpdate);
    return () => window.removeEventListener("lexvanguard_profile_updated", handleProfileUpdate);
  }, [firmUser, loading, officeId, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!firmUser || !profile) return null;

  const defaultOffice = {
    accent: "yellow-500",
    accentHex: "#EAB308",
    greeting: `${(officeId || 'counsel').charAt(0).toUpperCase() + (officeId || 'counsel').slice(1)}'s Chambers`,
    quote: "\"Sound legal counsel and diligent practice are the bedrock of institutional justice.\"",
    stats: [
      { label: "Active Matters", value: "—", icon: <Briefcase className="w-5 h-5 text-yellow-500" /> },
      { label: "Pending Tasks", value: "—", icon: <Clock className="w-5 h-5 text-yellow-500" /> },
      { label: "Deadlines", value: "—", icon: <AlertCircle className="w-5 h-5 text-red-400" /> },
      { label: "Files", value: "—", icon: <FileText className="w-5 h-5 text-yellow-500" /> }
    ],
    quickLinks: [
      { label: "Office Overview", icon: <BarChart2 className="w-4 h-4" /> },
      { label: "My Tasks", icon: <CheckCircle className="w-4 h-4" /> },
      { label: "Document Library", icon: <FileText className="w-4 h-4" /> },
      { label: "Legal Research", icon: <BookOpen className="w-4 h-4" /> }
    ],
    matters: [
      { title: "Add your first active matter", client: "Add client name", status: "Pending", urgency: "Medium", description: "Click Edit to update this matter with real case details." }
    ]
  };

  const config = OFFICE_CONFIG[officeId] || defaultOffice;

  const accentHex = config.accentHex;

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    setTimeout(() => {
      setSearchResult(`LexAI Search: "${searchQuery}" — Live AI integration coming soon. This feature will connect to the Vanguard Knowledge Graph to summarize case law, firm templates, and legislation in real time.`);
      setSearching(false);
    }, 1200);
  };

  const [uploadingImage, setUploadingImage] = useState(false);

  const updateProfile = (field: keyof typeof profile, value: string) => {
    const updated = { ...profile!, [field]: value };
    setProfile(updated);
    saveProfile(updated);
  };

  const ALERTS = [
    { icon: <FileText className="w-4 h-4 text-yellow-500" />, title: "Appellate Brief Uploaded", time: "By A. Pendelton • Today, 9:00 AM" },
    { icon: <CheckCircle className="w-4 h-4 text-green-500" />, title: "Client Intake Form Approved", time: "System • Yesterday, 4:30 PM" },
    { icon: <Bell className="w-4 h-4 text-gray-400" />, title: "Meeting Scheduled: Corp Tech", time: "Tomorrow, 10:00 AM" },
    { icon: <AlertCircle className="w-4 h-4 text-red-400" />, title: "Deadline Reminder: Brief Filing", time: "Apr 2, 2026 — 5 days remaining" },
    { icon: <Users className="w-4 h-4 text-blue-400" />, title: "New Member Onboarded", time: "Sharon Mwariri — Today, 8:00 AM" }
  ];
  const visibleAlerts = showAllAlerts ? ALERTS : ALERTS.slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      {showCalendar && <CalendarModal onClose={() => setShowCalendar(false)} />}
      {showNewFile && <NewFileModal onClose={() => setShowNewFile(false)} />}
      {activeTask && <TaskModal task={activeTask} onClose={() => setActiveTask(null)} />}

      <div className="bg-black">
        <Header />
      </div>

      <div className="pt-28 pb-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">

          {/* Office Banner */}
          <div className="bg-black text-white p-7 shadow-lg mb-8 relative overflow-hidden" style={{ borderBottom: `4px solid ${accentHex}` }}>
            <div className="absolute inset-0 opacity-[0.03]" style={{backgroundImage: 'repeating-linear-gradient(45deg, #ffffff 0, #ffffff 1px, transparent 0, transparent 50%)', backgroundSize: '12px 12px'}} />
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="w-2 h-7 inline-block" style={{ backgroundColor: accentHex }} />
                  <h1 className="text-xl md:text-2xl font-extrabold uppercase tracking-widest" style={{ color: accentHex }}>
                    {config.greeting}
                  </h1>
                </div>
                <p className="text-gray-300 ml-5">
                  Welcome back, <span className="font-bold" style={{ color: accentHex }}>{firmUser.name}</span>
                  <span className="text-gray-500 text-sm ml-3">· {firmUser.role.name}</span>
                </p>
                <p className="text-gray-500 text-xs italic mt-1 ml-5">{config.quote}</p>
              </div>
              <div className="flex gap-3 flex-wrap ml-5 md:ml-0">
                <button onClick={() => setShowCalendar(true)}
                  className="flex items-center gap-2 bg-white/10 border border-white/20 hover:bg-white/20 text-white px-4 py-2 text-xs font-bold uppercase tracking-widest transition-colors">
                  <Calendar className="w-4 h-4" /> Calendar
                </button>
                <button onClick={() => setShowNewFile(true)}
                  className="flex items-center gap-2 text-black px-4 py-2 text-xs font-bold uppercase tracking-widest transition-colors hover:opacity-90"
                  style={{ backgroundColor: accentHex }}>
                  <FileText className="w-4 h-4" /> New File
                </button>
                <button onClick={logout}
                  className="flex items-center gap-2 border border-red-500/50 hover:bg-red-500/10 text-red-400 px-4 py-2 text-xs font-bold uppercase tracking-widest transition-colors">
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            </div>
          </div>

          {/* Profile Info Banner (editable) */}
          <div className="bg-white border border-gray-200 p-5 mb-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="relative group shrink-0">
              <img
                src={profile.image}
                alt={firmUser.name}
                onError={(e) => handleProfileImageError(e, firmUser.name)}
                className="w-16 h-20 object-cover border-2"
                style={{ borderColor: accentHex }}
              />
              <label
                className="absolute inset-0 bg-black/70 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-center text-[10px] font-bold p-1"
                title="Click to upload profile photo to ImgBB"
              >
                {uploadingImage ? (
                  <>
                    <Loader2 className="w-4 h-4 mb-0.5 text-yellow-500 animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mb-0.5 text-yellow-500" />
                    <span>Upload</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  disabled={uploadingImage}
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (file.size > 10 * 1024 * 1024) {
                      alert("Image size should be under 10MB");
                      return;
                    }
                    try {
                      setUploadingImage(true);
                      const imageUrl = await uploadToImgBB(file, firmUser.name);
                      updateProfile('image', imageUrl);
                    } catch (err: any) {
                      console.error("ImgBB upload error:", err);
                      alert("Failed to upload image: " + (err?.message || "Please try again"));
                    } finally {
                      setUploadingImage(false);
                    }
                  }}
                />
              </label>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Pencil className="w-3 h-3 text-yellow-500" />
                <span className="text-[10px] text-yellow-600 font-bold uppercase tracking-wider">Your Office Profile — click any item or hover photo to update</span>
              </div>
              <p className="font-extrabold text-black text-sm uppercase tracking-wide">{firmUser.name}</p>
              <div className="text-xs text-gray-500 mt-1 flex flex-wrap gap-3">
                <span className="cursor-pointer hover:text-yellow-500 transition-colors" onClick={() => {
                  const v = prompt('Edit practice area:', profile.practice);
                  if (v !== null) updateProfile('practice', v);
                }}>
                  Practice: <span className="text-gray-700 font-semibold">{profile.practice}</span>
                </span>
                <span className="cursor-pointer hover:text-yellow-500 transition-colors" onClick={() => {
                  const v = prompt('Edit email:', profile.email);
                  if (v !== null) updateProfile('email', v);
                }}>
                  Email: <span className="text-gray-700 font-semibold">{profile.email}</span>
                </span>
              </div>
            </div>
            <button
              onClick={() => setLocation('/attorneys')}
              className="shrink-0 text-xs font-bold uppercase tracking-widest text-black border-b-2 border-black hover:text-yellow-500 hover:border-yellow-500 transition-colors bg-transparent whitespace-nowrap">
              Public Profile »
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {config.stats.map((stat, i) => (
              <EditableStat key={i} label={stat.label} icon={stat.icon} />
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* Active Matters */}
              <div className="bg-white border border-gray-200 shadow-sm">
                <div className="p-5 border-b border-gray-100 flex items-center justify-between" style={{ borderTop: `4px solid ${accentHex}` }}>
                  <div className="flex items-center gap-3">
                    <Scale className="w-5 h-5 text-gray-600" />
                    <h3 className="text-base font-extrabold text-black uppercase tracking-wider">Active Matters</h3>
                  </div>
                  <span className="text-xs text-gray-400 italic">Add your real cases here via the Attorneys page</span>
                </div>
                {config.matters.map((m, i) => (
                  <div key={i} className="p-5 border-b border-gray-50 last:border-b-0 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-gray-50 transition-colors">
                    <div className="mb-2 sm:mb-0">
                      <h4 className="font-bold text-gray-700 italic">{m.title}</h4>
                      <p className="text-sm text-gray-400">{m.client}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-gray-400 uppercase">{m.status}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* All Tasks */}
              <div className="bg-white border border-gray-200 shadow-sm">
                <div className="p-5 border-b border-gray-100 flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-gray-600" />
                  <h3 className="text-base font-extrabold text-black uppercase tracking-wider">Firm Tasks</h3>
                </div>
                <div className="divide-y divide-gray-50">
                  {TASKS.map(task => (
                    <div key={task.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-gray-50 transition-colors">
                      <div className="mb-2 sm:mb-0">
                        <h4 className="font-bold text-gray-900">{task.title}</h4>
                        <p className="text-sm text-gray-500">Assigned: {task.assignee} · Due: {task.due}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`text-sm font-semibold ${task.status === 'Completed' ? 'text-green-600' : task.status === 'In Progress' ? 'text-yellow-600' : 'text-gray-500'}`}>
                          {task.status}
                        </span>
                        <button onClick={() => setActiveTask(task)}
                          className="text-xs font-bold uppercase tracking-widest text-black hover:text-yellow-500 transition-colors bg-transparent border-b border-black hover:border-yellow-500 pb-0.5 cursor-pointer">
                          Details »
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* LexAI */}
              <div className="bg-black text-white p-8 border-b-4 border-yellow-500">
                <h3 className="text-lg font-extrabold text-white mb-1 uppercase tracking-wider">LexAI Legal Research</h3>
                <p className="text-gray-400 text-sm mb-5 leading-relaxed">Query precedents, access firm templates, or summarize complex litigation documents.</p>
                <div className="flex mb-3">
                  <input
                    type="text"
                    placeholder="e.g. search for constitutional law precedents..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSearch()}
                    className="flex-1 border-none text-gray-900 px-4 py-3 focus:outline-none text-sm"
                  />
                  <button onClick={handleSearch}
                    className="bg-yellow-500 hover:bg-yellow-600 px-5 flex items-center justify-center font-bold uppercase text-xs tracking-wider text-black transition-colors">
                    {searching ? <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> : <><Search className="w-4 h-4 mr-1" />Search</>}
                  </button>
                </div>
                {searchResult && (
                  <div className="bg-white/10 border border-white/20 p-4 text-sm text-gray-300 leading-relaxed rounded-sm">
                    {searchResult}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Links */}
              <div className="bg-white border border-gray-200 shadow-sm">
                <div className="p-5 border-b border-gray-100">
                  <h3 className="text-sm font-extrabold text-black uppercase tracking-wider">Quick Access</h3>
                </div>
                {config.quickLinks.map((link, i) => (
                  <button key={i} className="w-full flex items-center gap-3 p-4 border-b border-gray-50 last:border-b-0 hover:bg-gray-50 transition-colors text-left">
                    <span className="text-gray-500">{link.icon}</span>
                    <span className="text-sm font-semibold text-gray-800 flex-1">{link.label}</span>
                    <ChevronRight className="w-4 h-4 text-gray-300" />
                  </button>
                ))}
              </div>

              {/* System Alerts */}
              <div className="bg-white border border-gray-200 shadow-sm">
                <div className="p-5 border-b border-gray-100">
                  <h3 className="text-sm font-extrabold text-black uppercase tracking-wider">System Alerts</h3>
                </div>
                <div className="p-5 space-y-4">
                  {visibleAlerts.map((alert, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="mt-0.5 shrink-0">{alert.icon}</div>
                      <div>
                        <p className="font-bold text-gray-800 text-sm">{alert.title}</p>
                        <p className="text-xs text-gray-500">{alert.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 border-t border-gray-100">
                  <button onClick={() => setShowAllAlerts(!showAllAlerts)}
                    className="w-full flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-600 hover:text-black transition-colors bg-gray-50 hover:bg-gray-100 py-2 border border-gray-200">
                    {showAllAlerts ? 'Show Less' : 'View Full Log'}
                    <ChevronDown className={`w-3 h-3 transition-transform ${showAllAlerts ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Profile Card */}
              <div className="bg-black text-white p-6" style={{ borderTop: `4px solid ${accentHex}` }}>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 border-2 flex items-center justify-center text-xl font-extrabold"
                    style={{ borderColor: accentHex, color: accentHex }}>
                    {firmUser.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm">{firmUser.name}</p>
                    <p className="text-xs text-gray-400">{firmUser.role.name}</p>
                  </div>
                </div>
                <button onClick={() => setLocation('/attorneys')}
                  className="w-full flex items-center justify-center gap-2 border border-white/20 hover:bg-white/10 text-gray-300 py-2 text-xs font-bold uppercase tracking-widest transition-colors mb-2">
                  <Pencil className="w-3 h-3" /> Edit Public Profile
                </button>
                <button onClick={logout}
                  className="w-full flex items-center justify-center gap-2 border border-red-500/40 hover:bg-red-500/10 text-red-400 py-2 text-xs font-bold uppercase tracking-widest transition-colors">
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
