import * as jwt from 'jsonwebtoken';
import { JWTPayload } from '../models/auth.model';

export class JWTUtils {
  private static readonly JWT_SECRET = process.env.JWT_SECRET || 'skillbridge-secret-key-change-in-production';
  private static readonly JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
  private static readonly JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

  static generateAccessToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
    return jwt.sign(
      payload as string | object | Buffer, 
      this.JWT_SECRET as jwt.Secret, 
      {
        expiresIn: this.JWT_EXPIRES_IN,
        issuer: 'skillbridge-auth-service',
        audience: 'skillbridge-platform'
      } as jwt.SignOptions
    );
  }

  static generateRefreshToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
    return jwt.sign(
      payload as string | object | Buffer, 
      this.JWT_SECRET as jwt.Secret, 
      {
        expiresIn: this.JWT_REFRESH_EXPIRES_IN,
        issuer: 'skillbridge-auth-service',
        audience: 'skillbridge-platform'
      } as jwt.SignOptions
    );
  }

  static verifyToken(token: string): JWTPayload {
    try {
      return jwt.verify(
        token, 
        this.JWT_SECRET as jwt.Secret, 
        {
          issuer: 'skillbridge-auth-service',
          audience: 'skillbridge-platform'
        } as jwt.VerifyOptions
      ) as JWTPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Token expired');
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid token');
      } else {
        throw new Error('Token verification failed');
      }
    }
  }

  static extractTokenFromHeader(authHeader: string | undefined): string | null {
    if (!authHeader) {
      return null;
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return null;
    }

    return parts[1] || null;
  }
}