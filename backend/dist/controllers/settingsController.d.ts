import { Response } from 'express';
import { AuthenticatedRequest } from '@/middleware/auth';
export declare class SettingsController {
    getProfile(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    updateProfile(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    getSettings(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    updateSettings(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    getSessions(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    getActivity(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    updatePassword(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
}
export declare const settingsController: SettingsController;
//# sourceMappingURL=settingsController.d.ts.map