import { Request, Response, NextFunction } from 'express';
import { JWTPayload } from '@/config/jwt';
export interface AuthenticatedRequest extends Request {
    user?: JWTPayload;
}
export declare const authenticateToken: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
export declare const requireRole: (roles: string[]) => (req: AuthenticatedRequest, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
//# sourceMappingURL=auth.d.ts.map