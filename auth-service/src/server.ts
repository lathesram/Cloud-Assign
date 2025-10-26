import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import authRoutes from './api/routes/auth.routes';

dotenv.config();

export class Server {
  private app: express.Application;
  private port: number;

  constructor() {
    this.app = express();
    this.port = parseInt(process.env.PORT || '3001', 10);
    this.setupMiddlewares();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  private setupMiddlewares(): void {
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
    }));

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

    this.app.use(morgan('combined'));
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  }

  private setupRoutes(): void {
    this.app.get('/health', async (req, res) => {
      try {
        const { checkDynamoDBConnection } = await import('./config/dynamodb');
        const dynamodbHealthy = await checkDynamoDBConnection();
        
        const health = {
          success: true,
          message: 'Auth service is healthy',
          timestamp: new Date().toISOString(),
          service: 'auth-service',
          version: '1.0.0',
          dependencies: {
            dynamodb: dynamodbHealthy ? 'healthy' : 'unhealthy'
          },
          environment: process.env.NODE_ENV || 'development'
        };

        const status = dynamodbHealthy ? 200 : 503;
        res.status(status).json(health);
      } catch (error) {
        res.status(503).json({
          success: false,
          message: 'Health check failed',
          timestamp: new Date().toISOString(),
          service: 'auth-service',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    this.app.use('/api/auth', authRoutes);

    this.app.use('*', (req, res) => {
      res.status(404).json({
        success: false,
        message: 'Endpoint not found',
        path: req.originalUrl
      });
    });
  }

  private setupErrorHandling(): void {
    this.app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
      console.error('Error:', err.message);
      console.error('Stack:', err.stack);

      res.status(500).json({
        success: false,
        message: 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { error: err.message })
      });
    });
  }

  public start(): void {
    this.app.listen(this.port, () => {
      console.log(`🚀 Auth Service started on port ${this.port}`);
      console.log(`📊 Health check: http://localhost:${this.port}/health`);
      console.log(`🔐 Auth API: http://localhost:${this.port}/api/auth`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  }

  public getApp(): express.Application {
    return this.app;
  }
}