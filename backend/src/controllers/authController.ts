import { Request, Response } from 'express';
import { userService } from '@/services/userService';
import { generateTokens } from '@/config/jwt';
import { LoginCredentials, CreateUserData } from '@/types/user';
import { AuthenticatedRequest } from '@/middleware/auth';

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const userData: CreateUserData = req.body;
      
      const user = await userService.createUser(userData);
      const tokens = generateTokens({
        userId: user.id,
        email: user.email,
        role: user.role
      });

      return res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user,
          tokens
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      
      if (error instanceof Error) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password }: LoginCredentials = req.body;
      
      const user = await userService.findUserByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      const isValidPassword = await userService.validatePassword(password, user.passwordHash);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Update last login
      await userService.updateLastLogin(user.id);

      const tokens = generateTokens({
        userId: user.id,
        email: user.email,
        role: user.role
      });

      const userResponse = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatar: user.avatar,
        createdAt: user.createdAt.toISOString(),
        lastLogin: new Date().toISOString()
      };

      return res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: userResponse,
          tokens
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  async getCurrentUser(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      const user = await userService.findUserById(req.user.userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      return res.json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error('Get current user error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  async refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          message: 'Refresh token required'
        });
      }

      // In a production app, you'd verify the refresh token and check if it's still valid
      // For now, we'll implement a basic version
      const tokens = generateTokens({
        userId: req.body.userId,
        email: req.body.email,
        role: req.body.role
      });

      return res.json({
        success: true,
        data: { tokens }
      });
    } catch (error) {
      console.error('Token refresh error:', error);
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }
  }
}

export const authController = new AuthController();