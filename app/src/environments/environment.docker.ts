export const environment = {
  production: true,
  apiUrl: '/api', // Use nginx proxy
  services: {
    userService: '/api/users', 
    bookingService: '/api/bookings',
    codeReviewService: '/api/reviews'
  }
};