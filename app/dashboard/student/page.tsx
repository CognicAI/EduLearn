'use client';

import { useAuth } from '@/lib/auth/auth-context';
import { AuthGuard } from '@/lib/auth/auth-guard';
import { DashboardSidebar } from '@/components/layout/dashboard-sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { BookOpenIcon, Clock, Trophy, TrendingUp, Calendar, Play } from 'lucide-react';
import { useDashboardData } from '@/lib/hooks/use-dashboard-data';
import { useUserProfile } from '@/lib/hooks/use-user';

function DashboardSkeleton() {
  return (
    <div className="p-6 space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
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
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-4 border rounded-lg">
                  <Skeleton className="h-5 w-48 mb-2" />
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-2 w-full mb-2" />
                  <Skeleton className="h-4 w-40" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-start space-x-3">
                  <Skeleton className="w-2 h-2 rounded-full mt-2" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const { data: profileData, isLoading: profileLoading } = useUserProfile();
  const { data: dashboardData, isLoading: dashboardLoading, error } = useDashboardData('student');

  const isLoading = profileLoading || dashboardLoading;

  if (error) {
    return (
      <AuthGuard allowedRoles={['student']}>
        <div className="flex h-screen bg-background">
          <DashboardSidebar />
          <main className="flex-1 overflow-y-auto">
            <div className="p-6">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-destructive mb-2">Error Loading Dashboard</h1>
                <p className="text-muted-foreground">Please try refreshing the page.</p>
              </div>
            </div>
          </main>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard allowedRoles={['student']}>
      <div className="flex h-screen bg-background">
        <DashboardSidebar />
        
        <main className="flex-1 overflow-y-auto">
          {isLoading ? (
            <DashboardSkeleton />
          ) : (
            <div className="p-6">
              {/* Header */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground">
                  Welcome back, {profileData?.firstName || user?.firstName}!
                </h1>
                <p className="text-muted-foreground mt-2">
                  Here's what's happening with your learning journey today.
                </p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
                    <BookOpenIcon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dashboardData?.stats.totalCourses || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      +1 from last month
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dashboardData?.stats.completionRate || 0}%</div>
                    <p className="text-xs text-muted-foreground">
                      +5% from last week
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Upcoming Deadlines</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dashboardData?.stats.upcomingDeadlines || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      This week
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Achievements</CardTitle>
                    <Trophy className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dashboardData?.stats.achievements || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      +2 this month
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Current Courses */}
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>My Courses</CardTitle>
                      <CardDescription>
                        Continue your learning journey
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {dashboardData?.courses?.map((course) => (
                        <div key={course.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold">{course.title}</h3>
                              <Badge variant={course.status === 'nearly-complete' ? 'default' : 'secondary'}>
                                {course.progress}% complete
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              Instructor: {course.instructor}
                            </p>
                            <Progress value={course.progress} className="mb-2" />
                            <p className="text-sm text-orange-600 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {course.nextDeadline}
                            </p>
                          </div>
                          <Button size="sm" className="ml-4">
                            <Play className="h-3 w-3 mr-1" />
                            Continue
                          </Button>
                        </div>
                      )) || (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground">No courses enrolled yet.</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Activity */}
                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Activity</CardTitle>
                      <CardDescription>
                        Your latest learning activities
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {dashboardData?.recentActivity?.map((activity) => (
                        <div key={activity.id} className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{activity.title}</p>
                            {activity.course && (
                              <p className="text-xs text-muted-foreground">{activity.course}</p>
                            )}
                            <p className="text-xs text-muted-foreground">{activity.time}</p>
                          </div>
                        </div>
                      )) || (
                        <div className="text-center py-4">
                          <p className="text-sm text-muted-foreground">No recent activity.</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Quick Actions */}
                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Button variant="outline" className="w-full justify-start">
                        <Calendar className="h-4 w-4 mr-2" />
                        View Calendar
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <BookOpenIcon className="h-4 w-4 mr-2" />
                        Browse Courses
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Trophy className="h-4 w-4 mr-2" />
                        View Achievements
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