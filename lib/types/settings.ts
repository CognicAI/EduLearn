export interface ProfileData {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  bio?: string;
  website?: string;
  linkedin?: string;
  github?: string;
  skills?: any[];
  interests?: any[];
  academicBackground?: any[];
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  createdAt: string;
  updatedAt: string;
}

export interface NotificationSettings {
  id: string;
  userId: string;
  notificationEmail: boolean;
  notificationPush: boolean;
  notificationSms: boolean;
  theme: 'light' | 'dark' | 'auto';
  languagePreference: string;
  timezonePreference: string;
  dashboardLayout?: any;
  privacySettings?: any;
  createdAt: string;
  updatedAt: string;
}
