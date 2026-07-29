import { db } from "./firebase";
import { collection, onSnapshot, setDoc, doc, deleteDoc, query, orderBy } from "firebase/firestore";

export interface ChambersTask {
  id: string;
  officeId: string;
  title: string;
  assignee: string;
  due: string;
  status: "Pending" | "In Progress" | "Completed";
  priority: "Low" | "Medium" | "High";
  description: string;
  createdAt: string;
  createdBy?: string;
}

export interface ChambersMatter {
  id: string;
  officeId: string;
  title: string;
  client: string;
  status: "Active" | "Pending" | "In Review" | "Closed";
  urgency: "Low" | "Medium" | "High";
  description: string;
  leadAttorney?: string;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  officeId: string;
  iconType: "file" | "check" | "bell" | "alert" | "user";
  title: string;
  details?: string;
  actorName?: string;
  time: string;
  timestamp: number;
}

export interface ChambersDocument {
  id: string;
  officeId: string;
  title: string;
  type: string;
  uploadedBy: string;
  uploadedAt: string;
  size?: string;
  fileUrl?: string;
}

export interface ChambersResearchItem {
  id: string;
  officeId: string;
  matterId?: string;
  matterTitle?: string;
  query: string;
  summary: string;
  sources: { title: string; uri: string }[];
  notes?: string;
  createdByName: string;
  createdAt: string;
}

export interface ChambersSubmission {
  id: string;
  officeId: string;
  matterId?: string;
  matterTitle: string;
  submissionType: string;
  courtForum: string;
  title: string;
  content: string;
  createdByName: string;
  createdAt: string;
  status: "Draft" | "Final" | "Filed";
}

export interface DirectMessage {
  id: string;
  senderUid: string;
  senderName: string;
  recipientUid: string; // member UID or 'all'
  recipientName: string;
  content: string;
  timestamp: string;
  timeFormatted: string;
  matterId?: string;
  matterTitle?: string;
  resourceTitle?: string;
  resourceUrl?: string;
}

export interface ChambersInvoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  matterTitle: string;
  officeId: string;
  amount: number;
  vatAmount: number;
  totalAmount: number;
  issueDate: string;
  dueDate: string;
  status: "Draft" | "Issued" | "Paid" | "Overdue";
  items: { description: string; hoursOrQty: number; rate: number; total: number }[];
  notes?: string;
  paidAt?: string;
}

export interface StkPushTransaction {
  id: string;
  phoneNumber: string;
  amount: number;
  clientName: string;
  matterTitle: string;
  referenceDoc: string;
  status: "Pending" | "Success" | "Failed";
  mpesaReceiptNumber?: string;
  timestamp: string;
  initiatedBy: string;
}

// Initial default seed data for immediate display
const INITIAL_TASKS: ChambersTask[] = [
  {
    id: "task_1",
    officeId: "prince",
    title: "Draft M&A Term Sheet — Vanguard Acquisition",
    assignee: "Prince Micah",
    due: "Tomorrow, 5:00 PM",
    status: "In Progress",
    priority: "High",
    description: "Review due diligence report and finalize share purchase terms with target firm.",
    createdAt: new Date().toISOString(),
    createdBy: "Prince Micah"
  },
  {
    id: "task_2",
    officeId: "kelvin",
    title: "Appellate Brief Filing — Kariuki v. AG",
    assignee: "Kelvin Musya",
    due: "Apr 2, 2026",
    status: "In Progress",
    priority: "High",
    description: "Finalize constitutional appeal grounds and prepare core precedent authorities for Supreme Court.",
    createdAt: new Date().toISOString(),
    createdBy: "Kelvin Musya"
  },
  {
    id: "task_3",
    officeId: "counsel",
    title: "Client Intake & Conflict Check — Apex Innovations",
    assignee: "Counsel Chambers",
    due: "Apr 5, 2026",
    status: "Pending",
    priority: "Medium",
    description: "Perform IP registry cross-checks for Apex Innovations trademark filing.",
    createdAt: new Date().toISOString(),
    createdBy: "System"
  }
];

