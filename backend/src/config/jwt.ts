import jwt, { Secret } from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export interface JWTPayload {
  userId: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
}

export const generateTokens = (payload: JWTPayload) => {
  const accessToken = jwt.sign(
    payload,
    process.env.JWT_SECRET! as Secret,
    { algorithm: 'HS256', expiresIn: process.env.JWT_EXPIRES_IN || '15m' } as any
  );

  const refreshToken = jwt.sign(
    payload,
    process.env.JWT_REFRESH_SECRET! as Secret,
    { algorithm: 'HS256', expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' } as any
  );

  return { accessToken, refreshToken };
}

export const verifyAccessToken = (token: string): JWTPayload => {
  return jwt.verify(token, process.env.JWT_SECRET! as Secret) as JWTPayload;
};

export const verifyRefreshToken = (token: string): JWTPayload => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET! as Secret) as JWTPayload;
};
