export const environment = {
  production: true,
  apiUrl: 'http://18.140.246.35', // Frontend URL (updated)
  services: {
    userService: 'http://47.129.127.2:3005/api/users',
    bookingService: 'http://54.179.190.146:3002/api/bookings', 
    codeReviewService: 'http://code-review-service:3003/api/reviews' // Using service name for now
  }
};