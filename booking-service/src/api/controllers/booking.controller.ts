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
        res.status(201).json({
          success: true,
          data: result.booking,
          message: result.message
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message
        });
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
          data: booking
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
      res.status(200).json({
        success: result.success,
        data: result.bookings,
        message: result.message
      });
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
        res.status(200).json({
          success: true,
          data: result.booking,
          message: result.message
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message
        });
      }
    } catch (error) {
      console.error('Update booking controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  async getAllBookings(req: Request, res: Response): Promise<void> {
    try {
      const filters = req.query;
      const result = await bookingService.getAllBookings(filters);
      
      // Return in PaginatedResponse format that frontend expects
      res.status(200).json({
        success: result.success,
        data: {
          data: result.bookings,
          pagination: {
            page: 1,
            limit: result.bookings.length,
            total: result.bookings.length,
            totalPages: 1
          }
        },
        message: result.message
      });
    } catch (error) {
      console.error('Get all bookings controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  async deleteBooking(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Booking ID is required'
        });
        return;
      }

      const result = await bookingService.deleteBooking(id);
      
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(404).json(result);
      }
    } catch (error) {
      console.error('Delete booking controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  async getMentorBookings(req: Request, res: Response): Promise<void> {
    try {
      const { mentorId } = req.params;
      
      if (!mentorId) {
        res.status(400).json({
          success: false,
          message: 'Mentor ID is required'
        });
        return;
      }

      const result = await bookingService.getMentorBookings(mentorId);
      res.status(200).json({
        success: result.success,
        data: {
          data: result.bookings,
          pagination: {
            page: 1,
            limit: result.bookings.length,
            total: result.bookings.length,
            totalPages: 1
          }
        },
        message: result.message
      });
    } catch (error) {
      console.error('Get mentor bookings controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  async getMenteeBookings(req: Request, res: Response): Promise<void> {
    try {
      const { menteeId } = req.params;
      
      if (!menteeId) {
        res.status(400).json({
          success: false,
          message: 'Mentee ID is required'
        });
        return;
      }

      const result = await bookingService.getMenteeBookings(menteeId);
      res.status(200).json({
        success: result.success,
        data: {
          data: result.bookings,
          pagination: {
            page: 1,
            limit: result.bookings.length,
            total: result.bookings.length,
            totalPages: 1
          }
        },
        message: result.message
      });
    } catch (error) {
      console.error('Get mentee bookings controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  async getUpcomingMentorBookings(req: Request, res: Response): Promise<void> {
    try {
      const { mentorId } = req.params;
      
      if (!mentorId) {
        res.status(400).json({
          success: false,
          message: 'Mentor ID is required'
        });
        return;
      }

      const result = await bookingService.getUpcomingMentorBookings(mentorId);
      res.status(200).json({
        success: result.success,
        data: result.bookings,
        message: result.message
      });
    } catch (error) {
      console.error('Get upcoming mentor bookings controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  async getUpcomingMenteeBookings(req: Request, res: Response): Promise<void> {
    try {
      const { menteeId } = req.params;
      
      if (!menteeId) {
        res.status(400).json({
          success: false,
          message: 'Mentee ID is required'
        });
        return;
      }

      const result = await bookingService.getUpcomingMenteeBookings(menteeId);
      res.status(200).json({
        success: result.success,
        data: result.bookings,
        message: result.message
      });
    } catch (error) {
      console.error('Get upcoming mentee bookings controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  async getBookingStats(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.query;
      const result = await bookingService.getBookingStats(userId as string);
      
      if (result.success) {
        res.status(200).json({
          success: true,
          data: result.stats,
          message: result.message
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message
        });
      }
    } catch (error) {
      console.error('Get booking stats controller error:', error);
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