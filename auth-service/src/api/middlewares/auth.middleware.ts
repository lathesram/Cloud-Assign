import { Request, Response, NextFunction } from 'express';
import { JWTUtils } from '../../core/utils/jwt.utils';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        type: 'mentor' | 'mentee';
      };
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    const token = JWTUtils.extractTokenFromHeader(authHeader);

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Access token required'
      });
      return;
    }

    const payload = JWTUtils.verifyToken(token);
    
    req.user = {
      userId: payload.userId,
      email: payload.email,
      type: payload.type
    };

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

export const mentorOnlyMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
    return;
  }

  if (req.user.type !== 'mentor') {
    res.status(403).json({
      success: false,
      message: 'Mentor access required'
    });
    return;
  }

  next();
};

export const menteeOnlyMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
    return;
  }

  if (req.user.type !== 'mentee') {
    res.status(403).json({
      success: false,
      message: 'Mentee access required'
    });
    return;
  }

  next();
};