import { v4 as uuidv4 } from 'uuid';
import { dynamodb, TABLES, USER_EMAIL_GSI } from '../../config/dynamodb';
import { User, LoginCredentials, RegisterData, AuthResponse } from '../models/auth.model';
import { PasswordUtils } from '../utils/password.utils';
import { JWTUtils } from '../utils/jwt.utils';
import { PutCommand, QueryCommand, GetCommand } from '@aws-sdk/lib-dynamodb';

export class AuthService {
  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      const passwordValidation = PasswordUtils.validatePassword(userData.password);
      if (!passwordValidation.isValid) {
        return {
          success: false,
          message: `Password validation failed: ${passwordValidation.errors.join(', ')}`
        };
      }

      const existingUser = await this.getUserByEmail(userData.email);
      if (existingUser) {
        return {
          success: false,
          message: 'User already exists with this email'
        };
      }

      const passwordHash = await PasswordUtils.hashPassword(userData.password);
      const userId = uuidv4();
      const now = new Date().toISOString();
      
      const user: User = {
        userId,
        email: userData.email,
        passwordHash,
        type: userData.type,
        name: userData.name,
        createdAt: now,
        updatedAt: now,
        isActive: true
      };

      await dynamodb.send(new PutCommand({
        TableName: TABLES.USERS,
        Item: user,
        ConditionExpression: 'attribute_not_exists(userId)'
      }));

      const token = JWTUtils.generateAccessToken({
        userId: user.userId,
        email: user.email,
        type: user.type
      });

      return {
        success: true,
        token,
        user: {
          userId: user.userId,
          email: user.email,
          name: user.name,
          type: user.type
        },
        message: 'User registered successfully'
      };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: 'Registration failed. Please try again.'
      };
    }
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const user = await this.getUserByEmail(credentials.email);
      if (!user) {
        return {
          success: false,
          message: 'Invalid email or password'
        };
      }

      if (!user.isActive) {
        return {
          success: false,
          message: 'Account is deactivated. Please contact support.'
        };
      }


      const isValidPassword = await PasswordUtils.comparePassword(
        credentials.password,
        user.passwordHash
      );

      if (!isValidPassword) {
        return {
          success: false,
          message: 'Invalid email or password'
        };
      }

      const token = JWTUtils.generateAccessToken({
        userId: user.userId,
        email: user.email,
        type: user.type
      });

      return {
        success: true,
        token,
        user: {
          userId: user.userId,
          email: user.email,
          name: user.name,
          type: user.type
        },
        message: 'Login successful'
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'Login failed. Please try again.'
      };
    }
  }

  async verifyToken(token: string): Promise<AuthResponse> {
    try {
      const payload = JWTUtils.verifyToken(token);
      
      const user = await this.getUserById(payload.userId);
      if (!user || !user.isActive) {
        return {
          success: false,
          message: 'Invalid token or user not found'
        };
      }

      return {
        success: true,
        user: {
          userId: user.userId,
          email: user.email,
          name: user.name,
          type: user.type
        },
        message: 'Token is valid'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Invalid or expired token'
      };
    }
  }

  private async getUserByEmail(email: string): Promise<User | null> {
    try {
      const result = await dynamodb.send(new QueryCommand({
        TableName: TABLES.USERS,
        IndexName: USER_EMAIL_GSI,
        KeyConditionExpression: 'email = :email',
        ExpressionAttributeValues: {
          ':email': email
        },
        Limit: 1
      }));
      return result.Items && result.Items.length > 0 ? (result.Items[0] as User) : null;
    } catch (error) {
      console.error('Error fetching user by email:', error);
      return null;
    }
  }

  private async getUserById(userId: string): Promise<User | null> {
    try {
      const result = await dynamodb.send(new GetCommand({
        TableName: TABLES.USERS,
        Key: { userId }
      }));
      return result.Item ? (result.Item as User) : null;
    } catch (error) {
      console.error('Error fetching user by ID:', error);
      return null;
    }
  }
}