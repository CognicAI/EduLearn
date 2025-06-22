'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { AuthGuard } from '@/lib/auth/auth-guard';
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

export default function SettingsPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Profile settings state
  const [profileData, setProfileData] = useState({
    id: user?.id || '',
    userId: user?.id || '',
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    bio: '',
    website: '',
    linkedin: '',
    github: '',
    skills: '',
    interests: '',
    academicBackground: '',
    experienceLevel: 'beginner',
    createdAt: '',
    updatedAt: '',
    timezone: 'UTC',
    language: 'en'
  });

  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    assignmentReminders: true,
    gradeNotifications: true,
    courseUpdates: true,
    systemAnnouncements: true
  });

  // System settings state (admin only)
  const [systemSettings, setSystemSettings] = useState({
    siteName: 'EduLearn',
    siteDescription: 'Advanced Learning Management System',
    maintenanceMode: false,
    registrationEnabled: true,
    maxFileSize: '10',
    sessionTimeout: '30',
    backupFrequency: 'daily'
  });

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveNotifications = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Notification preferences updated!');
    } catch (error) {
      toast.error('Failed to update notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSystem = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('System settings updated!');
    } catch (error) {
      toast.error('Failed to update system settings');
    } finally {
      setIsLoading(false);
    }
  };

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
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          value={profileData.firstName}
                          onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={profileData.lastName}
                          onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        placeholder="Tell us about yourself..."
                        value={profileData.bio}
                        onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                        rows={3}
                      />
                    </div>

                    {/* New profile fields */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="website">Website</Label>
                        <Input
                          id="website"
                          value={profileData.website}
                          onChange={e => setProfileData(prev => ({ ...prev, website: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="linkedin">LinkedIn</Label>
                        <Input
                          id="linkedin"
                          value={profileData.linkedin}
                          onChange={e => setProfileData(prev => ({ ...prev, linkedin: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="github">GitHub</Label>
                        <Input
                          id="github"
                          value={profileData.github}
                          onChange={e => setProfileData(prev => ({ ...prev, github: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="experienceLevel">Experience Level</Label>
                        <Select
                          value={profileData.experienceLevel}
                          onValueChange={val => setProfileData(prev => ({ ...prev, experienceLevel: val }))}
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
                        value={profileData.skills}
                        onChange={e => setProfileData(prev => ({ ...prev, skills: e.target.value }))}
                      />
                      <Label htmlFor="interests">Interests (comma-separated)</Label>
                      <Textarea
                        id="interests"
                        rows={2}
                        value={profileData.interests}
                        onChange={e => setProfileData(prev => ({ ...prev, interests: e.target.value }))}
                      />
                      <Label htmlFor="academicBackground">Academic Background</Label>
                      <Textarea
                        id="academicBackground"
                        rows={2}
                        value={profileData.academicBackground}
                        onChange={e => setProfileData(prev => ({ ...prev, academicBackground: e.target.value }))}
                      />
                    </div>

                    {/* Existing Timezone & Language grid */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="timezone">Timezone</Label>
                        <Select value={profileData.timezone} onValueChange={(value) => setProfileData(prev => ({ ...prev, timezone: value }))}>
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
                        <Select value={profileData.language} onValueChange={(value) => setProfileData(prev => ({ ...prev, language: value }))}>
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
                        <Input value={profileData.createdAt} disabled />
                      </div>
                      <div className="space-y-2">
                        <Label>Updated At</Label>
                        <Input value={profileData.updatedAt} disabled />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button onClick={handleSaveProfile} disabled={isLoading}>
                        {isLoading ? (
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
                          checked={notificationSettings.emailNotifications}
                          onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, emailNotifications: checked }))}
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
                          checked={notificationSettings.pushNotifications}
                          onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, pushNotifications: checked }))}
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
                          checked={notificationSettings.assignmentReminders}
                          onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, assignmentReminders: checked }))}
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
                          checked={notificationSettings.gradeNotifications}
                          onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, gradeNotifications: checked }))}
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
                          checked={notificationSettings.courseUpdates}
                          onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, courseUpdates: checked }))}
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
                          checked={notificationSettings.systemAnnouncements}
                          onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, systemAnnouncements: checked }))}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button onClick={handleSaveNotifications} disabled={isLoading}>
                        {isLoading ? (
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
                          <Input id="currentPassword" type="password" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="newPassword">New Password</Label>
                          <Input id="newPassword" type="password" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword">Confirm New Password</Label>
                          <Input id="confirmPassword" type="password" />
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <Button>
                          <Shield className="h-4 w-4 mr-2" />
                          Update Password
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
                              onChange={(e) => setSystemSettings(prev => ({ ...prev, siteName: e.target.value }))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="maxFileSize">Max File Size (MB)</Label>
                            <Input
                              id="maxFileSize"
                              type="number"
                              value={systemSettings.maxFileSize}
                              onChange={(e) => setSystemSettings(prev => ({ ...prev, maxFileSize: e.target.value }))}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="siteDescription">Site Description</Label>
                          <Textarea
                            id="siteDescription"
                            value={systemSettings.siteDescription}
                            onChange={(e) => setSystemSettings(prev => ({ ...prev, siteDescription: e.target.value }))}
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
                              onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, maintenanceMode: checked }))}
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
                              onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, registrationEnabled: checked }))}
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
                              onChange={(e) => setSystemSettings(prev => ({ ...prev, sessionTimeout: e.target.value }))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="backupFrequency">Backup Frequency</Label>
                            <Select value={systemSettings.backupFrequency} onValueChange={(value) => setSystemSettings(prev => ({ ...prev, backupFrequency: value }))}>
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