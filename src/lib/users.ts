import { doc, getDoc, collection, query, where, getDocs, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";
import { syncProfileFromFirestore } from "./profile-store";

export const ROLES = {
  CLIENT: { level: 0, name: 'Client' },
  MEMBER: { level: 1, name: 'Member' },
  RESEARCHER: { level: 2, name: 'Researcher' },
  ASSOCIATE: { level: 3, name: 'Associate' },
  MANAGER: { level: 5, name: 'Manager' },
  ADMIN: { level: 10, name: 'Admin' },
  COUNSEL: { level: 50, name: 'Counsel' },
  MANAGING_PARTNER: { level: 100, name: 'Managing Partner' }
} as const;

export type RoleKey = keyof typeof ROLES;
export type Role = { level: number; name: string };

export interface FirmUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  officeId: string;
  title: string;
  practice: string;
}

export const AUTHORIZED_USERS: Record<string, FirmUser> = {
  'n6NKoyAIuVSXYEaIbRVN9drINNy1': {
    id: 'n6NKoyAIuVSXYEaIbRVN9drINNy1',
    name: 'Prince Micah',
    email: 'prince@lexvanguard.edu',
    role: ROLES.MANAGING_PARTNER,
    officeId: 'prince',
    title: 'Founding & Managing Partner',
    practice: 'Corporate & Tech Law, Mergers & Acquisitions'
  },
  'SSbNEJrVyhM6b8LbWYsyunPGk6l2': {
    id: 'SSbNEJrVyhM6b8LbWYsyunPGk6l2',
    name: 'Kelvin Musya',
    email: 'kelvin@lexvanguard.edu',
    role: ROLES.MANAGING_PARTNER,
    officeId: 'kelvin',
    title: 'Founding & Senior Partner',
    practice: 'Appellate Advocacy, Supreme Court Litigation'
  }
};

export async function fetchFirmUser(uid: string, email?: string): Promise<FirmUser | null> {
  // 1. Check hardcoded dictionary
  if (AUTHORIZED_USERS[uid]) {
    return AUTHORIZED_USERS[uid];
  }

  try {
    // 2. Try fetching document by UID as doc ID
    const userDocRef = doc(db, "users", uid);
    const userSnap = await getDoc(userDocRef);

    let data: any = null;
    if (userSnap.exists()) {
      data = userSnap.data();
    } else {
      // 3. Try querying collection where "uid" == uid
      const q = query(collection(db, "users"), where("uid", "==", uid));
      const querySnap = await getDocs(q);
      if (!querySnap.empty) {
        data = querySnap.docs[0].data();
      } else if (email) {
        // 4. Try querying collection where "email" == email
        const qEmail = query(collection(db, "users"), where("email", "==", email));
        const emailSnap = await getDocs(qEmail);
        if (!emailSnap.empty) {
          data = emailSnap.docs[0].data();
        }
      }
    }

    if (data) {
      const name = data.name || data.displayName || "Firm Member";
      const officeId = (data.officeId || data.roleName || "counsel").toString().toLowerCase().trim();
      const roleLevel = typeof data.roleLevel === "number" ? data.roleLevel : 50;
      const roleName = data.roleName || "Counsel";
      const userEmail = data.email || email || `${officeId}@lexvanguard.edu`;

      return {
        id: uid,
        name,
        email: userEmail,
        role: { level: Number(roleLevel), name: roleName },
        officeId: officeId || "counsel",
        title: data.title || roleName,
        practice: data.practice || "Legal Counsel & Advisory"
      };
    }
  } catch (err) {
    console.warn("User profile fetch from Firestore unavailable, using fallback profile:", err);
  }

  // Fallback for any authenticated Firebase user so login never fails for valid members
  if (uid) {
    const fallbackOffice = "counsel";
    const userName = email ? email.split("@")[0].replace(/[._]/g, " ") : "Firm Member";
    return {
      id: uid,
      name: userName,
      email: email || `${fallbackOffice}@lexvanguard.edu`,
      role: { level: 50, name: "Counsel" },
      officeId: fallbackOffice,
      title: "Counsel",
      practice: "Legal Counsel & Advisory"
    };
  }

  return null;
}


