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
      origin: true,
      credentials: true
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
    this.httpServer.listen(this.port);
  }
}

if (require.main === module) {
  const server = new MessagingServer();
  server.start();
}
