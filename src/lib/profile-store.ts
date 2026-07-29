import { makeAvatarSvg } from "./avatar";
import { doc, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import { getCanonicalKey } from "./users";
import { compressImage } from "./imgbb";

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
  profilePhoto?: string;
}

const DEFAULT_PROFILES: Record<string, AttorneyProfile> = {
  "Prince Micah": {
    name: "Prince Micah",
    title: "Founding Partner & Co-Owner | Managing Partner",
    practice: "Corporate & Tech Law, Mergers & Acquisitions",
    bio: "Co-Owner & Founding Partner leading LexVanguard's strategic corporate, technological, and firm operations.",
    phone: "+254 116 171 396",
    email: "prince@lexvanguard.edu",
    education: "LLB, Mount Kenya University",
    achievements: "Founding Partner & Co-Owner, Head of Firm",
    image: "https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&w=800&q=80"
  },
  "Kelvin Musya": {
    name: "Kelvin Musya",
    title: "Founding Partner & Co-Owner | Senior Partner",
    practice: "Appellate Advocacy, Supreme Court Litigation",
    bio: "Co-Owner & Founding Partner directing Supreme Court litigation, constitutional law, and senior appellate strategy.",
    phone: "+254 708 948 809",
    email: "kelvin@lexvanguard.edu",
    education: "LLB, Mount Kenya University",
    achievements: "Founding Partner & Co-Owner, Head of Firm",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80"
  },
  "Donel Aganyo": {
    name: "Donel Aganyo",
    title: "Founding Partner & Co-Owner | Head of IP Practice",
    practice: "Intellectual Property, Patent Litigation",
    bio: "Co-Owner & Founding Partner heading Intellectual Property protection, patent litigation, and technology disputes.",
    phone: "+254 707 865 597",
    email: "donel@lexvanguard.edu",
    education: "LLB, Mount Kenya University",
    achievements: "Founding Partner & Co-Owner, Head of Firm",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80"
  },
  "Linet Njeri": {
    name: "Linet Njeri",
    title: "Finance Manager",
    practice: "Commercial Litigation, Dispute Resolution",
    bio: "Finance & Commercial Strategy Lead overseeing firm fiscal planning and commercial client representation.",
    phone: "+254 116 171 396",
    email: "linet@lexvanguard.edu",
    education: "LLB, Mount Kenya University",
    achievements: "Finance & Commercial Strategy Lead",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80"
  },
  "Sharon Mwariri": {
    name: "Sharon Mwariri",
    title: "Lead Legal Researcher",
    practice: "Policy Analysis, Legislative Drafting",
    bio: "Published Legal Scholar heading research, policy advisory, and legislative analysis at LexVanguard.",
    phone: "+254 116 171 396",
    email: "sharon@lexvanguard.edu",
    education: "LLB, Mount Kenya University",
    achievements: "Published Legal Scholar",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=800&q=80"
  },
  "Kimathi Winner": {
    name: "Kimathi Winner",
    title: "Associate",
    practice: "Pro Bono Initiative, Civil Rights",
    bio: "Pro Bono Advocate driving community legal aid, civil rights advocacy, and youth legal empowerment.",
    phone: "+254 116 171 396",
    email: "kimathi@lexvanguard.edu",
    education: "LLB, Mount Kenya University",
    achievements: "Pro Bono Advocate of the Year",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80"
  }
};

const STORAGE_KEY = "lexvanguard_attorney_profiles";

