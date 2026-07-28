import { collection, doc, setDoc, addDoc, onSnapshot, updateDoc, increment, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

export interface EventSpeaker {
  name: string;
  role: string;
  image?: string;
  uid?: string;
}

export interface AgendaItem {
  time: string;
  topic: string;
  presenter: string;
}

export interface FirmEvent {
  id: string;
  title: string;
  category: "Keynote & Summit" | "CLE & Workshop" | "Symposium" | "Community & Pro Bono" | "Special Lecture";
  date: string; // YYYY-MM-DD
  displayDate: string;
  time: string;
  location: string;
  isVirtual: boolean;
  featured: boolean;
  image: string;
  description: string;
  fullDetails: string;
  cpdCredits: string;
  speakers: EventSpeaker[];
  capacity: number;
  registeredCount: number;
  agenda: AgendaItem[];
  status: "Upcoming" | "Live Now" | "Past Event";
  recapUrl?: string;
  createdAt?: string;
  createdBy?: string;
}

export interface EventRSVP {
  id?: string;
  eventId: string;
  name: string;
  email: string;
  organization?: string;
  phone?: string;
  notes?: string;
  timestamp: string;
}

export const INITIAL_EVENTS: FirmEvent[] = [
  {
    id: "evt-summit-2026",
    title: "East Africa Constitutional & Digital Sovereignty Summit 2026",
    category: "Keynote & Summit",
    date: "2026-08-20",
    displayDate: "AUGUST 20, 2026",
    time: "09:00 AM - 05:00 PM EAT",
    location: "Lex Vanguard Chambers Auditorium & Virtual Stream",
    isVirtual: false,
    featured: true,
    image: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80",
    description: "A flagship legal assembly reuniting senior advocates, jurists, and policy experts to examine constitutional frameworks, sovereign data privacy laws, and emerging AI jurisprudence.",
    fullDetails: "The 2026 East Africa Constitutional & Digital Sovereignty Summit stands as Lex Vanguard's premier annual legal gathering. Convening leading constitutional scholars, appellate advocates, tech founders, and judicial figures, this full-day summit explores the intersection of state authority, digital privacy rights, cross-border data sovereignty, and AI regulation across East Africa. Attendees will participate in interactive panel debates, policy briefing roundtables, and keynote addresses.",
    cpdCredits: "4.0 LSK CPD Units",
    capacity: 350,
    registeredCount: 218,
    status: "Upcoming",
    speakers: [
      { name: "Prince Micah", role: "Founding & Managing Partner", uid: "n6NKoyAIuVSXYEaIbRVN9drINNy1" },
      { name: "Kelvin Musya", role: "Founding & Senior Partner", uid: "SSbNEJrVyhM6b8LbWYsyunPGk6l2" },
      { name: "Donel Aganyo", role: "Founding Partner • IP Practice Lead", uid: "donel_aganyo_uid" }
    ],
    agenda: [
      { time: "09:00 AM", topic: "Opening Keynote: Digital Sovereignty & Constitutional Supremacy", presenter: "Prince Micah" },
      { time: "11:00 AM", topic: "Panel: AI Jurisprudence & Appellate Precedents in East Africa", presenter: "Kelvin Musya & Guests" },
      { time: "02:00 PM", topic: "Workshop: Data Privacy Enforcement & Corporate Compliance", presenter: "Donel Aganyo" },
      { time: "04:15 PM", topic: "Valedictory Declaration & Networking Reception", presenter: "Lex Vanguard Directorate" }
    ]
  },
  {
    id: "evt-cle-appellate-2026",
    title: "Mastering Cross-Examination & Appellate Briefing Masterclass",
    category: "CLE & Workshop",
    date: "2026-09-05",
    displayDate: "SEPTEMBER 05, 2026",
    time: "02:00 PM - 05:30 PM EAT",
    location: "Supreme Court Moot Hall & Online Broadcast",
    isVirtual: true,
    featured: false,
    image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80",
    description: "An intensive advocacy training session focused on constructing airtight appellate briefs, mastering expert witness cross-examination, and managing high-stakes court appearances.",
    fullDetails: "Designed for practicing counsel, senior law scholars, and pupil advocates, this CLE masterclass delivers hands-on litigation methodology. Participants will analyze real-world appellate record books, dissect persuasive oral advocacy strategies, and undergo simulated bench questioning under the guidance of senior advocates.",
    cpdCredits: "3.0 LSK CPD Units",
    capacity: 180,
    registeredCount: 142,
    status: "Upcoming",
    speakers: [
      { name: "Kelvin Musya", role: "Founding & Senior Partner", uid: "SSbNEJrVyhM6b8LbWYsyunPGk6l2" },
      { name: "Linet Njeri", role: "Finance Manager & Dispute Counsel", uid: "linet_njeri_uid" }
    ],
    agenda: [
      { time: "02:00 PM", topic: "Anatomy of an Unassailable Appellate Brief", presenter: "Kelvin Musya" },
      { time: "03:30 PM", topic: "Tactical Cross-Examination in Complex Commercial Matters", presenter: "Linet Njeri" },
      { time: "04:45 PM", topic: "Live Moot Critique & Q&A Session", presenter: "Panellists" }
    ]
  },
  {
    id: "evt-ip-symposium-2026",
    title: "Intellectual Property & Frontier Technology Litigation Symposium",
    category: "Symposium",
    date: "2026-09-22",
    displayDate: "SEPTEMBER 22, 2026",
    time: "10:00 AM - 04:00 PM EAT",
    location: "Lex Vanguard Innovation Hub & Virtual Lounge",
    isVirtual: false,
    featured: false,
    image: "https://images.unsplash.com/photo-1453728013993-6d66e9c9123a?auto=format&fit=crop&w=1200&q=80",
    description: "In-depth analysis of patent protection, software trade secrets, open-source compliance, and regional trademark enforcement in fast-scaling tech ecosystems.",
    fullDetails: "As technology ventures scale rapidly across Africa, protecting intellectual property requires forward-thinking legal architecture. This symposium addresses patent prosecution, trade secret preservation, digital copyright in creative industries, and licensing negotiations.",
    cpdCredits: "3.5 LSK CPD Units",
    capacity: 220,
    registeredCount: 165,
    status: "Upcoming",
    speakers: [
      { name: "Donel Aganyo", role: "Founding Partner • IP Practice Lead", uid: "donel_aganyo_uid" },
      { name: "Sharon Mwariri", role: "Lead Legal Researcher", uid: "sharon_mwariri_uid" }
    ],
    agenda: [
      { time: "10:00 AM", topic: "Patent Strategies for Software & Biotech Enterprises", presenter: "Donel Aganyo" },
      { time: "11:45 AM", topic: "Legislative Research: Regional Copyright & Trademarks", presenter: "Sharon Mwariri" },
      { time: "02:15 PM", topic: "Interactive IP Audit Clinic", presenter: "Lex Vanguard IP Division" }
    ]
  },
  {
    id: "evt-probono-2026",
    title: "Access to Justice & Community Legal Aid Outreach",
    category: "Community & Pro Bono",
    date: "2026-10-10",
    displayDate: "OCTOBER 10, 2026",
    time: "08:30 AM - 04:30 PM EAT",
    location: "Central Community Hall & Mobile Advisory Clinic",
    isVirtual: false,
    featured: false,
    image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1200&q=80",
    description: "A firm-wide pro bono initiative offering complimentary legal advisory, civil rights assistance, contract reviews, and land dispute consultations for underserved individuals.",
    fullDetails: "Rooted in Lex Vanguard's ethos that justice must be accessible to all, our annual Pro Bono Outreach connects senior advocates and student clinicians directly with community members needing legal assistance. Services include pro bono petition drafting, dispute mediation, and legal literacy workshops.",
    cpdCredits: "Community Outreach Certificate",
    capacity: 500,
    registeredCount: 389,
    status: "Upcoming",
    speakers: [
      { name: "Kimathi Winner", role: "Associate & Pro Bono Lead", uid: "kimathi_winner_uid" },
      { name: "Prince Micah", role: "Founding & Managing Partner", uid: "n6NKoyAIuVSXYEaIbRVN9drINNy1" }
    ],
    agenda: [
      { time: "08:30 AM", topic: "Opening Briefing & Volunteer Allocation", presenter: "Kimathi Winner" },
      { time: "09:30 AM", topic: "One-on-One Legal Consultations & Document Drafting", presenter: "Pro Bono Advisory Panel" },
      { time: "02:00 PM", topic: "Know Your Rights: Community Legal Literacy Seminar", presenter: "Prince Micah" }
    ]
  },
  {
    id: "evt-past-gala-2026",
    title: "Inaugural Lex Vanguard Moot Court & Legal Excellence Gala",
    category: "Symposium",
    date: "2026-05-18",
    displayDate: "MAY 18, 2026",
    time: "Full Day Assembly & Evening Gala",
    location: "Mount Kenya University Grand Auditorium",
    isVirtual: false,
    featured: false,
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
    description: "The historic launching symposium and competitive advocacy tournament celebrating legal excellence, student scholarship, and judicial leadership.",
    fullDetails: "The Inaugural Lex Vanguard Moot Court brought together over 40 law teams across East Africa. Keynote addresses were delivered by senior judicial officers, culminating in the formal inauguration of Lex Vanguard's foundational chambers.",
    cpdCredits: "Event Completed",
    capacity: 400,
    registeredCount: 400,
    status: "Past Event",
    recapUrl: "#",
    speakers: [
      { name: "Prince Micah", role: "Founding & Managing Partner", uid: "n6NKoyAIuVSXYEaIbRVN9drINNy1" },
      { name: "Kelvin Musya", role: "Founding & Senior Partner", uid: "SSbNEJrVyhM6b8LbWYsyunPGk6l2" }
    ],
    agenda: [
      { time: "10:00 AM", topic: "Moot Court Championship Finals", presenter: "Finalist Advocacy Teams" },
      { time: "06:00 PM", topic: "Inaugural Firm Gala & Keynote Address", presenter: "Founding Partners" }
    ]
  }
];

const LOCAL_STORAGE_KEY = "lexvanguard_firm_events";
const LOCAL_RSVP_KEY = "lexvanguard_event_rsvps";

function getLocalEvents(): FirmEvent[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {}
  return INITIAL_EVENTS;
}

function saveLocalEvents(events: FirmEvent[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(events));
  } catch {}
}

