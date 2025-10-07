import dotenv from 'dotenv';
import { Server } from './server';

// Load environment variables
dotenv.config();

// Create and start the server
const server = new Server();
server.start();