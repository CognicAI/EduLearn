import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
export declare const validateRequest: (schema: Joi.ObjectSchema) => (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
export declare const loginSchema: Joi.ObjectSchema<any>;
export declare const registerSchema: Joi.ObjectSchema<any>;
//# sourceMappingURL=validation.d.ts.map