const INITIAL_MATTERS: ChambersMatter[] = [
  {
    id: "matter_1",
    officeId: "prince",
    title: "Commercial Litigation — Phase I",
    client: "Vanguard Tech Corp",
    status: "Active",
    urgency: "High",
    description: "Pre-trial preparation, witness statement reviews, and electronic discovery disclosure.",
    leadAttorney: "Prince Micah",
    createdAt: new Date().toISOString()
  },
  {
    id: "matter_2",
    officeId: "kelvin",
    title: "Supreme Court Appeal Grounds",
    client: "Crown Energy Ltd",
    status: "In Review",
    urgency: "Medium",
    description: "Constitutional review of Energy Regulatory Board licensing decisions.",
    leadAttorney: "Kelvin Musya",
    createdAt: new Date().toISOString()
  },
  {
    id: "matter_3",
    officeId: "counsel",
    title: "Intellectual Property & Patent Protection",
    client: "Apex Innovations",
    status: "Active",
    urgency: "Medium",
    description: "International patent application filing under the African Regional Intellectual Property Organization.",
    leadAttorney: "Counsel",
    createdAt: new Date().toISOString()
  }
];

const INITIAL_LOGS: ActivityLog[] = [
  {
    id: "log_1",
    officeId: "all",
    iconType: "file",
    title: "Appellate Brief Uploaded",
    details: "By A. Pendelton into Chambers Docket",
    actorName: "A. Pendelton",
    time: "Today, 9:00 AM",
    timestamp: Date.now() - 3600000
  },
  {
    id: "log_2",
    officeId: "all",
    iconType: "check",
    title: "Client Intake Approved",
    details: "Apex Innovations conflict clearance verified",
    actorName: "Managing Partner",
    time: "Yesterday, 4:30 PM",
    timestamp: Date.now() - 86400000
  },
  {
    id: "log_3",
    officeId: "all",
    iconType: "bell",
    title: "Hearing Scheduled: Corp Tech vs ERB",
    details: "Milimani High Court Courtroom 4",
    actorName: "Registry",
    time: "Tomorrow, 10:00 AM",
    timestamp: Date.now() - 43200000
  },
  {
    id: "log_4",
    officeId: "all",
    iconType: "alert",
    title: "Filing Deadline Reminder",
    details: "Supreme Court Appellate Brief due in 5 days",
    actorName: "Calendar System",
    time: "Apr 2, 2026",
    timestamp: Date.now() - 172800000
  }
];

const INITIAL_DOCS: ChambersDocument[] = [
  {
    id: "doc_1",
    officeId: "prince",
    title: "M&A Share Purchase Agreement — Draft v2.pdf",
    type: "Contract",
    uploadedBy: "Prince Micah",
    uploadedAt: "2026-07-28",
    size: "2.4 MB"
  },
  {
    id: "doc_2",
    officeId: "kelvin",
    title: "Supreme Court Petition of Appeal — Final.pdf",
    type: "Brief",
    uploadedBy: "Kelvin Musya",
    uploadedAt: "2026-07-27",
    size: "4.1 MB"
  }
];

const INITIAL_RESEARCH: ChambersResearchItem[] = [
  {
    id: "res_1",
    officeId: "kelvin",
    matterId: "matter_2",
    matterTitle: "Supreme Court Appeal Grounds",
    query: "Constitutional grounds for appealing administrative decisions of energy regulatory authorities under Article 47 of Constitution of Kenya 2010",
    summary: "Article 47 guarantees fair administrative action. Under the Fair Administrative Action Act 2015 and Supreme Court rulings in Judicial Service Commission v. Mbalu Mutava, regulatory tribunals must afford natural justice before license revoking.",
    sources: [
      { title: "Kenya Law Reports — Supreme Court Jurisprudence", uri: "http://kenyalaw.org/caselaw/" },
      { title: "Constitution of Kenya 2010 — Article 47", uri: "http://kenyalaw.org/kl/index.php?id=398" }
    ],
    notes: "Key precedent to cite in paragraph 14 of the petition.",
    createdByName: "Kelvin Musya",
    createdAt: new Date().toISOString().split("T")[0]
  },
  {
    id: "res_2",
    officeId: "prince",
    matterId: "matter_1",
    matterTitle: "Commercial Litigation — Phase I",
    query: "Threshold for granting interlocutory mandatory injunctions in commercial contract breaches under Civil Procedure Rules",
    summary: "As articulated by the Court of Appeal in Giella v. Cassman Brown & Co. Ltd [1973], the applicant must demonstrate a prima facie case with a probability of success, irreparable injury that damages cannot remedy, and balance of convenience.",
    sources: [
      { title: "Giella v. Cassman Brown & Co. Ltd [1973] EA 358", uri: "http://kenyalaw.org/caselaw/" }
    ],
    notes: "Attached to motion for interim protection.",
    createdByName: "Prince Micah",
    createdAt: new Date().toISOString().split("T")[0]
  }
];

