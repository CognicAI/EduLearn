import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, JWTPayload } from '../config/jwt';
import { sessionService } from '../services/sessionService';

export interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
}

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access token required' });
  }

  try {
    const decoded = verifyAccessToken(token);
    // Ensure session exists and is active
    const session = await sessionService.getSessionByToken(token);
    if (!session) {
      return res.status(401).json({ success: false, message: 'Session not found or expired' });
    }
    req.user = decoded;
    return next();
  } catch (error) {
    return res.status(403).json({ success: false, message: 'Invalid or expired token' });
  }
};

export const requireRole = (roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Insufficient permissions' 
      });
    }

    return next();
  };
};
