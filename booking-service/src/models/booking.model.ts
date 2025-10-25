export interface Booking {
  bookingId: string;      // Primary Key
  mentorId: string;       // Sort Key  
  menteeId: string;
  timeslot: string;       // When the session is scheduled
  status: 'requested' | 'accepted' | 'declined' | 'completed' | 'cancelled';
  sessionTitle?: string;
  description?: string;
  duration?: number;      // in minutes
  mentorRate?: number;
  totalAmount?: number;
  meetingLink?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookingRequest {
  mentorId: string;
  timeslot: string;
  sessionTitle?: string;
  description?: string;
  duration?: number;
}

export interface UpdateBookingRequest {
  status?: 'accepted' | 'declined' | 'completed' | 'cancelled';
  meetingLink?: string;
  notes?: string;
}