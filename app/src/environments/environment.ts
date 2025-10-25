export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000', // Development API URL
  services: {
    authService: 'http://localhost:3001',
    userService: 'http://localhost:3002', 
    bookingService: 'http://localhost:3003',
    codeReviewService: 'http://localhost:3004',
    messagingService: 'http://localhost:3005'
  }
};