export interface User {
  userId: string;
  email: string;
  type: 'mentor' | 'mentee';
  name: string;
  domain?: string;
  seniority?: 'junior' | 'mid' | 'senior' | 'staff' | 'principal';
  badges?: string[];
  bio?: string;
  experience?: number; // years of experience
  skills?: string[];
  hourlyRate?: number; // for mentors
  availability?: {
    timezone: string;
    slots: TimeSlot[];
  };
  profilePicture?: string;
  linkedinProfile?: string;
  githubProfile?: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  rating?: number;
  totalSessions?: number;
}

export interface TimeSlot {
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday, 6 = Saturday
  startTime: string; // "09:00"
  endTime: string;   // "17:00"
}

export interface UserProfile {
  userId: string;
  name: string;
  type: 'mentor' | 'mentee';
  domain?: string;
  seniority?: string;
  bio?: string;
  skills?: string[];
  rating?: number;
  totalSessions?: number;
  hourlyRate?: number;
  profilePicture?: string;
}

export interface CreateUserRequest {
  email: string;
  name: string;
  type: 'mentor' | 'mentee';
  domain?: string;
  seniority?: 'junior' | 'mid' | 'senior' | 'staff' | 'principal';
  bio?: string;
  skills?: string[];
  hourlyRate?: number;
  timezone?: string;
}

export interface UpdateUserRequest {
  name?: string;
  domain?: string;
  seniority?: 'junior' | 'mid' | 'senior' | 'staff' | 'principal';
  bio?: string;
  skills?: string[];
  hourlyRate?: number;
  availability?: {
    timezone: string;
    slots: TimeSlot[];
  };
  profilePicture?: string;
  linkedinProfile?: string;
  githubProfile?: string;
}

export interface SearchUsersRequest {
  type?: 'mentor' | 'mentee';
  domain?: string;
  skills?: string[];
  seniority?: string;
  minRating?: number;
  maxHourlyRate?: number;
  availability?: boolean;
  page?: number;
  limit?: number;
}

export interface UserSearchResult {
  users: UserProfile[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}