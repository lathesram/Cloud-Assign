export const environment = {
  production: true,
  apiUrl: '/api', // Use nginx proxy
  services: {
    userService: 'http://47.129.127.2:3005/api/users', 
    bookingService: 'http://54.179.190.146:3002/api/bookings',
    codeReviewService: 'http://code-review-service:3003/api/reviews' // Using service name for now
  }
};