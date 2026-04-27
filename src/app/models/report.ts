export type ReportStatus = 'pending' | 'resolved' | 'invalid';
export type ReportCategory =
  | 'trash'
  | 'pothole'
  | 'public-lighting'
  | 'security'
  | 'sidewalk'
  | 'other';

export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  role: string;
}

export interface ReportItem {
  id: string;
  userId: string;
  userName: string;
  userPhoto: string;
  category: ReportCategory;
  latitude: number;
  longitude: number;
  description: string;
  imageUrl?: string;
  status: ReportStatus;
  createdAt?: any;
}

export interface RankingItem {
  id: string;
  name: string;
  photo: string;
  count: number;
}