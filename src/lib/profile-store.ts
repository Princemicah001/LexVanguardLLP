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
    title: "Founding & Managing Partner",
    practice: "Corporate & Tech Law, Mergers & Acquisitions",
    bio: "Click to add your professional biography. Share your background, expertise, and what drives your commitment to the law.",
    phone: "+254 116 171 396",
    email: "prince@lexvanguard.edu",
    education: "LLB, Mount Kenya University",
    achievements: "Founding Partner, National Moot Court Finalist",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSs8dhSiHOEzW9_vEHj6VVV4GvlooCTlYB-4lyypRqsQw&s=10"
  },
  "Kelvin Musya": {
    name: "Kelvin Musya",
    title: "Founding & Senior Partner",
    practice: "Appellate Advocacy, Supreme Court Litigation",
    bio: "Click to add your professional biography. Share your background, expertise, and what drives your commitment to the law.",
    phone: "+254 708 948 809",
    email: "kelvin@lexvanguard.edu",
    education: "LLB, Mount Kenya University",
    achievements: "Founding Partner, Senior Appellate Counsel",
    image: makeAvatarSvg("Kelvin Musya", "male")
  },
  "Donel Aganyo": {
    name: "Donel Aganyo",
    title: "Founding Partner",
    practice: "Intellectual Property, Patent Litigation",
    bio: "Click to add professional biography.",
    phone: "+254 707 865 597",
    email: "donel@lexvanguard.edu",
    education: "LLB, Mount Kenya University",
    achievements: "Founding Partner, Lead IP Advocate",
    image: makeAvatarSvg("Donel Aganyo", "male")
  },
  "Linet Njeri": {
    name: "Linet Njeri",
    title: "Finance Manager",
    practice: "Commercial Litigation, Dispute Resolution",
    bio: "Click to add professional biography.",
    phone: "+254 116 171 396",
    email: "linet@lexvanguard.edu",
    education: "LLB, Mounk Kenya University",
    achievements: "Finance & Commercial Strategy Lead",
    image: makeAvatarSvg("Linet Njeri", "female")
  },
  "Sharon Mwariri": {
    name: "Sharon Mwariri",
    title: "Lead Legal Researcher",
    practice: "Policy Analysis, Legislative Drafting",
    bio: "Click to add professional biography.",
    phone: "+254 116 171 396",
    email: "sharon@lexvanguard.edu",
    education: "LLB, Mounk Kenya University",
    achievements: "Published Legal Scholar",
    image: makeAvatarSvg("Sharon Mwariri", "female")
  },
  "Kimathi Winner": {
    name: "Kimathi Winner",
    title: "Associate",
    practice: "Pro Bono Initiative, Civil Rights",
    bio: "Click to add professional biography.",
    phone: "+254 116 171 396",
    email: "kimathi@lexvanguard.edu",
    education: "LLB, Mounk Kenya University",
    achievements: "Pro Bono Advocate of the Year",
    image: makeAvatarSvg("Kimathi Winner", "male")
  }
};

const STORAGE_KEY = "lexvanguard_attorney_profiles";

export function loadProfile(name: string, fallbackData?: Partial<AttorneyProfile>): AttorneyProfile {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const all = JSON.parse(stored) as Record<string, AttorneyProfile>;
      if (all[name]) {
        const loaded = { ...DEFAULT_PROFILES[name], ...fallbackData, ...all[name] };
        // If image was a stock unsplash placeholder or default svg, and default profile or fallback has a real photo URL, use it
        if (loaded.image && (loaded.image.includes("unsplash.com") || loaded.image.includes("placehold.co") || loaded.image.startsWith("data:image/svg+xml"))) {
          if (DEFAULT_PROFILES[name]?.image && !DEFAULT_PROFILES[name].image.startsWith("data:image/svg+xml")) {
            loaded.image = DEFAULT_PROFILES[name].image;
          } else if (fallbackData?.image && !fallbackData.image.startsWith("data:image/svg+xml")) {
            loaded.image = fallbackData.image;
          } else {
            loaded.image = makeAvatarSvg(name);
          }
        }
        return loaded;
      }
    }
  } catch {}
  
  const base = DEFAULT_PROFILES[name] || {};
  return {
    name,
    title: fallbackData?.title || base.title || "Counsel",
    practice: fallbackData?.practice || base.practice || "Legal Counsel & Advisory",
    bio: fallbackData?.bio || base.bio || "Click to add professional biography.",
    phone: fallbackData?.phone || base.phone || "+254 116 171 396",
    email: fallbackData?.email || base.email || `${name.toLowerCase().replace(/\s+/g, '.')}@lexvanguard.edu`,
    education: fallbackData?.education || base.education || "LLB, Mount Kenya University",
    achievements: fallbackData?.achievements || base.achievements || "Legal Advocate",
    image: fallbackData?.image || base.image || makeAvatarSvg(name)
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