const INITIAL_SUBMISSIONS: ChambersSubmission[] = [
  {
    id: "sub_1",
    officeId: "kelvin",
    matterId: "matter_2",
    matterTitle: "Supreme Court Appeal Grounds",
    submissionType: "Appellate Brief",
    courtForum: "Supreme Court of Kenya",
    title: "Petition of Appeal on Fair Administrative Action",
    content: "IN THE SUPREME COURT OF KENYA AT NAIROBI\nPETITION NO. 14 OF 2026\n\nBETWEEN:\nCROWN ENERGY LIMITED — APPELLANT\nAND\nENERGY & PETROLEUM REGULATORY AUTHORITY — RESPONDENT\n\nPETITION OF APPEAL\n\nTAKE NOTICE that the Appellant, being dissatisfied with the decision of the Court of Appeal, appeals to the Supreme Court on the following grounds:\n\n1. The learned Appellate Judges erred in law in holding that natural justice principles under Article 47 do not apply to summary licensing suspensions.\n2. The Court failed to apply Section 4 of the Fair Administrative Action Act 2015.\n\nPRAYER FOR RELIEF:\na) That this Appeal be allowed with costs.\nb) An order quashing the revocation notice issued by the Respondent.",
    createdByName: "Kelvin Musya",
    createdAt: new Date().toISOString().split("T")[0],
    status: "Draft"
  }
];

const INITIAL_MESSAGES: DirectMessage[] = [
  {
    id: "msg_1",
    senderUid: "n6NKoyAIuVSXYEaIbRVN9drINNy1",
    senderName: "Prince Micah",
    recipientUid: "SSbNEJrVyhM6b8LbWYsyunPGk6l2",
    recipientName: "Kelvin Musya",
    content: "Kelvin, please review the draft share purchase agreement for Vanguard Tech Corp before tomorrow's filing.",
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    timeFormatted: "2 hours ago",
    matterId: "matter_1",
    matterTitle: "Commercial Litigation — Phase I",
    resourceTitle: "M&A Share Purchase Agreement — Draft v2.pdf"
  },
  {
    id: "msg_2",
    senderUid: "SSbNEJrVyhM6b8LbWYsyunPGk6l2",
    senderName: "Kelvin Musya",
    recipientUid: "n6NKoyAIuVSXYEaIbRVN9drINNy1",
    recipientName: "Prince Micah",
    content: "Reviewed. The indemnification clause looks solid. I have added a cross-reference to Article 47 constitutional safeguards.",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    timeFormatted: "1 hour ago",
    matterId: "matter_1",
    matterTitle: "Commercial Litigation — Phase I"
  },
  {
    id: "msg_3",
    senderUid: "linet_njeri_uid",
    senderName: "Linet Njeri",
    recipientUid: "all",
    recipientName: "All Counsel",
    content: "Reminder: All court fee disbursement receipts for Q2 must be submitted to the Finance office by Friday.",
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    timeFormatted: "30 mins ago"
  }
];

const INITIAL_INVOICES: ChambersInvoice[] = [
  {
    id: "inv_1001",
    invoiceNumber: "LV-2026-089",
    clientName: "Crown Energy Ltd",
    matterTitle: "Supreme Court Appeal Grounds",
    officeId: "kelvin",
    amount: 450000,
    vatAmount: 72000,
    totalAmount: 522000,
    issueDate: "2026-07-15",
    dueDate: "2026-08-15",
    status: "Issued",
    items: [
      { description: "Appellate Brief Drafting & Research (Senior Counsel)", hoursOrQty: 12, rate: 25000, total: 300000 },
      { description: "Court Registry Filing & Document Service Disbursements", hoursOrQty: 1, rate: 150000, total: 150000 }
    ],
    notes: "Retainer invoice for Supreme Court Appeal."
  },
  {
    id: "inv_1002",
    invoiceNumber: "LV-2026-090",
    clientName: "Vanguard Tech Corp",
    matterTitle: "Commercial Litigation — Phase I",
    officeId: "prince",
    amount: 800000,
    vatAmount: 128000,
    totalAmount: 928000,
    issueDate: "2026-07-20",
    dueDate: "2026-08-20",
    status: "Paid",
    paidAt: "2026-07-25",
    items: [
      { description: "M&A Due Diligence & Contract Execution", hoursOrQty: 20, rate: 30000, total: 600000 },
      { description: "Interlocutory Injunction Representation", hoursOrQty: 8, rate: 25000, total: 200000 }
    ],
    notes: "Paid via Direct Bank Transfer."
  }
];