export function loadProfile(name: string, fallbackData?: Partial<AttorneyProfile>): AttorneyProfile {
  const base: Partial<AttorneyProfile> = DEFAULT_PROFILES[name] || {};

  let storedObj: Partial<AttorneyProfile> = {};
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const all = JSON.parse(stored) as Record<string, AttorneyProfile>;
      if (all[name]) storedObj = all[name];
    }
  } catch {}

  // Determine best image URL:
  // 1. If fallbackData (e.g. live Firestore update) has a valid image/profilePhoto, prioritize live cloud data
  // 2. Otherwise if stored profile in localStorage has a custom image, use it
  // 3. Otherwise use default profile image or avatar SVG
  let finalImage = fallbackData?.profilePhoto || fallbackData?.image || (fallbackData as any)?.photoURL || storedObj.image || base.image;
  if (!finalImage) {
    finalImage = makeAvatarSvg(name);
  }

  return {
    name,
    title: fallbackData?.title || storedObj.title || base.title || "Counsel",
    practice: fallbackData?.practice || storedObj.practice || base.practice || "Legal Counsel & Advisory",
    bio: fallbackData?.bio || storedObj.bio || base.bio || "Click to add professional biography.",
    phone: fallbackData?.phone || storedObj.phone || base.phone || "+254 116 171 396",
    email: fallbackData?.email || storedObj.email || base.email || `${name.toLowerCase().replace(/\s+/g, '.')}@lexvanguard.edu`,
    education: fallbackData?.education || storedObj.education || base.education || "LLB, Mount Kenya University",
    achievements: fallbackData?.achievements || storedObj.achievements || base.achievements || "Legal Advocate",
    image: finalImage,
    profilePhoto: finalImage
  };
}

export function syncProfileFromFirestore(data: Partial<AttorneyProfile> & { name: string, profilePhoto?: string }): AttorneyProfile {
  const existing = loadProfile(data.name, data);
  const cloudImage = data.profilePhoto || data.image || (data as any)?.photoURL;
  const updated: AttorneyProfile = {
    ...existing,
    ...data,
    image: cloudImage || existing.image || makeAvatarSvg(data.name),
    profilePhoto: cloudImage || existing.image || makeAvatarSvg(data.name)
  };

  DEFAULT_PROFILES[data.name] = updated;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const all = stored ? (JSON.parse(stored) as Record<string, AttorneyProfile>) : {};
    all[data.name] = updated;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {}

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("lexvanguard_profile_updated", { detail: updated }));
  }

  return updated;
}

function cleanFirestorePayload<T extends Record<string, any>>(data: T): Record<string, any> {
  const cleaned: Record<string, any> = {};
  for (const key of Object.keys(data)) {
    const val = data[key];
    cleaned[key] = val === undefined ? "" : val;
  }
  return cleaned;
}

export function saveProfile(profile: AttorneyProfile): void {
  // Ensure profilePhoto is in sync with image
  const profileToSave = {
    ...profile,
    profilePhoto: profile.profilePhoto || profile.image
  };

  // Update memory cache
  DEFAULT_PROFILES[profile.name] = { ...DEFAULT_PROFILES[profile.name], ...profileToSave };

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const all = stored ? (JSON.parse(stored) as Record<string, AttorneyProfile>) : {};
    all[profile.name] = profileToSave;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {}

  // Broadcast custom event for immediate UI updates across components
  try {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("lexvanguard_profile_updated", { detail: profileToSave }));
    }
  } catch {}

  // Sync to Firestore asynchronously with light payload guarantee
  (async () => {
    try {
      const canonicalKey = getCanonicalKey(profileToSave.name, profileToSave.email);
      if (db && canonicalKey) {
        let finalImage = profileToSave.image || profileToSave.profilePhoto || "";

        // If image is a large Base64 string (>100KB), compress it first so Firestore setDoc never fails
        if (finalImage && finalImage.startsWith("data:image/") && finalImage.length > 100000) {
          try {
            finalImage = await compressImage(finalImage, 800, 800, 0.75);
          } catch {}
        }

        const userProfilePayload = cleanFirestorePayload({
          uid: canonicalKey || "",
          name: profileToSave.name || "",
          displayName: profileToSave.name || "",
          title: profileToSave.title || "Counsel",
          practice: profileToSave.practice || "Legal Advisory",
          bio: profileToSave.bio || "",
          phone: profileToSave.phone || "",
          email: profileToSave.email || "",
          education: profileToSave.education || "",
          achievements: profileToSave.achievements || "",
          profilePhoto: finalImage || "",
          image: finalImage || "",
          photoURL: finalImage || "",
          avatar: finalImage || "",
          updatedAt: new Date().toISOString()
        });

        const usersPayload = cleanFirestorePayload({
          uid: canonicalKey || "",
          name: profileToSave.name || "",
          displayName: profileToSave.name || "",
          title: profileToSave.title || "Counsel",
          practice: profileToSave.practice || "",
          email: profileToSave.email || "",
          updatedAt: new Date().toISOString()
        });

        // Write user profile data with photos to "userProfiles" collection
        await setDoc(doc(db, "userProfiles", canonicalKey), userProfilePayload, { merge: true });
        // Write office/identity info to "users" collection
        await setDoc(doc(db, "users", canonicalKey), usersPayload, { merge: true });

        if (profileToSave.email) {
          const emailKey = profileToSave.email.toLowerCase().trim().replace(/[^a-z0-9]/g, "_");
          await setDoc(doc(db, "userProfiles", emailKey), userProfilePayload, { merge: true });
          await setDoc(doc(db, "users", emailKey), usersPayload, { merge: true });
        }
      }
    } catch (err) {
      console.warn("Could not sync profile to Firestore:", err);
    }
  })();
}

