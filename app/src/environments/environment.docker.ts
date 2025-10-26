export const environment = {
  production: true,
  apiUrl: '/api', // Use nginx proxy
  services: {
    userService: 'http://13.214.136.130:3000/api/users', 
    bookingService: 'http://13.214.201.141:3000/api/bookings',
    codeReviewService: 'http://3.1.51.192:3000/api/reviews'
  }
};