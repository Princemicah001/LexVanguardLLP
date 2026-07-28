export interface Role {
  level: number;
  name: string;
}

export interface FirmUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  officeId: string;
  title: string;
  practice: string;
}

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

export interface Task {
  id: number;
  title: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  priority: 'Low' | 'Medium' | 'High';
  assignee: string;
  due: string;
  description: string;
}

export interface ActiveMatter {
  title: string;
  client: string;
  status: string;
  urgency: string;
  description: string;
}

export interface SystemAlert {
  title: string;
  time: string;
  iconType: 'file' | 'check' | 'user' | 'bell';
}
