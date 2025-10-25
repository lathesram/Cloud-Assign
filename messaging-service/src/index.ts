import { MessagingServer } from './server';

const server = new MessagingServer();

server.start().catch(() => {
  process.exit(1);
});