export interface FirestoreMember {
  uid: string;
  name: string;
  title?: string;
  practice?: string;
  email?: string;
  officeId?: string;
  image?: string;
  bio?: string;
  phone?: string;
  education?: string;
  achievements?: string;
}

export const DEFAULT_ATTORNEY_LIST: FirestoreMember[] = [
  { uid: "n6NKoyAIuVSXYEaIbRVN9drINNy1", name: "Prince Micah", title: "Founding & Managing Partner", practice: "Corporate & Tech Law, Mergers & Acquisitions", email: "prince@lexvanguard.edu" },
  { uid: "SSbNEJrVyhM6b8LbWYsyunPGk6l2", name: "Kelvin Musya", title: "Founding & Senior Partner", practice: "Appellate Advocacy, Supreme Court Litigation", email: "kelvin@lexvanguard.edu" },
  { uid: "donel_aganyo_uid", name: "Donel Aganyo", title: "Founding Partner", practice: "Intellectual Property, Patent Litigation", email: "donel@lexvanguard.edu" },
  { uid: "linet_njeri_uid", name: "Linet Njeri", title: "Finance Manager", practice: "Commercial Litigation, Dispute Resolution", email: "linet@lexvanguard.edu" },
  { uid: "sharon_mwariri_uid", name: "Sharon Mwariri", title: "Lead Legal Researcher", practice: "Policy Analysis, Legislative Drafting", email: "sharon@lexvanguard.edu" },
  { uid: "kimathi_winner_uid", name: "Kimathi Winner", title: "Associate", practice: "Pro Bono Initiative, Civil Rights", email: "kimathi@lexvanguard.edu" }
];

export function getMemberRank(m: FirestoreMember): number {
  const title = (m.title || "").toLowerCase();
  const office = (m.officeId || "").toLowerCase();
  const name = (m.name || "").toLowerCase();

  if (name.includes("prince micah") || office === "prince" || title.includes("managing partner")) return 100;
  if (name.includes("kelvin musya") || office === "kelvin" || title.includes("senior partner")) return 98;
  if (name.includes("donel aganyo") || office === "donel" || (title.includes("founding") && title.includes("partner"))) return 95;
  if (title.includes("partner")) return 80;
  if (title.includes("finance") || title.includes("commercial") || office === "linet") return 70;
  if (title.includes("research") || title.includes("scholar") || office === "sharon") return 60;
  if (title.includes("counsel") || office === "counsel") return 50;
  if (title.includes("associate") || office === "kimathi") return 40;
  if (title.includes("member")) return 30;
  return 20;
}

export function getOfficeBadge(m: FirestoreMember): string {
  const rank = getMemberRank(m);
  const name = (m.name || "").toLowerCase();

  if (name.includes("prince micah") || rank === 100) return "Founding Partner • Managing Partner";
  if (name.includes("kelvin musya") || rank === 98) return "Founding Partner • Senior Partner";
  if (name.includes("donel aganyo") || rank === 95) return "Founding Partner • IP Practice Lead";
  if (rank >= 80) return "Partnership Office";
  if (rank >= 70) return "Commercial & Finance Office";
  if (rank >= 60) return "Research & Policy Office";
  if (rank >= 50) return "Chambers Counsel";
  if (rank >= 40) return "Associate Office";
  return "Firm Member";
}

export function sortMembersByHierarchy(members: FirestoreMember[]): FirestoreMember[] {
  return [...members].sort((a, b) => getMemberRank(b) - getMemberRank(a));
}

