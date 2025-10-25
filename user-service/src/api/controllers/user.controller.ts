import { Request, Response } from 'express';
import { UserService } from '../../core/services/user.service';
import Joi from 'joi';

const userService = new UserService();


const createUserSchema = Joi.object({
  email: Joi.string().email().required(),
  name: Joi.string().min(2).max(100).required(),
  type: Joi.string().valid('mentor', 'mentee').required(),
  domain: Joi.string().valid('backend', 'frontend', 'devops', 'data', 'mobile', 'fullstack').optional(),
  seniority: Joi.string().valid('junior', 'mid', 'senior', 'staff', 'principal').optional(),
  bio: Joi.string().max(500).optional(),
  skills: Joi.array().items(Joi.string()).optional(),
  hourlyRate: Joi.number().min(0).optional(),
  timezone: Joi.string().optional()
});

const updateUserSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  domain: Joi.string().valid('backend', 'frontend', 'devops', 'data', 'mobile', 'fullstack').optional(),
  seniority: Joi.string().valid('junior', 'mid', 'senior', 'staff', 'principal').optional(),
  bio: Joi.string().max(500).optional(),
  skills: Joi.array().items(Joi.string()).optional(),
  hourlyRate: Joi.number().min(0).optional(),
  profilePicture: Joi.string().uri().optional(),
  linkedinProfile: Joi.string().uri().optional(),
  githubProfile: Joi.string().uri().optional()
});

export class UserController {
  /**
   * Create new user profile
   * POST /users
   */
  async createUser(req: Request, res: Response): Promise<void> {
    try {
      const { error, value } = createUserSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map((detail: any) => detail.message)
        });
        return;
      }

      const result = await userService.createUser(value);
      
      if (result.success) {
        res.status(201).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * Get user by ID
   * GET /users/:id
   */
  async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      if (!id) {
        res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
        return;
      }
      
      const user = await userService.getUserById(id);
      
      if (user) {
        res.status(200).json({
          success: true,
          user
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * Update user profile
   * PUT /users/:id
   */
  async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      if (!id) {
        res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
        return;
      }
      

      if (req.user && req.user.userId !== id) {
        res.status(403).json({
          success: false,
          message: 'You can only update your own profile'
        });
        return;
      }

      const { error, value } = updateUserSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map((detail: any) => detail.message)
        });
        return;
      }

      const result = await userService.updateUser(id, value);
      
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * Search users
   * GET /users/search
   */
  async searchUsers(req: Request, res: Response): Promise<void> {
    try {
      const {
        type,
        domain,
        skills,
        seniority,
        minRating,
        maxHourlyRate,
        page,
        limit
      } = req.query;

      const searchParams = {
        type: type as 'mentor' | 'mentee' | undefined,
        domain: domain as string | undefined,
        skills: skills ? (skills as string).split(',') : undefined,
        seniority: seniority as string | undefined,
        minRating: minRating ? parseFloat(minRating as string) : undefined,
        maxHourlyRate: maxHourlyRate ? parseFloat(maxHourlyRate as string) : undefined,
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 10
      };

      const result = await userService.searchUsers(searchParams);
      
      res.status(200).json({
        success: true,
        ...result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * Health check
   * GET /users/health
   */
  async healthCheck(req: Request, res: Response): Promise<void> {
    res.status(200).json({
      success: true,
      message: 'User service is running',
      timestamp: new Date().toISOString(),
      service: 'user-service',
      version: '1.0.0'
    });
  }
}


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