const INITIAL_TRANSACTIONS: StkPushTransaction[] = [
  {
    id: "stk_1",
    phoneNumber: "254712345678",
    amount: 150000,
    clientName: "Apex Innovations",
    matterTitle: "Intellectual Property & Patent Protection",
    referenceDoc: "LV-2026-091",
    status: "Success",
    mpesaReceiptNumber: "MPESA-WSX98212",
    timestamp: "2026-07-28 14:20",
    initiatedBy: "Linet Njeri (Finance)"
  }
];

// LocalStorage helpers
function loadLocal<T>(key: string, defaultVal: T): T {
  try {
    if (typeof localStorage !== "undefined") {
      const saved = localStorage.getItem(key);
      if (saved) return JSON.parse(saved);
    }
  } catch (err) {
    console.warn("Error reading localStorage key:", key, err);
  }
  return defaultVal;
}

function saveLocal<T>(key: string, value: T) {
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(key, JSON.stringify(value));
    }
  } catch (err) {
    console.warn("Error writing localStorage key:", key, err);
  }
}

// Memory stores initialized from LocalStorage
let currentTasks: ChambersTask[] = loadLocal("lex_chambers_tasks", INITIAL_TASKS);
let currentMatters: ChambersMatter[] = loadLocal("lex_chambers_matters", INITIAL_MATTERS);
let currentLogs: ActivityLog[] = loadLocal("lex_chambers_logs", INITIAL_LOGS);
let currentDocs: ChambersDocument[] = loadLocal("lex_chambers_docs", INITIAL_DOCS);
let currentResearch: ChambersResearchItem[] = loadLocal("lex_chambers_research", INITIAL_RESEARCH);
let currentSubmissions: ChambersSubmission[] = loadLocal("lex_chambers_submissions", INITIAL_SUBMISSIONS);
let currentMessages: DirectMessage[] = loadLocal("lex_chambers_messages", INITIAL_MESSAGES);
let currentInvoices: ChambersInvoice[] = loadLocal("lex_chambers_invoices", INITIAL_INVOICES);
let currentTransactions: StkPushTransaction[] = loadLocal("lex_chambers_stk_tx", INITIAL_TRANSACTIONS);

// Listeners
type Callback<T> = (data: T[]) => void;
const taskListeners: Set<Callback<ChambersTask>> = new Set();
const matterListeners: Set<Callback<ChambersMatter>> = new Set();
const logListeners: Set<Callback<ActivityLog>> = new Set();
const docListeners: Set<Callback<ChambersDocument>> = new Set();
const researchListeners: Set<Callback<ChambersResearchItem>> = new Set();
const submissionListeners: Set<Callback<ChambersSubmission>> = new Set();
const messageListeners: Set<Callback<DirectMessage>> = new Set();
const invoiceListeners: Set<Callback<ChambersInvoice>> = new Set();
const stkListeners: Set<Callback<StkPushTransaction>> = new Set();

function notifyTasks() {
  saveLocal("lex_chambers_tasks", currentTasks);
  taskListeners.forEach(cb => cb([...currentTasks]));
}

function notifyMatters() {
  saveLocal("lex_chambers_matters", currentMatters);
  matterListeners.forEach(cb => cb([...currentMatters]));
}

function notifyLogs() {
  saveLocal("lex_chambers_logs", currentLogs);
  logListeners.forEach(cb => cb([...currentLogs]));
}

function notifyDocs() {
  saveLocal("lex_chambers_docs", currentDocs);
  docListeners.forEach(cb => cb([...currentDocs]));
}

function notifyResearch() {
  saveLocal("lex_chambers_research", currentResearch);
  researchListeners.forEach(cb => cb([...currentResearch]));
}

function notifySubmissions() {
  saveLocal("lex_chambers_submissions", currentSubmissions);
  submissionListeners.forEach(cb => cb([...currentSubmissions]));
}

function notifyMessages() {
  saveLocal("lex_chambers_messages", currentMessages);
  messageListeners.forEach(cb => cb([...currentMessages]));
}

function notifyInvoices() {
  saveLocal("lex_chambers_invoices", currentInvoices);
  invoiceListeners.forEach(cb => cb([...currentInvoices]));
}

function notifyStk() {
  saveLocal("lex_chambers_stk_tx", currentTransactions);
  stkListeners.forEach(cb => cb([...currentTransactions]));
}

// ----------------- Firestore Sync Setup -----------------
let initializedFirestore = false;

