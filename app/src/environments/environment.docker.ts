export const environment = {
  production: true,
  apiUrl: '/api', // Use nginx proxy
  services: {
    authService: 'http://auth-service:3001',
    userService: 'http://user-service:3005', 
    bookingService: 'http://booking-service:3002',
    codeReviewService: 'http://code-review-service:3003',
    messagingService: 'http://messaging-service:3004'
  }
};