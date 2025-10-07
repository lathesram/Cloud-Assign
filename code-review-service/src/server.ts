import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import codeReviewRoutes from './api/routes/code-review.routes';
import { validateTableSchema } from './config/dynamodb';
import { validateS3Config } from './config/s3';

dotenv.config();

export class Server {
  private app: express.Application;
  private port: number;

  constructor() {
    this.app = express();
    this.port = parseInt(process.env.PORT || '3003', 10);
    this.validateConfigurations();
    this.setupMiddlewares();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  private validateConfigurations(): void {
    try {
      validateTableSchema();
      validateS3Config();
      console.log('✅ Configurations validated');
    } catch (error) {
      console.error('❌ Configuration failed:', error);
      process.exit(1);
    }
  }

  private setupMiddlewares(): void {
    this.app.use(helmet());
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    
    // Request logging middleware
    this.app.use((req, res, next) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
      next();
    });
  }

  private setupRoutes(): void {
    this.app.get('/health', (req, res) => {
      res.status(200).json({ status: 'healthy' });
    });

    this.app.use('/api/v1/reviews', codeReviewRoutes);

    this.app.use('*', (req, res) => {
      res.status(404).json({ message: 'Route not found' });
    });
  }

  private setupErrorHandling(): void {
    this.app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      console.error('Error:', error);
      return res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Internal server error'
      });
    });
  }

  public start(): void {
    this.app.listen(this.port, () => {
      console.log(`Server running on port ${this.port}`);
    });
  }

  public getApp(): express.Application {
    return this.app;
  }
}