function setupFirestoreSync() {
  if (initializedFirestore || !db) return;
  initializedFirestore = true;

  try {
    // Sync Tasks
    const tasksRef = collection(db, "chambers_tasks");
    onSnapshot(tasksRef, (snap) => {
      if (!snap.empty) {
        const remoteTasks: ChambersTask[] = [];
        snap.forEach(d => remoteTasks.push(d.data() as ChambersTask));
        currentTasks = remoteTasks;
        notifyTasks();
      }
    }, (err) => console.warn("Firestore tasks snapshot fallback to local:", err.message));

    // Sync Matters
    const mattersRef = collection(db, "chambers_matters");
    onSnapshot(mattersRef, (snap) => {
      if (!snap.empty) {
        const remoteMatters: ChambersMatter[] = [];
        snap.forEach(d => remoteMatters.push(d.data() as ChambersMatter));
        currentMatters = remoteMatters;
        notifyMatters();
      }
    }, (err) => console.warn("Firestore matters snapshot fallback to local:", err.message));

    // Sync Logs
    const logsRef = collection(db, "chambers_logs");
    onSnapshot(logsRef, (snap) => {
      if (!snap.empty) {
        const remoteLogs: ActivityLog[] = [];
        snap.forEach(d => remoteLogs.push(d.data() as ActivityLog));
        remoteLogs.sort((a, b) => b.timestamp - a.timestamp);
        currentLogs = remoteLogs;
        notifyLogs();
      }
    }, (err) => console.warn("Firestore logs snapshot fallback to local:", err.message));

    // Sync Documents
    const docsRef = collection(db, "chambers_docs");
    onSnapshot(docsRef, (snap) => {
      if (!snap.empty) {
        const remoteDocs: ChambersDocument[] = [];
        snap.forEach(d => remoteDocs.push(d.data() as ChambersDocument));
        currentDocs = remoteDocs;
        notifyDocs();
      }
    }, (err) => console.warn("Firestore docs snapshot fallback to local:", err.message));

    // Sync Research Items
    const researchRef = collection(db, "chambers_research");
    onSnapshot(researchRef, (snap) => {
      if (!snap.empty) {
        const remoteResearch: ChambersResearchItem[] = [];
        snap.forEach(d => remoteResearch.push(d.data() as ChambersResearchItem));
        currentResearch = remoteResearch;
        notifyResearch();
      }
    }, (err) => console.warn("Firestore research snapshot fallback to local:", err.message));

    // Sync Submissions
    const submissionsRef = collection(db, "chambers_submissions");
    onSnapshot(submissionsRef, (snap) => {
      if (!snap.empty) {
        const remoteSubmissions: ChambersSubmission[] = [];
        snap.forEach(d => remoteSubmissions.push(d.data() as ChambersSubmission));
        currentSubmissions = remoteSubmissions;
        notifySubmissions();
      }
    }, (err) => console.warn("Firestore submissions snapshot fallback to local:", err.message));

  } catch (err) {
    console.warn("Firestore setup warning:", err);
  }
}

// Call setup
setupFirestoreSync();

// ----------------- Public Subscription & CRUD API -----------------

// TASKS
export function subscribeTasks(cb: Callback<ChambersTask>): () => void {
  taskListeners.add(cb);
  cb([...currentTasks]);
  return () => taskListeners.delete(cb);
}

export async function addTask(task: Omit<ChambersTask, "id" | "createdAt">): Promise<ChambersTask> {
  const newTask: ChambersTask = {
    ...task,
    id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    createdAt: new Date().toISOString()
  };

  currentTasks = [newTask, ...currentTasks];
  notifyTasks();

  // Record activity log
  addLog({
    officeId: newTask.officeId,
    iconType: "check",
    title: `New Task Assigned: ${newTask.title}`,
    details: `Assigned to ${newTask.assignee} (${newTask.priority} Priority)`,
    actorName: newTask.createdBy || newTask.assignee,
    time: "Just now"
  });

  // Try sync to Firestore
  try {
    if (db) {
      await setDoc(doc(db, "chambers_tasks", newTask.id), newTask);
    }
  } catch (err) {
    console.warn("Saved task locally (Firestore bypass):", err);
  }

  return newTask;
}

export async function updateTaskStatus(id: string, newStatus: ChambersTask["status"]): Promise<void> {
  let updatedTask: ChambersTask | null = null;
  currentTasks = currentTasks.map(t => {
    if (t.id === id) {
      updatedTask = { ...t, status: newStatus };
      return updatedTask;
    }
    return t;
  });

  notifyTasks();

  if (updatedTask) {
    addLog({
      officeId: (updatedTask as ChambersTask).officeId,
      iconType: newStatus === "Completed" ? "check" : "bell",
      title: `Task Status Updated: ${(updatedTask as ChambersTask).title}`,
      details: `Status set to ${newStatus}`,
      time: "Just now"
    });

    try {
      if (db) {
        await setDoc(doc(db, "chambers_tasks", id), updatedTask);
      }
    } catch (err) {
      console.warn("Updated task locally:", err);
    }
  }
}

