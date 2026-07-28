import { makeAvatarSvg } from "./avatar";

export interface AttorneyProfile {
  name: string;
  title: string;
  practice: string;
  bio: string;
  phone: string;
  email: string;
  education: string;
  achievements: string;
  image: string;
}

const DEFAULT_PROFILES: Record<string, AttorneyProfile> = {
  "Prince Micah": {
    name: "Prince Micah",
    title: "Managing Partner",
    practice: "Corporate & Tech Law, Mergers & Acquisitions",
    bio: "Click to add your professional biography. Share your background, expertise, and what drives your commitment to the law.",
    phone: "Click to add phone",
    email: "prince@lexvanguard.edu",
    education: "Click to add education — e.g. LLB, Mounk Kenya University",
    achievements: "Click to add notable achievements and accolades",
    image: "assets/prince.png"
  },
  "Kelvin Musya": {
    name: "Kelvin Musya",
    title: "Senior Partner",
    practice: "Appellate Advocacy, Supreme Court Litigation",
    bio: "Click to add your professional biography. Share your background, expertise, and what drives your commitment to the law.",
    phone: "Click to add phone",
    email: "kelvin@lexvanguard.edu",
    education: "Click to add education — e.g. LLB, Mounk Kenya University",
    achievements: "Click to add notable achievements and accolades",
    image: "assets/kmusya.jpeg"
  },
  "Donel Aganyo": {
    name: "Donel Aganyo",
    title: "Partner",
    practice: "Intellectual Property, Patent Litigation",
    bio: "Click to add professional biography.",
    phone: "Click to add phone",
    email: "Click to add email",
    education: "Click to add education",
    achievements: "Click to add achievements",
    image: makeAvatarSvg("Donel Aganyo")
  },
  "Linet Njeri": {
    name: "Linet Njeri",
    title: "Finance Manager",
    practice: "Commercial Litigation, Dispute Resolution",
    bio: "Click to add professional biography.",
    phone: "Click to add phone",
    email: "Click to add email",
    education: "Click to add education",
    achievements: "Click to add achievements",
    image: makeAvatarSvg("Linet Njeri")
  },
  "Sharon Mwariri": {
    name: "Sharon Mwariri",
    title: "Lead Legal Researcher",
    practice: "Policy Analysis, Legislative Drafting",
    bio: "Click to add professional biography.",
    phone: "Click to add phone",
    email: "Click to add email",
    education: "Click to add education",
    achievements: "Click to add achievements",
    image: makeAvatarSvg("Sharon Mwariri")
  },
  "Kimathi Winner": {
    name: "Kimathi Winner",
    title: "Associate",
    practice: "Pro Bono Initiative, Civil Rights",
    bio: "Click to add professional biography.",
    phone: "Click to add phone",
    email: "Click to add email",
    education: "Click to add education",
    achievements: "Click to add achievements",
    image: makeAvatarSvg("Kimathi Winner")
  }
};

const STORAGE_KEY = "lexvanguard_attorney_profiles";

export function loadProfile(name: string): AttorneyProfile {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const all = JSON.parse(stored) as Record<string, AttorneyProfile>;
      if (all[name]) return { ...DEFAULT_PROFILES[name], ...all[name] };
    }
  } catch {}
  return DEFAULT_PROFILES[name] || {
    name,
    title: "",
    practice: "",
    bio: "Click to add biography",
    phone: "",
    email: "",
    education: "",
    achievements: "",
    image: makeAvatarSvg(name)
  };
}

export function saveProfile(profile: AttorneyProfile): void {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const all = stored ? (JSON.parse(stored) as Record<string, AttorneyProfile>) : {};
    all[profile.name] = profile;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {}
}

export function getAllProfiles(): Record<string, AttorneyProfile> {
  const defaults = { ...DEFAULT_PROFILES };
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const all = JSON.parse(stored) as Record<string, AttorneyProfile>;
      for (const name of Object.keys(all)) {
        defaults[name] = { ...defaults[name], ...all[name] };
      }
    }
  } catch {}
  return defaults;
}
