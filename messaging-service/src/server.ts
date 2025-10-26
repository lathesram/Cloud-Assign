import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import * as dotenv from 'dotenv';
import { createServer } from 'http';
import { SocketConfig } from './config/socket';
import { MessagingController } from './api/controllers/messaging.controller';
import messagingRoutes, { initializeRoutes } from './api/routes/messaging.routes';

dotenv.config();

export class MessagingServer {
  private app: express.Application;
  private httpServer: any;
  private port: number;
  private socketConfig!: SocketConfig;
  private messagingController!: MessagingController;

  constructor() {
    this.port = parseInt(process.env.PORT || '3004', 10);
    this.app = express();
    this.httpServer = createServer(this.app);

    this.setupMiddlewares();
    this.initializeSocket();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  private setupMiddlewares(): void {
    this.app.use(helmet());
    this.app.use(morgan('combined'));

    this.app.use(cors({
      origin: process.env.ALLOWED_ORIGINS?.split(',') || [
        'http://localhost:3000', 
        'http://localhost:4200', 
        'http://localhost:80',
        'http://localhost',
        'http://127.0.0.1:80',
        'http://127.0.0.1',
        // Allow Docker internal communication
        'http://app:80',
        'http://app'
      ],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
      allowedHeaders: [
        'Content-Type', 
        'Authorization', 
        'X-Requested-With', 
        'Accept', 
        'Origin',
        'Access-Control-Request-Method',
        'Access-Control-Request-Headers'
      ],
      preflightContinue: false,
      optionsSuccessStatus: 204
    }));

    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  private initializeSocket(): void {
    this.socketConfig = new SocketConfig(this.httpServer);
    this.messagingController = new MessagingController(this.socketConfig.getIO());
    this.socketConfig.setupEventHandlers(this.messagingController);
  }

  private setupRoutes(): void {
    initializeRoutes(this.messagingController);
    this.app.use('/api/v1/messages', messagingRoutes);

    this.app.get('/health', (req, res) => {
      res.status(200).json({
        status: 'healthy',
        service: 'messaging-service'
      });
    });
  }

  private setupErrorHandling(): void {
    this.app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    });
  }

  public async start(): Promise<void> {
    try {
      console.log('🚀 Starting Messaging Service...');
      
      this.httpServer.listen(this.port, () => {
        console.log(`✅ Messaging Service is running on port ${this.port}`);
        console.log(`📍 Health check: http://localhost:${this.port}/health`);
        console.log(`🔌 Socket.IO server initialized`);
      });
    } catch (error) {
      console.error('❌ Failed to start Messaging Service:', error);
      throw error;
    }
  }
}

if (require.main === module) {
  const server = new MessagingServer();
  server.start();
}
