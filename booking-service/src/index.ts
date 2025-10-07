import { Server } from './server';

// Start the booking service
const server = new Server();
server.start().catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});