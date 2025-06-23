import { Response } from 'express';
import { AuthenticatedRequest } from '@/middleware/auth';
export declare class AdminController {
    getUsers(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
}
export declare const adminController: AdminController;
//# sourceMappingURL=adminController.d.ts.map