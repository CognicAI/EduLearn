'use client';

import { useAuth } from '@/lib/auth/auth-context';
import { AuthGuard } from '@/lib/auth/auth-guard';
import { DashboardSidebar } from '@/components/layout/dashboard-sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, BookOpenIcon, TrendingUp, AlertTriangle, Settings, UserPlus, CheckCircle, Info } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const mockUserBreakdown = [
  { role: 'Students', count: 1089, percentage: 87 },
  { role: 'Teachers', count: 142, percentage: 11 },
  { role: 'Admins', count: 16, percentage: 2 },
];

function DashboardSkeleton() {
  return (
    <div className="p-6 space-y-8">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}


export default function AdminDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [platformData, setPlatformData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlatformStats = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/analytics/platform`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setPlatformData(data.data);
        }
      } catch (error) {
        console.error('Error fetching platform stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlatformStats();
  }, []);

  const handleNavigation = (path: string) => {
    router.push(path);
  };



  return (
    <AuthGuard allowedRoles={['admin']}>
      <div className="flex h-screen bg-background">
        <DashboardSidebar />

        <main className="flex-1 overflow-y-auto">
          {loading ? (
            <DashboardSkeleton />
          ) : (
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
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{platformData?.stats.totalUsers || 0}</div>
                    <p className="text-xs text-muted-foreground">+{platformData?.stats.newUsers30d || 0} this month</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
                    <BookOpenIcon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{platformData?.stats.activeCourses || 0}</div>
                    <p className="text-xs text-muted-foreground">{platformData?.stats.totalCourses || 0} total</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{platformData?.stats.totalEnrollments || 0}</div>
                    <p className="text-xs text-muted-foreground">{platformData?.stats.activeEnrollments || 0} active</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{platformData?.stats.systemUptime || '99.9%'}</div>
                    <p className="text-xs text-muted-foreground">Stable</p>
                  </CardContent>
                </Card>
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
                    <CardContent>
                      <ScrollArea className="h-[210px] pr-4">
                        <div className="space-y-4">
                          {platformData?.recentActivity?.map((activity: any) => (
                            <div key={activity.id} className="flex items-start space-x-3">
                              <div className={`w-2 h-2 rounded-full mt-2 ${activity.type === 'alert' ? 'bg-red-500' :
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
                          )) || (
                              <div className="text-center py-4">
                                <p className="text-sm text-muted-foreground">No recent activity.</p>
                              </div>
                            )}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-6">
                  {/* System Alerts */}
                  <Card className="card-enhanced overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-background to-accent/5 border-b border-border/50">
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                            <AlertTriangle className="h-4 w-4 text-primary" />
                          </div>
                          System Alerts
                        </div>
                        {platformData?.systemAlerts && platformData.systemAlerts.length > 0 && (
                          <Badge variant="outline" className="ml-2">
                            {platformData.systemAlerts.length}
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription>
                        Monitor critical system notifications and warnings
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                      {platformData?.systemAlerts && platformData.systemAlerts.length > 0 ? (
                        <ScrollArea className="h-[400px]">
                          <div className="divide-y divide-border/50">
                            {platformData.systemAlerts.map((alert: any, index: number) => (
                              <div key={index} className="p-4 hover:bg-accent/30 transition-all duration-200 group relative">
                                {/* Priority indicator */}
                                <div className={`absolute left-0 top-0 bottom-0 w-1 ${alert.priority === 'high' ? 'bg-destructive' :
                                  alert.priority === 'medium' ? 'bg-warning' : 'bg-muted'
                                  }`}></div>
                                <div className="flex items-start gap-3 ml-3">
                                  <div className="flex-shrink-0 mt-1">
                                    <Badge
                                      variant={
                                        alert.type === 'warning' ? 'warning' :
                                          alert.type === 'success' ? 'success' : 'info'
                                      }
                                      className="shadow-sm group-hover:shadow-md transition-shadow duration-200"
                                    >
                                      {alert.type === 'warning' ? (
                                        <AlertTriangle className="h-3 w-3 mr-1" />
                                      ) : alert.type === 'success' ? (
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                      ) : (
                                        <Info className="h-3 w-3 mr-1" />
                                      )}
                                      {alert.type === 'warning' ? 'Warning' :
                                        alert.type === 'success' ? 'Success' : 'Info'}
                                    </Badge>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2 mb-1">
                                      <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors duration-200">
                                        {alert.title}
                                      </p>
                                      <span className="text-xs text-muted-foreground/80 font-medium bg-muted/50 px-2 py-1 rounded-md whitespace-nowrap">
                                        {alert.time}
                                      </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                                      {alert.description}
                                    </p>
                                    {alert.type === 'warning' && (
                                      <div className="flex items-center gap-2">
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="h-7 px-3 text-xs bg-background/50 hover:bg-success/10 hover:text-success hover:border-success/30 transition-all duration-200"
                                        >
                                          Resolve
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-7 px-3 text-xs text-muted-foreground hover:text-foreground"
                                        >
                                          Details
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>))}
                          </div>
                        </ScrollArea>
                      ) : (
                        <div className="text-center py-12 px-4">
                          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-success/10 to-success/5 rounded-full flex items-center justify-center mb-4 ring-1 ring-success/20">
                            <CheckCircle className="h-8 w-8 text-success" />
                          </div>
                          <h3 className="text-sm font-semibold text-foreground mb-1">All Clear!</h3>
                          <p className="text-xs text-muted-foreground">No system alerts at the moment.</p>
                          <p className="text-xs text-muted-foreground/80 mt-1">Your system is running smoothly.</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Quick Actions */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => handleNavigation('/admin/users')}
                      >
                        <Users className="h-4 w-4 mr-2" />
                        Manage Users
                      </Button>

                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => handleNavigation('/admin/analytics')}
                      >
                        <TrendingUp className="h-4 w-4 mr-2" />
                        View Analytics
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => handleNavigation('/settings')}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        System Settings
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </AuthGuard>
  );
}