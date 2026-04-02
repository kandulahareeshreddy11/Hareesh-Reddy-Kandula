export type UserRole = 'student' | 'staff' | 'cleaning staff' | 'admin';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Issue {
  id: string;
  type: 'dirty area' | 'water leakage' | 'garbage' | 'others';
  description: string;
  location: string;
  imageUrl?: string;
  status: 'Pending' | 'Completed';
  reportedBy: string;
  reportedByName: string;
  timestamp: any; // Firestore Timestamp
  completionNote?: string;
}
