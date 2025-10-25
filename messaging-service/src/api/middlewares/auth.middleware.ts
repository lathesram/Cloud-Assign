import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthServiceClient } from '../../core/utils/auth-client';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        userType: 'mentor' | 'mentee';
        name?: string;
      };
    }
  }
}

const authServiceClient = new AuthServiceClient();

export const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Access token required'
      });
      return;
    }

    const token = authHeader.substring(7); 

    const authResult = await authServiceClient.verifyToken(token);

    if (authResult.success && authResult.user) {
      req.user = {
        userId: authResult.user.userId,
        email: authResult.user.email,
        userType: authResult.user.type,
        name: authResult.user.name
      };
      next();
      return;
    }

    if (process.env.NODE_ENV === 'development') {
      try {
        const payload = jwt.verify(token, process.env.JWT_SECRET || 'skillbridge-jwt-secret-2024') as any;

        req.user = {
          userId: payload.userId,
          email: payload.email,
          userType: payload.userType || 'mentee',
          name: payload.name
        };

        next();
        return;
      } catch (jwtError) {
      }
    }

    res.status(401).json({
      success: false,
      message: authResult.message || 'Invalid or expired token'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Authentication service error'
    });
  }
};

export const devAuthMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const userId = req.query.userId || req.headers['x-user-id'];
  const userType = req.query.userType || req.headers['x-user-type'] || 'mentee';

  if (!userId) {
    res.status(400).json({ 
      success: false,
      error: 'userId required in query params or x-user-id header for development' 
    });
    return;
  }

  req.user = { 
    userId: userId as string,
    email: `${userId}@example.com`,
    userType: userType as 'mentor' | 'mentee',
    name: `Test User ${userId}`
  };

  next();
};
