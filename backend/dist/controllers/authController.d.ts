import { Request, Response } from 'express';
import { AuthenticatedRequest } from '@/middleware/auth';
export declare class AuthController {
    register(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    login(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getCurrentUser(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    refreshToken(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
export declare const authController: AuthController;
//# sourceMappingURL=authController.d.ts.map