export function getCanonicalKey(name: string, email?: string, uid?: string): string {
  const n = (name || "").toLowerCase().trim();
  const e = (email || "").toLowerCase().trim();
  const u = (uid || "").toLowerCase().trim();

  if (n.includes("donel") || e.includes("donel") || u.includes("donel")) return "donel_aganyo";
  if (n.includes("prince") || e.includes("prince") || u.includes("prince")) return "prince_micah";
  if (n.includes("kelvin") || e.includes("kelvin") || u.includes("kelvin")) return "kelvin_musya";
  if (n.includes("linet") || e.includes("linet") || u.includes("linet")) return "linet_njeri";
  if (n.includes("sharon") || e.includes("sharon") || u.includes("sharon")) return "sharon_mwariri";
  if (n.includes("kimathi") || e.includes("kimathi") || u.includes("kimathi")) return "kimathi_winner";
  if (n.includes("sherifa") || e.includes("sherifa") || u.includes("sherifa")) return "sherifa_abdilatif";

  const clean = n.replace(/[^a-z0-9]/g, "");
  return u || clean || e;
}

export function subscribeFirestoreMembers(callback: (members: FirestoreMember[]) => void) {
  try {
    const colRef = collection(db, "users");
    return onSnapshot(colRef, (snapshot) => {
      const list: FirestoreMember[] = [];
      const seenKeys = new Set<string>();

      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const name = data.name || data.displayName || "Firm Member";
        const uid = data.uid || docSnap.id;
        const email = data.email || "";

        if (name && uid) {
          const key = getCanonicalKey(name, email, uid);

          // Dynamically sync profile info into profile-store
          syncProfileFromFirestore({
            name,
            title: data.title || data.roleName,
            practice: data.practice,
            bio: data.bio,
            phone: data.phone,
            email: data.email,
            education: data.education,
            achievements: data.achievements,
            image: data.image
          });

          if (!seenKeys.has(key)) {
            seenKeys.add(key);
            list.push({
              uid: uid.toString().trim(),
              name,
              title: data.title || data.roleName || "Counsel",
              practice: data.practice || "Legal Counsel & Advisory",
              email: data.email,
              officeId: data.officeId,
              image: data.image,
              bio: data.bio,
              phone: data.phone,
              education: data.education,
              achievements: data.achievements
            });
          }
        }
      });

      // Ensure default attorneys are included if not yet present in Firestore
      DEFAULT_ATTORNEY_LIST.forEach((def) => {
        const key = getCanonicalKey(def.name, def.email, def.uid);
        if (!seenKeys.has(key)) {
          seenKeys.add(key);
          list.push(def);
        }
      });

      callback(sortMembersByHierarchy(list));
    }, (error) => {
      console.warn("Firestore users subscription unavailable, using local default attorney list:", error?.message || error);
      callback(sortMembersByHierarchy(DEFAULT_ATTORNEY_LIST));
    });
  } catch (e) {
    console.warn("Error setting up Firestore listener, using local default attorney list:", e);
    callback(sortMembersByHierarchy(DEFAULT_ATTORNEY_LIST));
    return () => {};
  }
}

export const ATTORNEY_NAMES = [
  "Prince Micah",
  "Kelvin Musya",
  "Donel Aganyo",
  "Linet Njeri",
  "Sharon Mwariri",
  "Kimathi Winner"
];

export const ATTORNEY_UID_MAP: Record<string, string> = {
  "Prince Micah": "n6NKoyAIuVSXYEaIbRVN9drINNy1",
  "Kelvin Musya": "SSbNEJrVyhM6b8LbWYsyunPGk6l2"
};

export const TASKS = [
  { id: 1, title: 'Draft Appellate Brief', status: 'In Progress', priority: 'High', assignee: 'Sharon Mwariri', due: 'Apr 2, 2026', description: 'Prepare the full appellate brief for submission to the Court of Appeal. Include all supporting case law and statutory references.' },
  { id: 2, title: 'M&A Due Diligence Review', status: 'Pending', priority: 'Medium', assignee: 'Prince Micah', due: 'Apr 8, 2026', description: 'Conduct a comprehensive due diligence review for the TechCorp acquisition target. Cover financials, IP, and regulatory compliance.' },
  { id: 3, title: 'Client Intake Form - IP Litigation', status: 'Completed', priority: 'High', assignee: 'Donel Aganyo', due: 'Mar 25, 2026', description: 'Complete the client intake process for the intellectual property litigation matter. All documentation verified and filed.' }
];