export function subscribeEvents(callback: (events: FirmEvent[]) => void) {
  try {
    const colRef = collection(db, "events");
    return onSnapshot(colRef, (snapshot) => {
      const list: FirmEvent[] = [];
      const seen = new Set<string>();

      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as FirmEvent;
        const id = docSnap.id || data.id;
        if (id && !seen.has(id)) {
          seen.add(id);
          list.push({ ...data, id });
        }
      });

      // Merge with initial/local events if snapshot is empty or missing defaults
      const local = getLocalEvents();
      local.forEach((evt) => {
        if (!seen.has(evt.id)) {
          seen.add(evt.id);
          list.push(evt);
        }
      });

      // Sort by date ascending for upcoming, past at the end
      list.sort((a, b) => {
        if (a.status === "Past Event" && b.status !== "Past Event") return 1;
        if (a.status !== "Past Event" && b.status === "Past Event") return -1;
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      });

      saveLocalEvents(list);
      callback(list);
    }, (error) => {
      console.warn("Firestore events subscription unavailable, using local state fallback:", error?.message || error);
      callback(getLocalEvents());
    });
  } catch (e) {
    console.warn("Error subscribing to events, using local state fallback:", e);
    callback(getLocalEvents());
    return () => {};
  }
}

export async function rsvpToEvent(
  eventId: string,
  rsvpData: { name: string; email: string; organization?: string; phone?: string; notes?: string }
): Promise<boolean> {
  const timestamp = new Date().toISOString();
  const entry: EventRSVP = {
    eventId,
    name: rsvpData.name,
    email: rsvpData.email,
    organization: rsvpData.organization || "",
    phone: rsvpData.phone || "",
    notes: rsvpData.notes || "",
    timestamp
  };

  // 1. Save RSVP locally
  try {
    const stored = localStorage.getItem(LOCAL_RSVP_KEY);
    const list: EventRSVP[] = stored ? JSON.parse(stored) : [];
    list.push(entry);
    localStorage.setItem(LOCAL_RSVP_KEY, JSON.stringify(list));
  } catch {}

  // 2. Update local event count
  const currentEvents = getLocalEvents();
  const updatedEvents = currentEvents.map(evt => {
    if (evt.id === eventId) {
      return { ...evt, registeredCount: (evt.registeredCount || 0) + 1 };
    }
    return evt;
  });
  saveLocalEvents(updatedEvents);

  // 3. Try updating Firestore
  try {
    const rsvpCol = collection(db, "rsvps");
    await addDoc(rsvpCol, entry);

    const docRef = doc(db, "events", eventId);
    await updateDoc(docRef, {
      registeredCount: increment(1)
    });
  } catch (e) {
    console.log("Firestore sync for RSVP failed gracefully, saved locally.");
  }

  return true;
}