export async function deleteTask(id: string): Promise<void> {
  const target = currentTasks.find(t => t.id === id);
  currentTasks = currentTasks.filter(t => t.id !== id);
  notifyTasks();

  if (target) {
    addLog({
      officeId: target.officeId,
      iconType: "alert",
      title: `Task Deleted: ${target.title}`,
      time: "Just now"
    });
  }

  try {
    if (db) {
      await deleteDoc(doc(db, "chambers_tasks", id));
    }
  } catch (err) {
    console.warn("Deleted task locally:", err);
  }
}

// MATTERS
export function subscribeMatters(cb: Callback<ChambersMatter>): () => void {
  matterListeners.add(cb);
  cb([...currentMatters]);
  return () => matterListeners.delete(cb);
}

export async function addMatter(matter: Omit<ChambersMatter, "id" | "createdAt">): Promise<ChambersMatter> {
  const newMatter: ChambersMatter = {
    ...matter,
    id: `matter_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    createdAt: new Date().toISOString()
  };

  currentMatters = [newMatter, ...currentMatters];
  notifyMatters();

  addLog({
    officeId: newMatter.officeId,
    iconType: "file",
    title: `New Matter Opened: ${newMatter.title}`,
    details: `Client: ${newMatter.client} • Status: ${newMatter.status}`,
    actorName: newMatter.leadAttorney || "Chambers",
    time: "Just now"
  });

  try {
    if (db) {
      await setDoc(doc(db, "chambers_matters", newMatter.id), newMatter);
    }
  } catch (err) {
    console.warn("Saved matter locally:", err);
  }

  return newMatter;
}

export async function updateMatterStatus(id: string, newStatus: ChambersMatter["status"]): Promise<void> {
  let updatedMatter: ChambersMatter | null = null;
  currentMatters = currentMatters.map(m => {
    if (m.id === id) {
      updatedMatter = { ...m, status: newStatus };
      return updatedMatter;
    }
    return m;
  });

  notifyMatters();

  if (updatedMatter) {
    addLog({
      officeId: (updatedMatter as ChambersMatter).officeId,
      iconType: "file",
      title: `Matter Updated: ${(updatedMatter as ChambersMatter).title}`,
      details: `Status updated to ${newStatus}`,
      time: "Just now"
    });

    try {
      if (db) {
        await setDoc(doc(db, "chambers_matters", id), updatedMatter);
      }
    } catch (err) {
      console.warn("Updated matter locally:", err);
    }
  }
}

export async function deleteMatter(id: string): Promise<void> {
  const target = currentMatters.find(m => m.id === id);
  currentMatters = currentMatters.filter(m => m.id !== id);
  notifyMatters();

  if (target) {
    addLog({
      officeId: target.officeId,
      iconType: "alert",
      title: `Matter Archived/Removed: ${target.title}`,
      time: "Just now"
    });
  }

  try {
    if (db) {
      await deleteDoc(doc(db, "chambers_matters", id));
    }
  } catch (err) {
    console.warn("Deleted matter locally:", err);
  }
}

// LOGS
export function subscribeLogs(cb: Callback<ActivityLog>): () => void {
  logListeners.add(cb);
  cb([...currentLogs]);
  return () => logListeners.delete(cb);
}

export async function addLog(log: Omit<ActivityLog, "id" | "timestamp">): Promise<ActivityLog> {
  const newLog: ActivityLog = {
    ...log,
    id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    timestamp: Date.now()
  };

  currentLogs = [newLog, ...currentLogs];
  notifyLogs();

  try {
    if (db) {
      await setDoc(doc(db, "chambers_logs", newLog.id), newLog);
    }
  } catch (err) {
    console.warn("Logged locally:", err);
  }

  return newLog;
}

export async function clearLogs(): Promise<void> {
  currentLogs = [];
  notifyLogs();
}

// DOCUMENTS
export function subscribeDocs(cb: Callback<ChambersDocument>): () => void {
  docListeners.add(cb);
  cb([...currentDocs]);
  return () => docListeners.delete(cb);
}

export async function addDocument(docData: Omit<ChambersDocument, "id" | "uploadedAt">): Promise<ChambersDocument> {
  const newDoc: ChambersDocument = {
    ...docData,
    id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    uploadedAt: new Date().toISOString().split("T")[0]
  };

  currentDocs = [newDoc, ...currentDocs];
  notifyDocs();

  addLog({
    officeId: newDoc.officeId,
    iconType: "file",
    title: `Document Filed: ${newDoc.title}`,
    details: `Type: ${newDoc.type} • Filed by ${newDoc.uploadedBy}`,
    actorName: newDoc.uploadedBy,
    time: "Just now"
  });

  try {
    if (db) {
      await setDoc(doc(db, "chambers_docs", newDoc.id), newDoc);
    }
  } catch (err) {
    console.warn("Document saved locally:", err);
  }

  return newDoc;
}

export async function deleteDocument(id: string): Promise<void> {
  currentDocs = currentDocs.filter(d => d.id !== id);
  notifyDocs();

  try {
    if (db) {
      await deleteDoc(doc(db, "chambers_docs", id));
    }
  } catch (err) {
    console.warn("Deleted doc locally:", err);
  }
}

// RESEARCH ITEMS
export function subscribeResearch(cb: Callback<ChambersResearchItem>): () => void {
  researchListeners.add(cb);
  cb([...currentResearch]);
  return () => researchListeners.delete(cb);
}

export async function addResearchItem(item: Omit<ChambersResearchItem, "id" | "createdAt">): Promise<ChambersResearchItem> {
  const newItem: ChambersResearchItem = {
    ...item,
    id: `res_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    createdAt: new Date().toISOString().split("T")[0]
  };

  currentResearch = [newItem, ...currentResearch];
  notifyResearch();

  addLog({
    officeId: newItem.officeId,
    iconType: "file",
    title: `Legal Research Saved: ${newItem.query.slice(0, 45)}...`,
    details: `Linked to: ${newItem.matterTitle || 'Chambers Repository'}`,
    actorName: newItem.createdByName,
    time: "Just now"
  });

  try {
    if (db) {
      await setDoc(doc(db, "chambers_research", newItem.id), newItem);
    }
  } catch (err) {
    console.warn("Saved research item locally:", err);
  }

  return newItem;
}

