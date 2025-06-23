export interface JWTPayload {
    userId: string;
    email: string;
    role: 'student' | 'teacher' | 'admin';
}
export declare const generateTokens: (payload: JWTPayload) => {
    accessToken: string;
    refreshToken: string;
};
export declare const verifyAccessToken: (token: string) => JWTPayload;
export declare const verifyRefreshToken: (token: string) => JWTPayload;
//# sourceMappingURL=jwt.d.ts.map