export const ROLES = {
  CLIENT: { level: 0, name: 'Client' },
  MEMBER: { level: 1, name: 'Member' },
  RESEARCHER: { level: 2, name: 'Researcher' },
  ASSOCIATE: { level: 3, name: 'Associate' },
  MANAGER: { level: 5, name: 'Manager' },
  ADMIN: { level: 10, name: 'Admin' },
  MANAGING_PARTNER: { level: 100, name: 'Managing Partner' }
} as const;

export type RoleKey = keyof typeof ROLES;
export type Role = typeof ROLES[RoleKey];

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
    title: 'Managing Partner',
    practice: 'Corporate & Tech Law, Mergers & Acquisitions'
  },
  'SSbNEJrVyhM6b8LbWYsyunPGk6l2': {
    id: 'SSbNEJrVyhM6b8LbWYsyunPGk6l2',
    name: 'Kelvin Musya',
    email: 'kelvin@lexvanguard.edu',
    role: ROLES.MANAGING_PARTNER,
    officeId: 'kelvin',
    title: 'Senior Partner',
    practice: 'Appellate Advocacy, Supreme Court Litigation'
  }
};

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