export async function deleteResearchItem(id: string): Promise<void> {
  currentResearch = currentResearch.filter(r => r.id !== id);
  notifyResearch();

  try {
    if (db) {
      await deleteDoc(doc(db, "chambers_research", id));
    }
  } catch (err) {
    console.warn("Deleted research item locally:", err);
  }
}

// SUBMISSIONS
export function subscribeSubmissions(cb: Callback<ChambersSubmission>): () => void {
  submissionListeners.add(cb);
  cb([...currentSubmissions]);
  return () => submissionListeners.delete(cb);
}

export async function addSubmission(sub: Omit<ChambersSubmission, "id" | "createdAt">): Promise<ChambersSubmission> {
  const newSub: ChambersSubmission = {
    ...sub,
    id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    createdAt: new Date().toISOString().split("T")[0]
  };

  currentSubmissions = [newSub, ...currentSubmissions];
  notifySubmissions();

  addLog({
    officeId: newSub.officeId,
    iconType: "file",
    title: `Court Submission Drafted: ${newSub.title}`,
    details: `${newSub.submissionType} for ${newSub.matterTitle} (${newSub.courtForum})`,
    actorName: newSub.createdByName,
    time: "Just now"
  });

  try {
    if (db) {
      await setDoc(doc(db, "chambers_submissions", newSub.id), newSub);
    }
  } catch (err) {
    console.warn("Saved submission locally:", err);
  }

  return newSub;
}

export async function updateSubmissionStatus(id: string, status: "Draft" | "Final" | "Filed"): Promise<void> {
  let targetOfficeId = "all";
  let targetTitle = "";

  currentSubmissions = currentSubmissions.map(s => {
    if (s.id === id) {
      targetOfficeId = s.officeId;
      targetTitle = s.title;
      return { ...s, status };
    }
    return s;
  });

  notifySubmissions();

  if (targetTitle) {
    addLog({
      officeId: targetOfficeId,
      iconType: "check",
      title: `Submission Status Updated: ${targetTitle}`,
      details: `New Status: ${status}`,
      time: "Just now"
    });
  }

  const updated = currentSubmissions.find(s => s.id === id);
  if (updated && db) {
    try {
      await setDoc(doc(db, "chambers_submissions", id), updated);
    } catch (err) {
      console.warn("Updated submission status locally:", err);
    }
  }
}

