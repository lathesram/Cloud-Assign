import { Router } from 'express';
import { BookingController } from '../controllers/booking.controller';

const router = Router();
const bookingController = new BookingController();

// Booking routes as per requirements:
// POST /bookings → create booking
router.post('/', bookingController.createBooking.bind(bookingController));

// GET /bookings/:id → booking details (no additional parameters needed)
router.get('/:id', bookingController.getBookingById.bind(bookingController));

// PUT /bookings/:id → update (accept/decline) (no additional parameters needed)
router.put('/:id', bookingController.updateBooking.bind(bookingController));

// Additional utility routes (not in requirements but helpful)
// GET /bookings/user/:userId → get all bookings for user (both as mentor and mentee)
router.get('/user/:userId', bookingController.getUserBookings.bind(bookingController));

export default router;