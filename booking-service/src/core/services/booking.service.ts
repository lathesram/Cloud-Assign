import { v4 as uuidv4 } from 'uuid';
import { PutCommand, GetCommand, ScanCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { dynamodb, TABLES } from '../../config/dynamodb';
import { Booking, CreateBookingRequest, UpdateBookingRequest } from '../../models/booking.model';

export class BookingService {
  async createBooking(menteeId: string, bookingData: CreateBookingRequest): Promise<{ success: boolean; booking?: Booking; message: string }> {
    try {
      const bookingId = uuidv4();
      const now = new Date().toISOString();
      
      const booking: Booking = {
        bookingId,
        mentorId: bookingData.mentorId,
        menteeId,
        timeslot: bookingData.timeslot,
        status: 'requested',
        sessionTitle: bookingData.sessionTitle,
        description: bookingData.description,
        duration: bookingData.duration,
        createdAt: now,
        updatedAt: now
      };

      await dynamodb.send(new PutCommand({
        TableName: TABLES.BOOKINGS,
        Item: booking
      }));

      return {
        success: true,
        booking,
        message: 'Booking created successfully'
      };
    } catch (error) {
      console.error('Create booking error:', error);
      return {
        success: false,
        message: 'Failed to create booking'
      };
    }
  }

  async getBookingById(bookingId: string): Promise<Booking | null> {
    try {
      const result = await dynamodb.send(new ScanCommand({
        TableName: TABLES.BOOKINGS,
        FilterExpression: 'bookingId = :bookingId',
        ExpressionAttributeValues: {
          ':bookingId': bookingId
        }
      }));

      if (result.Items && result.Items.length > 0) {
        return result.Items[0] as Booking;
      }
      return null;
    } catch (error) {
      console.error('Get booking error:', error);
      return null;
    }
  }

  async getUserBookings(userId: string): Promise<{ success: boolean; bookings: Booking[]; message: string }> {
    try {
      const result = await dynamodb.send(new ScanCommand({
        TableName: TABLES.BOOKINGS
      }));

      const bookings = (result.Items as Booking[] || []).filter(booking => {
        return booking.mentorId === userId || booking.menteeId === userId;
      });

      return {
        success: true,
        bookings,
        message: 'Bookings retrieved successfully'
      };
    } catch (error) {
      console.error('Get user bookings error:', error);
      return {
        success: false,
        bookings: [],
        message: 'Failed to retrieve bookings'
      };
    }
  }

  async updateBooking(bookingId: string, updates: UpdateBookingRequest): Promise<{ success: boolean; booking?: Booking; message: string }> {
    try {

      const existingBooking = await this.getBookingById(bookingId);
      if (!existingBooking) {
        return {
          success: false,
          message: 'Booking not found'
        };
      }


      const updatedBooking: Booking = {
        ...existingBooking,
        ...updates,
        updatedAt: new Date().toISOString()
      };


      await dynamodb.send(new PutCommand({
        TableName: TABLES.BOOKINGS,
        Item: updatedBooking
      }));

      return {
        success: true,
        booking: updatedBooking,
        message: 'Booking updated successfully'
      };
    } catch (error) {
      console.error('Update booking error:', error);
      return {
        success: false,
        message: 'Failed to update booking'
      };
    }
  }

  async getAllBookings(filters?: any): Promise<{ success: boolean; bookings: Booking[]; message: string }> {
    try {
      const result = await dynamodb.send(new ScanCommand({
        TableName: TABLES.BOOKINGS
      }));

      let bookings = (result.Items as Booking[] || []);

      // Apply filters if provided
      if (filters) {
        if (filters.status) {
          bookings = bookings.filter(booking => booking.status === filters.status);
        }
        if (filters.mentorId) {
          bookings = bookings.filter(booking => booking.mentorId === filters.mentorId);
        }
        if (filters.menteeId) {
          bookings = bookings.filter(booking => booking.menteeId === filters.menteeId);
        }
      }

      return {
        success: true,
        bookings,
        message: 'Bookings retrieved successfully'
      };
    } catch (error) {
      console.error('Get all bookings error:', error);
      return {
        success: false,
        bookings: [],
        message: 'Failed to retrieve bookings'
      };
    }
  }

  async deleteBooking(bookingId: string): Promise<{ success: boolean; message: string }> {
    try {
      const existingBooking = await this.getBookingById(bookingId);
      if (!existingBooking) {
        return {
          success: false,
          message: 'Booking not found'
        };
      }

      // Instead of actual delete, mark as cancelled
      const updatedBooking: Booking = {
        ...existingBooking,
        status: 'cancelled',
        updatedAt: new Date().toISOString()
      };

      await dynamodb.send(new PutCommand({
        TableName: TABLES.BOOKINGS,
        Item: updatedBooking
      }));

      return {
        success: true,
        message: 'Booking cancelled successfully'
      };
    } catch (error) {
      console.error('Delete booking error:', error);
      return {
        success: false,
        message: 'Failed to cancel booking'
      };
    }
  }

  async getMentorBookings(mentorId: string): Promise<{ success: boolean; bookings: Booking[]; message: string }> {
    try {
      const result = await dynamodb.send(new ScanCommand({
        TableName: TABLES.BOOKINGS,
        FilterExpression: 'mentorId = :mentorId',
        ExpressionAttributeValues: {
          ':mentorId': mentorId
        }
      }));

      const bookings = result.Items as Booking[] || [];

      return {
        success: true,
        bookings,
        message: 'Mentor bookings retrieved successfully'
      };
    } catch (error) {
      console.error('Get mentor bookings error:', error);
      return {
        success: false,
        bookings: [],
        message: 'Failed to retrieve mentor bookings'
      };
    }
  }

  async getMenteeBookings(menteeId: string): Promise<{ success: boolean; bookings: Booking[]; message: string }> {
    try {
      const result = await dynamodb.send(new ScanCommand({
        TableName: TABLES.BOOKINGS,
        FilterExpression: 'menteeId = :menteeId',
        ExpressionAttributeValues: {
          ':menteeId': menteeId
        }
      }));

      const bookings = result.Items as Booking[] || [];

      return {
        success: true,
        bookings,
        message: 'Mentee bookings retrieved successfully'
      };
    } catch (error) {
      console.error('Get mentee bookings error:', error);
      return {
        success: false,
        bookings: [],
        message: 'Failed to retrieve mentee bookings'
      };
    }
  }

  async getUpcomingMentorBookings(mentorId: string): Promise<{ success: boolean; bookings: Booking[]; message: string }> {
    try {
      const result = await this.getMentorBookings(mentorId);
      if (!result.success) {
        return result;
      }

      const now = new Date();
      const upcomingBookings = result.bookings.filter(booking => {
        const bookingDate = new Date(booking.timeslot);
        return bookingDate > now && (booking.status === 'accepted' || booking.status === 'requested');
      });

      return {
        success: true,
        bookings: upcomingBookings,
        message: 'Upcoming mentor bookings retrieved successfully'
      };
    } catch (error) {
      console.error('Get upcoming mentor bookings error:', error);
      return {
        success: false,
        bookings: [],
        message: 'Failed to retrieve upcoming mentor bookings'
      };
    }
  }

  async getUpcomingMenteeBookings(menteeId: string): Promise<{ success: boolean; bookings: Booking[]; message: string }> {
    try {
      const result = await this.getMenteeBookings(menteeId);
      if (!result.success) {
        return result;
      }

      const now = new Date();
      const upcomingBookings = result.bookings.filter(booking => {
        const bookingDate = new Date(booking.timeslot);
        return bookingDate > now && (booking.status === 'accepted' || booking.status === 'requested');
      });

      return {
        success: true,
        bookings: upcomingBookings,
        message: 'Upcoming mentee bookings retrieved successfully'
      };
    } catch (error) {
      console.error('Get upcoming mentee bookings error:', error);
      return {
        success: false,
        bookings: [],
        message: 'Failed to retrieve upcoming mentee bookings'
      };
    }
  }

  async getBookingStats(userId?: string): Promise<{ success: boolean; stats?: any; message: string }> {
    try {
      let bookings: Booking[] = [];
      
      if (userId) {
        const result = await this.getUserBookings(userId);
        if (!result.success) {
          return { success: false, message: result.message };
        }
        bookings = result.bookings;
      } else {
        const result = await this.getAllBookings();
        if (!result.success) {
          return { success: false, message: result.message };
        }
        bookings = result.bookings;
      }

      const stats = {
        totalBookings: bookings.length,
        completedSessions: bookings.filter(b => b.status === 'completed').length,
        upcomingSessions: bookings.filter(b => {
          const bookingDate = new Date(b.timeslot);
          return bookingDate > new Date() && (b.status === 'accepted' || b.status === 'requested');
        }).length,
        cancelledSessions: bookings.filter(b => b.status === 'cancelled' || b.status === 'declined').length
      };

      return {
        success: true,
        stats,
        message: 'Booking stats retrieved successfully'
      };
    } catch (error) {
      console.error('Get booking stats error:', error);
      return {
        success: false,
        message: 'Failed to retrieve booking stats'
      };
    }
  }

}