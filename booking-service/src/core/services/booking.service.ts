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
      // First get the existing booking
      const existingBooking = await this.getBookingById(bookingId);
      if (!existingBooking) {
        return {
          success: false,
          message: 'Booking not found'
        };
      }

      // Create updated booking object
      const updatedBooking: Booking = {
        ...existingBooking,
        ...updates,
        updatedAt: new Date().toISOString()
      };

      // Put the updated booking back (this works regardless of key structure)
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

}