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
  gallery?: string[];
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
    id: "evt-vintage-bazaar",
    title: "Summer Vintage & Legal Artisans Assembly",
    category: "Symposium",
    date: "2026-08-23",
    displayDate: "Sun, Aug 23, 10:00 AM",
    time: "10:00 AM - 04:00 PM EAT",
    location: "Lex Vanguard Plaza • Nairobi, Kenya",
    isVirtual: false,
    featured: true,
    image: "https://images.unsplash.com/photo-1531058240690-006c446962d8?auto=format&fit=crop&w=1200&q=80",
    description: "An exclusive legal, artistic, and cultural gathering celebrating heritage law, intellectual property rights for creators, and networking.",
    fullDetails: "Join us for our signature summer bazaar and legal advisory symposium. Bringing together advocates, creators, and entrepreneurs for curated legal discussions and community networking.",
    cpdCredits: "2.0 CPD Units",
    capacity: 300,
    registeredCount: 184,
    status: "Upcoming",
    speakers: [
      { name: "Prince Micah", role: "Founding Partner & Co-Owner", uid: "n6NKoyAIuVSXYEaIbRVN9drINNy1" },
      { name: "Donel Aganyo", role: "Founding Partner & Co-Owner", uid: "donel_aganyo_uid" }
    ],
    agenda: [
      { time: "10:00 AM", topic: "Opening Address: IP Rights in Creative Industries", presenter: "Donel Aganyo" },
      { time: "01:30 PM", topic: "Pro Bono Advisory Sessions for Artisans", presenter: "Prince Micah" }
    ]
  },
  {
    id: "evt-brunch-shop",
    title: "Summer Legal Brunch & Tech Ventures Forum",
    category: "Keynote & Summit",
    date: "2026-08-30",
    displayDate: "Sun, Aug 30, 10:00 AM",
    time: "10:00 AM - 03:00 PM EAT",
    location: "Grand Ballroom • Nairobi, Kenya",
    isVirtual: false,
    featured: false,
    image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80",
    description: "Executive brunch convening tech founders, angel investors, and venture counsel to discuss fundraising, venture agreements, and corporate governance.",
    fullDetails: "A premier networking brunch and roundtable discussing venture capital term sheets, startup law, and cross-border corporate structure.",
    cpdCredits: "3.0 CPD Units",
    capacity: 250,
    registeredCount: 210,
    status: "Upcoming",
    speakers: [
      { name: "Kelvin Musya", role: "Founding Partner & Co-Owner", uid: "SSbNEJrVyhM6b8LbWYsyunPGk6l2" },
      { name: "Linet Njeri", role: "Finance Manager", uid: "linet_njeri_uid" }
    ],
    agenda: [
      { time: "10:00 AM", topic: "Navigating VC Term Sheets & Shareholder Rights", presenter: "Kelvin Musya" },
      { time: "12:00 PM", topic: "Financial Advisory for Growth Companies", presenter: "Linet Njeri" }
    ]
  },
  {
    id: "evt-summer-bazaar",
    title: "Lex Vanguard Appellate Litigation Colloquium",
    category: "CLE & Workshop",
    date: "2026-09-06",
    displayDate: "Sun, Sep 06, 10:00 AM",
    time: "10:00 AM - 05:00 PM EAT",
    location: "Lex Vanguard Chambers • Nairobi, Kenya",
    isVirtual: true,
    featured: false,
    image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80",
    description: "High-level judicial review and appellate strategy seminar for litigation counsel, judges, and legal researchers.",
    fullDetails: "In-depth masterclass examining constitutional jurisprudence, Supreme Court precedents, and persuasive oral advocacy.",
    cpdCredits: "4.0 CPD Units",
    capacity: 400,
    registeredCount: 312,
    status: "Upcoming",
    speakers: [
      { name: "Kelvin Musya", role: "Founding Partner & Co-Owner", uid: "SSbNEJrVyhM6b8LbWYsyunPGk6l2" }
    ],
    agenda: [
      { time: "10:00 AM", topic: "Anatomy of Supreme Court Petitions", presenter: "Kelvin Musya" }
    ]
  },
  {
    id: "evt-market-day",
    title: "Lex Vanguard Annual Pro Bono & Community Outreach Day",
    category: "Community & Pro Bono",
    date: "2026-09-13",
    displayDate: "Sun, Sep 13, 10:00 AM",
    time: "10:00 AM - 04:00 PM EAT",
    location: "City Community Grounds • Nairobi, Kenya",
    isVirtual: false,
    featured: false,
    image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1200&q=80",
    description: "Complimentary community legal clinic providing guidance on land law, family trusts, employment disputes, and civil rights.",
    fullDetails: "Our flagship pro bono outreach connecting experienced advocates directly with members of the community needing accessible legal help.",
    cpdCredits: "Community Service",
    capacity: 500,
    registeredCount: 420,
    status: "Upcoming",
    speakers: [
      { name: "Prince Micah", role: "Founding Partner & Co-Owner", uid: "n6NKoyAIuVSXYEaIbRVN9drINNy1" },
      { name: "Kimathi Winner", role: "Associate", uid: "kimathi_winner_uid" }
    ],
    agenda: [
      { time: "10:00 AM", topic: "Community Legal Literacy Seminar", presenter: "Prince Micah" }
    ]
  },
  {
    id: "evt-summit-2026",
    title: "East Africa Constitutional & Digital Sovereignty Summit",
    category: "Keynote & Summit",
    date: "2026-09-20",
    displayDate: "Sun, Sep 20, 09:00 AM",
    time: "09:00 AM - 05:00 PM EAT",
    location: "Auditorium & Virtual Stream",
    isVirtual: false,
    featured: false,
    image: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80",
    description: "A landmark legal assembly reuniting senior advocates, jurists, and policy experts to examine constitutional frameworks.",
    fullDetails: "The East Africa Constitutional & Digital Sovereignty Summit convenes legal scholars, judges, and policy advisors.",
    cpdCredits: "4.0 CPD Units",
    capacity: 350,
    registeredCount: 280,
    status: "Upcoming",
    speakers: [
      { name: "Prince Micah", role: "Founding Partner & Co-Owner", uid: "n6NKoyAIuVSXYEaIbRVN9drINNy1" },
      { name: "Kelvin Musya", role: "Founding Partner & Co-Owner", uid: "SSbNEJrVyhM6b8LbWYsyunPGk6l2" },
      { name: "Donel Aganyo", role: "Founding Partner & Co-Owner", uid: "donel_aganyo_uid" }
    ],
    agenda: [
      { time: "09:00 AM", topic: "Digital Sovereignty Keynote", presenter: "Prince Micah" }
    ]
  },
  {
    id: "evt-past-gala-2026",
    title: "Inaugural Lex Vanguard Moot Court & Legal Gala",
    category: "Symposium",
    date: "2026-05-18",
    displayDate: "Mon, May 18, 10:00 AM",
    time: "Full Day Assembly & Evening Gala",
    location: "Mount Kenya University Grand Auditorium",
    isVirtual: false,
    featured: false,
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
    description: "The historic launching symposium and competitive advocacy tournament celebrating legal excellence.",
    fullDetails: "Inaugural Moot Court competition bringing together law schools across East Africa.",
    cpdCredits: "Completed",
    capacity: 400,
    registeredCount: 400,
    status: "Past Event",
    gallery: [
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1200&q=80"
    ],
    recapUrl: "#",
    speakers: [
      { name: "Prince Micah", role: "Founding Partner & Co-Owner", uid: "n6NKoyAIuVSXYEaIbRVN9drINNy1" },
      { name: "Kelvin Musya", role: "Founding Partner & Co-Owner", uid: "SSbNEJrVyhM6b8LbWYsyunPGk6l2" }
    ],
    agenda: [
      { time: "10:00 AM", topic: "Moot Court Finals", presenter: "Advocacy Teams" }
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
