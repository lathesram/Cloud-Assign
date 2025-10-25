import { Request, Response } from 'express';
import { BookingService } from '../../core/services/booking.service';
import { CreateBookingRequest, UpdateBookingRequest } from '../../models/booking.model';

const bookingService = new BookingService();

export class BookingController {
  async createBooking(req: Request, res: Response): Promise<void> {
    try {
      const menteeId = req.body.menteeId;
      
      if (!menteeId) {
        res.status(400).json({
          success: false,
          message: 'Mentee ID is required'
        });
        return;
      }

      const bookingData: CreateBookingRequest = req.body;
      
      if (!bookingData.mentorId || !bookingData.timeslot) {
        res.status(400).json({
          success: false,
          message: 'Missing required fields: mentorId, timeslot'
        });
        return;
      }

      const result = await bookingService.createBooking(menteeId, bookingData);
      
      if (result.success) {
        res.status(201).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('Create booking controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  async getBookingById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Booking ID is required'
        });
        return;
      }
      
      const booking = await bookingService.getBookingById(id);
      
      if (booking) {
        res.status(200).json({
          success: true,
          booking
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'Booking not found'
        });
      }
    } catch (error) {
      console.error('Get booking controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  async getUserBookings(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      
      if (!userId) {
        res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
        return;
      }

      const result = await bookingService.getUserBookings(userId);
      res.status(200).json(result);
    } catch (error) {
      console.error('Get user bookings controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }


  async updateBooking(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Booking ID is required'
        });
        return;
      }

      const updates: UpdateBookingRequest = req.body;
      const result = await bookingService.updateBooking(id, updates);
      
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('Update booking controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }



  /**
   * Health check
   */
  async healthCheck(req: Request, res: Response): Promise<void> {
    res.status(200).json({
      success: true,
      message: 'Booking service is healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  }
}