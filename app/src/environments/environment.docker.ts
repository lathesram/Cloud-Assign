export const environment = {
  production: true,
  apiUrl: '/api', // Use nginx proxy
  services: {
    userService: 'http://13.214.136.130:3005/api/users', 
    bookingService: 'http://13.214.201.141:3002/api/bookings',
    codeReviewService: 'http://3.1.51.192:3003/api/reviews'
  }
};