export async function syncLocalProfilesToFirestore(): Promise<void> {
  if (!db) return;
  try {
    const allProfiles = getAllProfiles();
    for (const name of Object.keys(allProfiles)) {
      const prof = allProfiles[name];
      if (!prof) continue;

      const canonicalKey = getCanonicalKey(prof.name, prof.email);
      let finalImage = prof.image || prof.profilePhoto || "";

      if (finalImage && finalImage.startsWith("data:image/") && finalImage.length > 100000) {
        try {
          finalImage = await compressImage(finalImage, 800, 800, 0.75);
        } catch {}
      }

      const userProfilePayload = cleanFirestorePayload({
        uid: canonicalKey || "",
        name: prof.name || "",
        displayName: prof.name || "",
        title: prof.title || "Counsel",
        practice: prof.practice || "Legal Advisory",
        bio: prof.bio || "",
        phone: prof.phone || "",
        email: prof.email || "",
        education: prof.education || "",
        achievements: prof.achievements || "",
        profilePhoto: finalImage || "",
        image: finalImage || "",
        photoURL: finalImage || "",
        avatar: finalImage || "",
        updatedAt: new Date().toISOString()
      });

      const usersPayload = cleanFirestorePayload({
        uid: canonicalKey || "",
        name: prof.name || "",
        displayName: prof.name || "",
        title: prof.title || "Counsel",
        practice: prof.practice || "",
        email: prof.email || "",
        updatedAt: new Date().toISOString()
      });

      if (canonicalKey) {
        await setDoc(doc(db, "userProfiles", canonicalKey), userProfilePayload, { merge: true });
        await setDoc(doc(db, "users", canonicalKey), usersPayload, { merge: true });
      }

      if (prof.email) {
        const emailKey = prof.email.toLowerCase().trim().replace(/[^a-z0-9]/g, "_");
        await setDoc(doc(db, "userProfiles", emailKey), userProfilePayload, { merge: true });
        await setDoc(doc(db, "users", emailKey), usersPayload, { merge: true });
      }
    }
  } catch (err) {
    console.warn("Auto-sync local profiles to Firestore failed:", err);
  }
}

// Auto-run local profiles sync to Firestore on load
if (typeof window !== "undefined") {
  setTimeout(() => {
    syncLocalProfilesToFirestore();
  }, 1000);
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

export function handleProfileImageError(e: React.SyntheticEvent<HTMLImageElement, Event>, name?: string): void {
  const imgEl = e.target as HTMLImageElement;
  const currentSrc = imgEl.src;

  // Try fixing ibb.co viewer links to direct i.ibb.co URL
  if (currentSrc && currentSrc.includes("ibb.co/") && !currentSrc.includes("i.ibb.co/")) {
    const parts = currentSrc.split("ibb.co/")[1]?.split("/");
    const code = parts?.[0];
    if (code) {
      imgEl.src = `https://i.ibb.co/${code}/image.jpg`;
      return;
    }
  }

  const fallback = "https://37assets.37signals.com/svn/765-default-avatar.png";
  
  if (imgEl.src !== fallback) {
    imgEl.src = fallback;
  }
}