export async function createFirmEvent(newEvent: Omit<FirmEvent, "id" | "registeredCount">): Promise<FirmEvent> {
  const id = `evt-custom-${Date.now()}`;
  const fullEvt: FirmEvent = {
    ...newEvent,
    id,
    registeredCount: 0,
    status: newEvent.status || "Upcoming"
  };

  const current = getLocalEvents();
  const updated = [fullEvt, ...current];
  saveLocalEvents(updated);

  try {
    const docRef = doc(db, "events", id);
    await setDoc(docRef, fullEvt);
  } catch (e) {
    console.log("Firestore sync for new event failed gracefully, saved locally.");
  }

  return fullEvt;
}

export function isUserRegisteredForEvent(eventId: string, email: string): boolean {
  try {
    const stored = localStorage.getItem(LOCAL_RSVP_KEY);
    if (!stored) return false;
    const list: EventRSVP[] = JSON.parse(stored);
    return list.some(r => r.eventId === eventId && r.email.toLowerCase() === email.toLowerCase());
  } catch {
    return false;
  }
}

export function generateIcsCalendar(event: FirmEvent): string {
  const cleanDate = event.date.replace(/-/g, "");
  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Lex Vanguard Counsels at Law//Events Calendar//EN",
    "BEGIN:VEVENT",
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${event.description.replace(/\n/g, " ")}`,
    `LOCATION:${event.location}`,
    `DTSTART:${cleanDate}T090000Z`,
    `DTEND:${cleanDate}T170000Z`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR"
  ].join("\r\n");

  return `data:text/calendar;charset=utf8,${encodeURIComponent(icsContent)}`;
}
