export type DeviceType = 'desktop' | 'mobile' | 'tablet';

export interface SessionRecord {
  id: string;
  userId: string;
  sessionToken: string;
  refreshToken: string | null;
  expiresAt: Date;
  ipAddress?: string;
  userAgent?: string;
  deviceType: DeviceType;
  isActive: boolean;
  createdAt: Date;
}

export interface CreateSessionData {
  userId: string;
  sessionToken: string;
  refreshToken?: string | null;
  expiresAt: Date;
  ipAddress?: string;
  userAgent?: string;
  deviceType?: DeviceType;
  isActive?: boolean;
}
