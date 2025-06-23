'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { AuthGuard } from '@/lib/auth/auth-guard';
import { fetchUserProfile, updateUserProfile, fetchUserSettings, updateUserSettings, updateUserPassword } from '@/lib/services/settingsService';
import type { ProfileData, NotificationSettings } from '@/lib/types/settings';
import { DashboardSidebar } from '@/components/layout/dashboard-sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Database, 
  Mail, 
  Globe, 
  Palette,
  Save,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';

// Extended interface for ProfileData with UI-specific fields
interface ExtendedProfileData extends Omit<ProfileData, 'skills' | 'interests' | 'academicBackground'> {
  email: string;
  timezone: string;
  language: string;
  skills: string;
  interests: string;
  academicBackground: string;
}

// Extended interface for NotificationSettings with UI-specific fields
interface ExtendedNotificationSettings extends NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  assignmentReminders: boolean;
  gradeNotifications: boolean;
  courseUpdates: boolean;
  systemAnnouncements: boolean;
}

// System Settings interface
interface SystemSettings {
  siteName: string;
  siteDescription: string;
  maxFileSize: string;
  maintenanceMode: boolean;
  registrationEnabled: boolean;
  sessionTimeout: string;
  backupFrequency: string;
}

export default function SettingsPage() {
  const { user } = useAuth();
  // Profile settings state
  const [profileData, setProfileData] = useState<ExtendedProfileData | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState<ExtendedNotificationSettings | null>(null);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(true);
  const [isSavingNotifications, setIsSavingNotifications] = useState(false);
  
  // System settings state (admin only)
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    siteName: 'EduLearn Bolt',
    siteDescription: 'An advanced learning management system',
    maxFileSize: '10',
    maintenanceMode: false,
    registrationEnabled: true,
    sessionTimeout: '60',
    backupFrequency: 'daily'
  });
  const [isLoading, setIsLoading] = useState(false);  
  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  // Safe update function that handles null checks
  const safeProfileUpdate = (prev: ExtendedProfileData | null, updates: Partial<ExtendedProfileData>): ExtendedProfileData => {
    if (!prev) {
      // If prev is null, create a default object with required fields
      return {
        id: '',
        userId: '',
        firstName: '',
        lastName: '',
        experienceLevel: 'beginner',
        email: '',
        timezone: '',
        language: '',
        skills: '',
        interests: '',
        academicBackground: '',
        createdAt: '',
        updatedAt: '',
        ...updates
      };
    }
    return { ...prev, ...updates };
  };
  
  // Safe update function for notification settings
  const safeNotificationUpdate = (prev: ExtendedNotificationSettings | null, updates: Partial<ExtendedNotificationSettings>): ExtendedNotificationSettings => {
    if (!prev) {
      // If prev is null, create a default object with required fields
      return {
        id: '',
        userId: '',
        notificationEmail: false,
        notificationPush: false,
        notificationSms: false,
        theme: 'light',
        languagePreference: 'en',
        timezonePreference: 'UTC',
        emailNotifications: false,
        pushNotifications: false,
        assignmentReminders: false,
        gradeNotifications: false,
        courseUpdates: false,
        systemAnnouncements: false,
        createdAt: '',
        updatedAt: '',
        ...updates
      };
    }
    return { ...prev, ...updates };
  };

  // Load profile and settings from backend
  useEffect(() => {
    fetchUserProfile()
      .then(data => {
        // Transform to ExtendedProfileData
        const extendedData: ExtendedProfileData = {
          ...data,
          email: user?.email || '',
          timezone: 'UTC',
          language: 'en',
          skills: Array.isArray(data.skills) ? data.skills.join(', ') : '',
          interests: Array.isArray(data.interests) ? data.interests.join(', ') : '',
          academicBackground: Array.isArray(data.academicBackground) ? data.academicBackground.join(', ') : ''
        };
        setProfileData(extendedData);
      })
      .catch(err => toast.error(err.message))
      .finally(() => setIsLoadingProfile(false));
      
    fetchUserSettings()
      .then(data => {
        // Transform to ExtendedNotificationSettings
        const extendedSettings: ExtendedNotificationSettings = {
          ...data,
          emailNotifications: data.notificationEmail,
          pushNotifications: data.notificationPush,
          assignmentReminders: true, // Default values
          gradeNotifications: true,
          courseUpdates: true,
          systemAnnouncements: true
        };
        setNotificationSettings(extendedSettings);
      })
      .catch(err => toast.error(err.message))
      .finally(() => setIsLoadingNotifications(false));
  }, [user?.email]);
  const handleSaveProfile = async () => {
    if (!profileData) return;
    setIsSavingProfile(true);
    try {
      // Transform back to ProfileData
      const apiProfileData: ProfileData = {
        ...profileData,
        skills: profileData.skills ? profileData.skills.split(',').map(item => item.trim()) : [],
        interests: profileData.interests ? profileData.interests.split(',').map(item => item.trim()) : [],
        academicBackground: profileData.academicBackground ? profileData.academicBackground.split(',').map(item => item.trim()) : []
      };
      
      await updateUserProfile(apiProfileData);
      toast.success('Profile updated successfully!');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSavingProfile(false);
    }
  };  const handleSaveNotifications = async () => {
    if (!notificationSettings) return;
    setIsSavingNotifications(true);
    try {
      // Transform back to NotificationSettings
      const apiNotificationSettings: NotificationSettings = {
        ...notificationSettings,
        notificationEmail: notificationSettings.emailNotifications,
        notificationPush: notificationSettings.pushNotifications,
        // Keep the existing values for fields not in our form
      };
      
      await updateUserSettings(apiNotificationSettings);
      toast.success('Notification preferences updated!');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSavingNotifications(false);
    }
  };
  
  // System settings save handler
  const handleSaveSystem = async () => {
    setIsLoading(true);
    try {
      // Here you would implement API call to save system settings
      // For now, we'll just simulate a successful save
      setTimeout(() => {
        toast.success('System settings updated successfully!');
        setIsLoading(false);
      }, 1000);
    } catch (err: any) {
      toast.error(err.message);
      setIsLoading(false);
    }
  };
  
  // Password change handler
  const handleChangePassword = async () => {
    if (newPasswordInput !== confirmPasswordInput) {
      toast.error('New passwords do not match');
      return;
    }
    setIsChangingPassword(true);
    try {
      await updateUserPassword({ currentPassword, newPassword: newPasswordInput });
      toast.success('Password updated successfully!');
      setCurrentPassword(''); setNewPasswordInput(''); setConfirmPasswordInput('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Wait until profileData is loaded before rendering
  if (isLoadingProfile || !profileData) {
    return (
      <AuthGuard>
        <div className="p-8 text-center">Loading profile...</div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="flex h-screen bg-background">
        <DashboardSidebar />
        
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Settings className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Settings</h1>
                <p className="text-muted-foreground">
                  Manage your account preferences and system configuration
                </p>
              </div>
            </div>

            <Tabs defaultValue="profile" className="space-y-6">
              <TabsList className={user?.role === 'admin' ? 'grid w-full grid-cols-4' : 'grid w-full grid-cols-3'}>
                <TabsTrigger value="profile" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Profile
                </TabsTrigger>
                <TabsTrigger value="notifications" className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Notifications
                </TabsTrigger>
                <TabsTrigger value="security" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Security
                </TabsTrigger>
                {user?.role === 'admin' && (
                  <TabsTrigger value="system" className="flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    System
                  </TabsTrigger>
                )}
              </TabsList>

              {/* Profile Settings */}
              <TabsContent value="profile">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>
                      Update your personal information and preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>                        <Input
                          id="firstName"
                          value={profileData?.firstName}
                          onChange={(e) => setProfileData(prev => safeProfileUpdate(prev, { firstName: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>                        <Input
                          id="lastName"
                          value={profileData?.lastName}
                          onChange={(e) => setProfileData(prev => safeProfileUpdate(prev, { lastName: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>                        <Input
                          id="email"
                          type="email"
                          value={profileData?.email}
                          onChange={(e) => setProfileData(prev => safeProfileUpdate(prev, { email: e.target.value }))}
                        />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>                        <Textarea
                          id="bio"
                          placeholder="Tell us about yourself..."
                          value={profileData?.bio}
                          onChange={(e) => setProfileData(prev => safeProfileUpdate(prev, { bio: e.target.value }))}
                          rows={3}
                        />
                    </div>

                    {/* New profile fields */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="website">Website</Label>                          <Input
                            id="website"
                            value={profileData?.website}
                            onChange={e => setProfileData(prev => safeProfileUpdate(prev, { website: e.target.value }))}
                          />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="linkedin">LinkedIn</Label>                          <Input
                            id="linkedin"
                            value={profileData?.linkedin}
                            onChange={e => setProfileData(prev => safeProfileUpdate(prev, { linkedin: e.target.value }))}
                          />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="github">GitHub</Label>                          <Input
                            id="github"
                            value={profileData?.github}
                            onChange={e => setProfileData(prev => safeProfileUpdate(prev, { github: e.target.value }))}
                          />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="experienceLevel">Experience Level</Label>
                        <Select
                          value={profileData?.experienceLevel}
                          onValueChange={val => setProfileData(prev => safeProfileUpdate(prev, { experienceLevel: val as 'beginner' | 'intermediate' | 'advanced' }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="beginner">Beginner</SelectItem>
                            <SelectItem value="intermediate">Intermediate</SelectItem>
                            <SelectItem value="advanced">Advanced</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <Label htmlFor="skills">Skills (comma-separated)</Label>
                      <Textarea
                        id="skills"
                        rows={2}
                        value={profileData?.skills}                          onChange={e => setProfileData(prev => safeProfileUpdate(prev, { skills: e.target.value }))}
                      />
                      <Label htmlFor="interests">Interests (comma-separated)</Label>
                      <Textarea
                        id="interests"
                        rows={2}
                        value={profileData?.interests}                          onChange={e => setProfileData(prev => safeProfileUpdate(prev, { interests: e.target.value }))}
                      />
                      <Label htmlFor="academicBackground">Academic Background</Label>
                      <Textarea
                        id="academicBackground"
                        rows={2}
                        value={profileData?.academicBackground}                          onChange={e => setProfileData(prev => safeProfileUpdate(prev, { academicBackground: e.target.value }))}
                      />
                    </div>

                    {/* Existing Timezone & Language grid */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="timezone">Timezone</Label>
                        <Select value={profileData?.timezone} onValueChange={(value) => setProfileData(prev => safeProfileUpdate(prev, { timezone: value }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="UTC">UTC</SelectItem>
                            <SelectItem value="EST">Eastern Time</SelectItem>
                            <SelectItem value="PST">Pacific Time</SelectItem>
                            <SelectItem value="GMT">Greenwich Mean Time</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="language">Language</Label>
                        <Select value={profileData?.language} onValueChange={(value) => setProfileData(prev => safeProfileUpdate(prev, { language: value }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="es">Spanish</SelectItem>
                            <SelectItem value="fr">French</SelectItem>
                            <SelectItem value="de">German</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Timestamps (read-only) */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Created At</Label>
                        <Input value={profileData?.createdAt} disabled />
                      </div>
                      <div className="space-y-2">
                        <Label>Updated At</Label>
                        <Input value={profileData?.updatedAt} disabled />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button onClick={handleSaveProfile} disabled={isSavingProfile}>
                        {isSavingProfile ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Notification Settings */}
              <TabsContent value="notifications">
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                    <CardDescription>
                      Choose how you want to be notified about important events
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Email Notifications</Label>
                          <p className="text-sm text-muted-foreground">
                            Receive notifications via email
                          </p>
                        </div>
                        <Switch
                          checked={notificationSettings?.emailNotifications}
                          onCheckedChange={(checked) => setNotificationSettings(prev => safeNotificationUpdate(prev, { emailNotifications: checked }))}
                        />
                      </div>

                      <Separator />

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Push Notifications</Label>
                          <p className="text-sm text-muted-foreground">
                            Receive push notifications in your browser
                          </p>
                        </div>
                        <Switch
                          checked={notificationSettings?.pushNotifications}
                          onCheckedChange={(checked) => setNotificationSettings(prev => safeNotificationUpdate(prev, { pushNotifications: checked }))}
                        />
                      </div>

                      <Separator />

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Assignment Reminders</Label>
                          <p className="text-sm text-muted-foreground">
                            Get reminded about upcoming assignment deadlines
                          </p>
                        </div>
                        <Switch
                          checked={notificationSettings?.assignmentReminders}
                          onCheckedChange={(checked) => setNotificationSettings(prev => safeNotificationUpdate(prev, { assignmentReminders: checked }))}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Grade Notifications</Label>
                          <p className="text-sm text-muted-foreground">
                            Be notified when grades are posted
                          </p>
                        </div>
                        <Switch
                          checked={notificationSettings?.gradeNotifications}
                          onCheckedChange={(checked) => setNotificationSettings(prev => safeNotificationUpdate(prev, { gradeNotifications: checked }))}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Course Updates</Label>
                          <p className="text-sm text-muted-foreground">
                            Receive updates about course content and announcements
                          </p>
                        </div>
                        <Switch
                          checked={notificationSettings?.courseUpdates}
                          onCheckedChange={(checked) => setNotificationSettings(prev => safeNotificationUpdate(prev, { courseUpdates: checked }))}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>System Announcements</Label>
                          <p className="text-sm text-muted-foreground">
                            Important system-wide announcements and maintenance notices
                          </p>
                        </div>
                        <Switch
                          checked={notificationSettings?.systemAnnouncements}
                          onCheckedChange={(checked) => setNotificationSettings(prev => safeNotificationUpdate(prev, { systemAnnouncements: checked }))}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button onClick={handleSaveNotifications} disabled={isSavingNotifications}>
                        {isSavingNotifications ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Save Preferences
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Security Settings */}
              <TabsContent value="security">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Password & Security</CardTitle>
                      <CardDescription>
                        Manage your account security settings
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="currentPassword">Current Password</Label>
                          <Input id="currentPassword" type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="newPassword">New Password</Label>
                          <Input id="newPassword" type="password" value={newPasswordInput} onChange={e => setNewPasswordInput(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword">Confirm New Password</Label>
                          <Input id="confirmPassword" type="password" value={confirmPasswordInput} onChange={e => setConfirmPasswordInput(e.target.value)} />
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <Button onClick={handleChangePassword} disabled={isChangingPassword || !currentPassword || !newPasswordInput || newPasswordInput !== confirmPasswordInput}>
                          {isChangingPassword ? (
                            <>
                              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                              Changing...
                            </>
                          ) : (
                            <>
                              <Shield className="h-4 w-4 mr-2" />
                              Change Password
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Two-Factor Authentication</CardTitle>
                      <CardDescription>
                        Add an extra layer of security to your account
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Two-Factor Authentication</p>
                          <p className="text-sm text-muted-foreground">
                            Secure your account with 2FA
                          </p>
                        </div>
                        <Badge variant="outline">Not Enabled</Badge>
                      </div>
                      <div className="mt-4">
                        <Button variant="outline">
                          Enable 2FA
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* System Settings (Admin Only) */}
              {user?.role === 'admin' && (
                <TabsContent value="system">
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>General System Settings</CardTitle>
                        <CardDescription>
                          Configure platform-wide settings
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="siteName">Site Name</Label>
                            <Input
                              id="siteName"
                              value={systemSettings.siteName}
                              onChange={(e) => setSystemSettings({ ...systemSettings, siteName: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="maxFileSize">Max File Size (MB)</Label>
                            <Input
                              id="maxFileSize"
                              type="number"
                              value={systemSettings.maxFileSize}
                              onChange={(e) => setSystemSettings({ ...systemSettings, maxFileSize: e.target.value })}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="siteDescription">Site Description</Label>
                          <Textarea
                            id="siteDescription"
                            value={systemSettings.siteDescription}
                            onChange={(e) => setSystemSettings({ ...systemSettings, siteDescription: e.target.value })}
                            rows={2}
                          />
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label>Maintenance Mode</Label>
                              <p className="text-sm text-muted-foreground">
                                Put the system in maintenance mode
                              </p>
                            </div>
                            <Switch
                              checked={systemSettings.maintenanceMode}
                              onCheckedChange={(checked) => setSystemSettings({ ...systemSettings, maintenanceMode: checked })}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label>User Registration</Label>
                              <p className="text-sm text-muted-foreground">
                                Allow new users to register
                              </p>
                            </div>
                            <Switch
                              checked={systemSettings.registrationEnabled}
                              onCheckedChange={(checked) => setSystemSettings({ ...systemSettings, registrationEnabled: checked })}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                            <Input
                              id="sessionTimeout"
                              type="number"
                              value={systemSettings.sessionTimeout}
                              onChange={(e) => setSystemSettings({ ...systemSettings, sessionTimeout: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="backupFrequency">Backup Frequency</Label>
                            <Select value={systemSettings.backupFrequency} onValueChange={(value) => setSystemSettings({ ...systemSettings, backupFrequency: value })}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="hourly">Hourly</SelectItem>
                                <SelectItem value="daily">Daily</SelectItem>
                                <SelectItem value="weekly">Weekly</SelectItem>
                                <SelectItem value="monthly">Monthly</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <Button onClick={handleSaveSystem} disabled={isLoading}>
                            {isLoading ? (
                              <>
                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                Saving...
                              </>
                            ) : (
                              <>
                                <Save className="h-4 w-4 mr-2" />
                                Save System Settings
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-orange-500" />
                          Danger Zone
                        </CardTitle>
                        <CardDescription>
                          Irreversible and destructive actions
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="p-4 border border-destructive/20 rounded-lg">
                          <h4 className="font-medium text-destructive mb-2">Reset All User Data</h4>
                          <p className="text-sm text-muted-foreground mb-4">
                            This will permanently delete all user accounts, courses, and data. This action cannot be undone.
                          </p>
                          <Button variant="destructive" size="sm">
                            Reset Platform
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              )}
            </Tabs>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}