export async function deleteSubmission(id: string): Promise<void> {
  currentSubmissions = currentSubmissions.filter(s => s.id !== id);
  notifySubmissions();

  try {
    if (db) {
      await deleteDoc(doc(db, "chambers_submissions", id));
    }
  } catch (err) {
    console.warn("Deleted submission locally:", err);
  }
}

// DIRECT MESSAGES
export function subscribeMessages(cb: Callback<DirectMessage>): () => void {
  messageListeners.add(cb);
  cb([...currentMessages]);
  return () => messageListeners.delete(cb);
}

export async function addDirectMessage(msg: Omit<DirectMessage, "id" | "timestamp" | "timeFormatted">): Promise<DirectMessage> {
  const newMsg: DirectMessage = {
    ...msg,
    id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    timestamp: new Date().toISOString(),
    timeFormatted: "Just now"
  };

  currentMessages = [newMsg, ...currentMessages];
  notifyMessages();

  try {
    if (db) {
      await setDoc(doc(db, "chambers_messages", newMsg.id), newMsg);
    }
  } catch (err) {
    console.warn("Saved direct message locally:", err);
  }

  return newMsg;
}

export async function deleteDirectMessage(id: string): Promise<void> {
  currentMessages = currentMessages.filter(m => m.id !== id);
  notifyMessages();

  try {
    if (db) {
      await deleteDoc(doc(db, "chambers_messages", id));
    }
  } catch (err) {
    console.warn("Deleted message locally:", err);
  }
}

// INVOICES & RECEIPTS
export function subscribeInvoices(cb: Callback<ChambersInvoice>): () => void {
  invoiceListeners.add(cb);
  cb([...currentInvoices]);
  return () => invoiceListeners.delete(cb);
}

export async function addInvoice(inv: Omit<ChambersInvoice, "id">): Promise<ChambersInvoice> {
  const newInv: ChambersInvoice = {
    ...inv,
    id: `inv_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`
  };

  currentInvoices = [newInv, ...currentInvoices];
  notifyInvoices();

  addLog({
    officeId: inv.officeId,
    iconType: "file",
    title: `Invoice Generated: ${newInv.invoiceNumber}`,
    details: `${newInv.clientName} — KES ${newInv.totalAmount.toLocaleString()} (${newInv.matterTitle})`,
    actorName: "Finance Office",
    time: "Just now"
  });

  try {
    if (db) {
      await setDoc(doc(db, "chambers_invoices", newInv.id), newInv);
    }
  } catch (err) {
    console.warn("Saved invoice locally:", err);
  }

  return newInv;
}

export async function updateInvoiceStatus(id: string, status: "Draft" | "Issued" | "Paid" | "Overdue"): Promise<void> {
  currentInvoices = currentInvoices.map(inv => {
    if (inv.id === id) {
      return { 
        ...inv, 
        status, 
        paidAt: status === "Paid" ? new Date().toISOString().split("T")[0] : inv.paidAt 
      };
    }
    return inv;
  });

  notifyInvoices();

  const target = currentInvoices.find(i => i.id === id);
  if (target && db) {
    try {
      await setDoc(doc(db, "chambers_invoices", id), target);
    } catch (err) {
      console.warn("Updated invoice status locally:", err);
    }
  }
}

export async function deleteInvoice(id: string): Promise<void> {
  currentInvoices = currentInvoices.filter(i => i.id !== id);
  notifyInvoices();

  try {
    if (db) {
      await deleteDoc(doc(db, "chambers_invoices", id));
    }
  } catch (err) {
    console.warn("Deleted invoice locally:", err);
  }
}

// STK PUSH TRANSACTIONS
export function subscribeStkTransactions(cb: Callback<StkPushTransaction>): () => void {
  stkListeners.add(cb);
  cb([...currentTransactions]);
  return () => stkListeners.delete(cb);
}

export async function addStkTransaction(tx: Omit<StkPushTransaction, "id">): Promise<StkPushTransaction> {
  const newTx: StkPushTransaction = {
    ...tx,
    id: `stk_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`
  };

  currentTransactions = [newTx, ...currentTransactions];
  notifyStk();

  addLog({
    officeId: "all",
    iconType: "check",
    title: `STK Push Payment Received: ${newTx.clientName}`,
    details: `KES ${newTx.amount.toLocaleString()} — Ref: ${newTx.mpesaReceiptNumber || newTx.referenceDoc}`,
    actorName: "M-Pesa STK Gateway",
    time: "Just now"
  });

  try {
    if (db) {
      await setDoc(doc(db, "chambers_stk", newTx.id), newTx);
    }
  } catch (err) {
    console.warn("Saved STK tx locally:", err);
  }

  return newTx;
}
