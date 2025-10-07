export interface User {
  userId: string;
  email: string;
  passwordHash: string;
  type: 'mentor' | 'mentee';
  name: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  type: 'mentor' | 'mentee';
}

export interface JWTPayload {
  userId: string;
  email: string;
  type: 'mentor' | 'mentee';
  iat?: number;
  exp?: number;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: {
    userId: string;
    email: string;
    name: string;
    type: 'mentor' | 'mentee';
  };
  message?: string;
}