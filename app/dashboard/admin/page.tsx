'use client';

import { useAuth } from '@/lib/auth/auth-context';
import { AuthGuard } from '@/lib/auth/auth-guard';
import { DashboardSidebar } from '@/components/layout/dashboard-sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Users, BookOpenIcon, TrendingUp, AlertTriangle, Settings, UserPlus, Eye } from 'lucide-react';

const mockSystemStats = [
  { label: 'Total Users', value: 1247, change: '+12%', trend: 'up' },
  { label: 'Active Courses', value: 89, change: '+5%', trend: 'up' },
  { label: 'Total Assignments', value: 456, change: '+8%', trend: 'up' },
  { label: 'System Uptime', value: '99.9%', change: 'Stable', trend: 'stable' },
];

const mockUserBreakdown = [
  { role: 'Students', count: 1089, percentage: 87 },
  { role: 'Teachers', count: 142, percentage: 11 },
  { role: 'Admins', count: 16, percentage: 2 },
];

const mockRecentActivity = [
  { type: 'user', title: 'New teacher registration', user: 'Dr. Emily Johnson', time: '2 hours ago' },
  { type: 'course', title: 'Course "AI Fundamentals" created', user: 'Prof. Smith', time: '4 hours ago' },
  { type: 'system', title: 'System backup completed', time: '6 hours ago' },
  { type: 'alert', title: 'High server load detected', time: '8 hours ago' },
];

const mockSystemAlerts = [
  { type: 'warning', title: 'High server load', description: 'CPU usage above 80%', time: '2 hours ago' },
  { type: 'info', title: 'Scheduled maintenance', description: 'Database update tomorrow 2 AM', time: '1 day ago' },
];

export default function AdminDashboard() {
  const { user } = useAuth();

  return (
    <AuthGuard allowedRoles={['admin']}>
      <div className="flex h-screen bg-background">
        <DashboardSidebar />
        
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Admin Dashboard
                </h1>
                <p className="text-muted-foreground mt-2">
                  Monitor and manage the EduLearn platform.
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
                <Button>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add User
                </Button>
              </div>
            </div>

            {/* System Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {mockSystemStats.map((stat, index) => (
                <Card key={index}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                    {stat.label === 'Total Users' && <Users className="h-4 w-4 text-muted-foreground" />}
                    {stat.label === 'Active Courses' && <BookOpenIcon className="h-4 w-4 text-muted-foreground" />}
                    {stat.label === 'Total Assignments' && <TrendingUp className="h-4 w-4 text-muted-foreground" />}
                    {stat.label === 'System Uptime' && <AlertTriangle className="h-4 w-4 text-muted-foreground" />}
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className={`text-xs ${
                      stat.trend === 'up' ? 'text-green-600' : 
                      stat.trend === 'down' ? 'text-red-600' : 
                      'text-muted-foreground'
                    }`}>
                      {stat.change}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* User Analytics */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>User Distribution</CardTitle>
                    <CardDescription>
                      Platform user breakdown by role
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {mockUserBreakdown.map((userType, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">{userType.role}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">{userType.count}</span>
                            <Badge variant="outline">{userType.percentage}%</Badge>
                          </div>
                        </div>
                        <Progress value={userType.percentage} className="h-2" />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Platform Activity</CardTitle>
                    <CardDescription>
                      Latest system and user activities
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {mockRecentActivity.map((activity, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          activity.type === 'alert' ? 'bg-red-500' : 
                          activity.type === 'system' ? 'bg-blue-500' : 
                          'bg-green-500'
                        }`}></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{activity.title}</p>
                          {activity.user && (
                            <p className="text-xs text-muted-foreground">{activity.user}</p>
                          )}
                          <p className="text-xs text-muted-foreground">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                {/* System Alerts */}
                <Card>
                  <CardHeader>
                    <CardTitle>System Alerts</CardTitle>
                    <CardDescription>
                      Important system notifications
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {mockSystemAlerts.map((alert, index) => (
                      <div key={index} className={`p-3 rounded-lg border ${
                        alert.type === 'warning' ? 'bg-orange-50 border-orange-200' : 'bg-blue-50 border-blue-200'
                      }`}>
                        <div className="flex items-start gap-2">
                          <AlertTriangle className={`h-4 w-4 mt-0.5 ${
                            alert.type === 'warning' ? 'text-orange-600' : 'text-blue-600'
                          }`} />
                          <div className="flex-1">
                            <p className="text-sm font-medium">{alert.title}</p>
                            <p className="text-xs text-muted-foreground">{alert.description}</p>
                            <p className="text-xs text-muted-foreground mt-1">{alert.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      <Users className="h-4 w-4 mr-2" />
                      Manage Users
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <BookOpenIcon className="h-4 w-4 mr-2" />
                      Course Overview
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      View Analytics
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Settings className="h-4 w-4 mr-2" />
                      System Settings
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}