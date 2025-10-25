import { Router } from 'express';
import { BookingController } from '../controllers/booking.controller';

const router = Router();
const bookingController = new BookingController();

// Booking routes as per requirements:
// GET /bookings → get all bookings (with filters)
router.get('/', bookingController.getAllBookings.bind(bookingController));

// POST /bookings → create booking
router.post('/', bookingController.createBooking.bind(bookingController));

// GET /bookings/stats → get booking statistics
router.get('/stats', bookingController.getBookingStats.bind(bookingController));

// GET /bookings/mentor/:mentorId → get bookings for specific mentor
router.get('/mentor/:mentorId', bookingController.getMentorBookings.bind(bookingController));

// GET /bookings/mentor/:mentorId/upcoming → get upcoming bookings for mentor
router.get('/mentor/:mentorId/upcoming', bookingController.getUpcomingMentorBookings.bind(bookingController));

// GET /bookings/mentee/:menteeId → get bookings for specific mentee  
router.get('/mentee/:menteeId', bookingController.getMenteeBookings.bind(bookingController));

// GET /bookings/mentee/:menteeId/upcoming → get upcoming bookings for mentee
router.get('/mentee/:menteeId/upcoming', bookingController.getUpcomingMenteeBookings.bind(bookingController));

// GET /bookings/user/:userId → get all bookings for user (both as mentor and mentee)
router.get('/user/:userId', bookingController.getUserBookings.bind(bookingController));

// GET /bookings/:id → booking details (no additional parameters needed)
router.get('/:id', bookingController.getBookingById.bind(bookingController));

// PUT /bookings/:id → update (accept/decline) (no additional parameters needed)
router.put('/:id', bookingController.updateBooking.bind(bookingController));

// DELETE /bookings/:id → cancel/delete booking
router.delete('/:id', bookingController.deleteBooking.bind(bookingController));

export default router;