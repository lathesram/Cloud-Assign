import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import bookingRoutes from './api/routes/booking.routes';
import { checkDynamoDBConnection } from './config/dynamodb';

dotenv.config();

export class Server {
  private app: express.Application;
  private port: number;

  constructor() {
    this.app = express();
    this.port = parseInt(process.env.PORT || '3002', 10);
    this.setupMiddlewares();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  private setupMiddlewares(): void {
    // Enable CORS with proper configuration
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
    
    this.app.use(helmet({
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: false
    }));
    
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  }

  private setupRoutes(): void {
    this.app.get('/health', (req, res) => {
      res.status(200).json({ success: true, message: 'Booking service is healthy' });
    });
    
    this.app.use('/api/bookings', bookingRoutes);
  }

  private setupErrorHandling(): void {
    this.app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
      res.status(500).json({ success: false, message: 'Internal server error' });
    });
  }

  public async start(): Promise<void> {
    try {
      console.log('🚀 Starting Booking Service...');
      

      if (process.env.NODE_ENV !== 'development') {
        console.log('📊 Checking DynamoDB connection...');
        const dbConnected = await checkDynamoDBConnection();
        if (dbConnected) {
          console.log('✅ DynamoDB connection successful');
        } else {
          console.log('⚠️  DynamoDB connection failed, but continuing...');
        }
      } else {
        console.log('🔧 Development mode: Skipping DynamoDB connection check');
      }

      this.app.listen(this.port, () => {
        console.log(`✅ Booking Service is running on port ${this.port}`);
        console.log(`📍 Health check: http://localhost:${this.port}/health`);
      });
    } catch (error) {
      console.error('❌ Failed to start Booking Service:', error);
      throw error;
    }
  }

  public getApp(): express.Application {
    return this.app;
  }
}