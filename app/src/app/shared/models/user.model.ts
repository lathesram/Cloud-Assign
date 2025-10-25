export interface User {
  userId: string;
  email: string;
  name: string;
  type: 'mentor' | 'mentee';
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  profilePicture?: string;
  bio?: string;
  skills?: string[];
  experience?: string;
  rating?: number;
  totalSessions?: number;
}

export interface CreateUserRequest {
  email: string;
  name: string;
  type: 'mentor' | 'mentee';
  bio?: string;
  skills?: string[];
  experience?: string;
}

export interface UpdateUserRequest {
  name?: string;
  bio?: string;
  skills?: string[];
  experience?: string;
  profilePicture?: string;
  isActive?: boolean;
}

export interface UserProfile {
  userId: string;
  email: string;
  name: string;
  type: 'mentor' | 'mentee';
  profilePicture?: string;
  bio?: string;
  skills?: string[];
  experience?: string;
  rating?: number;
  totalSessions?: number;
}