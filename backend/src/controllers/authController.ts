import { Request, Response } from 'express';
import { userService } from '../services/userService';
import { generateTokens } from '../config/jwt';
import { LoginCredentials, CreateUserData } from '../types/user';
import { AuthenticatedRequest } from '../middleware/auth';
import { query } from '../config/db';
import { activityLogService } from '../services/activityLogService';
import jwt from 'jsonwebtoken';
import { sessionService } from '../services/sessionService';
import { verifyRefreshToken } from '../config/jwt';
import { classifyLearningStyle } from '../services/visionovaService';

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const userData: CreateUserData = req.body;
      const { assessmentAnswers } = userData;

      // Create user with default learning style
      const user = await userService.createUser(userData);
      const tokens = generateTokens({
        userId: user.id,
        email: user.email,
        role: user.role
      });

      // Log registration activity
      await activityLogService.logActivity({
        userId: user.id,
        activityType: 'profile_update',
        description: 'New user registered',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent') || undefined
      });

      // Send immediate response to user
      const response = {
        success: true,
        message: 'User registered successfully',
        data: {
          user,
          tokens
        }
      };

      // Respond immediately - don't wait for ML classification
      res.status(201).json(response);

      // Background processing: Classify learning style if assessment answers provided
      if (assessmentAnswers && Array.isArray(assessmentAnswers) && assessmentAnswers.length === 15) {
        // Run classification asynchronously (don't await)
        classifyLearningStyle(assessmentAnswers)
          .then(async (learningStyle) => {
            await userService.updateLearningStyle(user.id, learningStyle);
            console.log(`[Auth] Learning style updated for user ${user.id}: ${learningStyle}`);
          })
          .catch((error) => {
            console.error(`[Auth] Failed to update learning style for user ${user.id}:`, error);
            // Silently fail - user is already created and logged in
          });
      } else {
        console.log(`[Auth] No assessment answers provided for user ${user.id}, using default learning style`);
      }

      // Return to satisfy TypeScript (response already sent)
      return;
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
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }

      const isValidPassword = await userService.validatePassword(password, user.passwordHash);
      if (!isValidPassword) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }

      // Do not allow inactive users to login
      if (!user.isActive) {
        return res.status(403).json({ success: false, message: 'Account is inactive' });
      }

      // Increment login count
      await userService.incrementLoginCount(user.id);

      // Update last login
      await userService.updateLastLogin(user.id);
      // Log login activity
      await activityLogService.logActivity({
        userId: user.id,
        activityType: 'login',
        description: 'User logged in',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent') || undefined
      });

      const tokens = generateTokens({
        userId: user.id,
        email: user.email,
        role: user.role
      });

      // Create a new session record
      const userAgent = req.get('User-Agent') || '';
      const deviceType = /mobile/i.test(userAgent) ? 'mobile' : /tablet/i.test(userAgent) ? 'tablet' : 'desktop';
      const decodedAccess: any = jwt.decode(tokens.accessToken) as any;
      const expiresAt = new Date(decodedAccess.exp * 1000);
      await sessionService.createSession({
        userId: user.id,
        sessionToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresAt,
        ipAddress: req.ip,
        userAgent,
        deviceType
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
        return res.status(401).json({ success: false, message: 'Refresh token required' });
      }

      // Verify refresh token
      let payload;
      try {
        payload = verifyRefreshToken(refreshToken);
      } catch (err) {
        return res.status(403).json({ success: false, message: 'Invalid or expired refresh token' });
      }

      // Validate session exists and is active
      const session = await sessionService.getSessionByRefreshToken(refreshToken);
      if (!session) {
        return res.status(401).json({ success: false, message: 'Session not found or inactive' });
      }

      // Generate new tokens
      const tokens = generateTokens({
        userId: payload.userId,
        email: payload.email,
        role: payload.role
      });

      // Update session with new tokens and expiry
      const decodedNew: any = jwt.decode(tokens.accessToken) as any;
      const newExpiresAt = new Date(decodedNew.exp * 1000);
      await sessionService.updateSession(session.id, tokens.accessToken, tokens.refreshToken, newExpiresAt);

      return res.json({ success: true, data: { tokens } });
    } catch (error) {
      console.error('Token refresh error:', error);
      return res.status(401).json({ success: false, message: 'Invalid refresh token' });
    }
  }

  // POST /api/auth/logout
  async logout(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const bearer = req.headers.authorization;
      const token = bearer && bearer.startsWith('Bearer ') ? bearer.split(' ')[1] : undefined;
      if (token) {
        // Invalidate session record
        await sessionService.deleteSessionByToken(token);
      }
      // Log logout activity
      await activityLogService.logActivity({
        userId,
        activityType: 'logout',
        description: 'User logged out',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent') || undefined
      });
      return res.json({ success: true, message: 'Logout successful' });
    } catch (error) {
      console.error('Logout error:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
}

export const authController = new AuthController();
