export interface Booking {
  bookingId: string;
  mentorId: string;
  menteeId: string;
  timeslot: string;
  status: 'requested' | 'accepted' | 'declined' | 'completed' | 'cancelled';
  sessionTitle?: string;
  description?: string;
  duration?: number; // in minutes
  mentorRate?: number;
  totalAmount?: number;
  meetingLink?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  mentorName?: string;
  menteeName?: string;
  mentorEmail?: string;
  menteeEmail?: string;
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
  sessionTitle?: string;
  description?: string;
}

export interface BookingFilter {
  status?: string;
  mentorId?: string;
  menteeId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface BookingStats {
  totalBookings: number;
  completedSessions: number;
  upcomingSessions: number;
  cancelledSessions: number;
}