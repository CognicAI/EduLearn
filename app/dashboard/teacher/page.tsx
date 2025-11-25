'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { AuthGuard } from '@/lib/auth/auth-guard';
import { DashboardSidebar } from '@/components/layout/dashboard-sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpenIcon, Users, FileText, Clock, TrendingUp, Plus, Eye, Edit, BarChart3 } from 'lucide-react';
import { useDashboardData } from '@/lib/hooks/use-dashboard-data';
import { useUserProfile } from '@/lib/hooks/use-user';
import { AssignmentManagement } from '@/components/teacher/assignment-management';
import { GradeSubmissions } from '@/components/teacher/grade-submissions';
import { EventManagement } from '@/components/teacher/event-management';
import { TeacherAnalytics } from '@/components/teacher/teacher-analytics';

function DashboardSkeleton() {
  return (
    <div className="p-6 space-y-8">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-10 w-32" />
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

export default function TeacherDashboard() {
  const { user } = useAuth();
  const { data: profileData, isLoading: profileLoading } = useUserProfile();
  const { data: dashboardData, isLoading: dashboardLoading, error } = useDashboardData('teacher');
  const [activeTab, setActiveTab] = useState('overview');

  const isLoading = profileLoading || dashboardLoading;

  if (error) {
    return (
      <AuthGuard allowedRoles={['teacher']}>
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
    <AuthGuard allowedRoles={['teacher']}>
      <div className="flex h-screen bg-background">
        <DashboardSidebar />
        
        <main className="flex-1 overflow-y-auto">
          {isLoading ? (
            <DashboardSkeleton />
          ) : (
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-foreground">
                    Welcome back, Prof. {profileData?.firstName || user?.firstName}!
                  </h1>
                  <p className="text-muted-foreground mt-2">
                    Manage your courses, assignments, and track student progress.
                  </p>
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Quick Actions
                </Button>
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
                      {dashboardData?.stats.totalStudents || 0} total students
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dashboardData?.stats.totalStudents || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      +8 from last month
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pending Grades</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dashboardData?.stats.pendingGrades || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      Assignments to grade
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg. Performance</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dashboardData?.stats.completionRate || 0}%</div>
                    <p className="text-xs text-muted-foreground">
                      +3% from last month
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Management Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="assignments">Assignments</TabsTrigger>
                  <TabsTrigger value="grading">Grading</TabsTrigger>
                  <TabsTrigger value="analytics">Analytics</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* My Courses */}
                    <div className="lg:col-span-2">
                      <Card>
                        <CardHeader>
                          <CardTitle>My Courses</CardTitle>
                          <CardDescription>
                            Manage your active courses
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {dashboardData?.courses?.map((course) => (
                            <div key={course.id} className="flex items-center justify-between p-4 border rounded-lg">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="font-semibold">{course.title}</h3>
                                  <Badge variant={course.status === 'active' ? 'default' : 'secondary'}>
                                    {course.status}
                                  </Badge>
                                </div>
                                <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <Users className="h-3 w-3" />
                                    {course.students} students
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <FileText className="h-3 w-3" />
                                    {course.assignments} assignments
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {course.pendingGrades} pending
                                  </div>
                                </div>
                              </div>
                              <Button size="sm" variant="outline" className="ml-4">
                                <Eye className="h-3 w-3 mr-1" />
                                View
                              </Button>
                            </div>
                          )) || (
                            <div className="text-center py-8">
                              <p className="text-muted-foreground">No courses created yet.</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>

                    <div className="space-y-6">
                      {/* Recent Activity */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Recent Activity</CardTitle>
                          <CardDescription>
                            Latest student interactions
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {dashboardData?.recentActivity?.map((activity) => (
                            <div key={activity.id} className="flex items-start space-x-3">
                              <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                              <div className="flex-1">
                                <p className="text-sm font-medium">{activity.title}</p>
                                <p className="text-xs text-muted-foreground">
                                  {activity.user && `${activity.user} • `}{activity.course}
                                </p>
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

                      {/* Upcoming Deadlines */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Upcoming Deadlines</CardTitle>
                          <CardDescription>
                            Important dates to remember
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {dashboardData?.upcomingDeadlines?.map((deadline, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                              <div>
                                <p className="text-sm font-medium">{deadline.title}</p>
                                <p className="text-xs text-muted-foreground">{deadline.course}</p>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {deadline.date}
                              </Badge>
                            </div>
                          )) || (
                            <div className="text-center py-4">
                              <p className="text-sm text-muted-foreground">No upcoming deadlines.</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="assignments" className="mt-6">
                  <AssignmentManagement />
                </TabsContent>

                <TabsContent value="grading" className="mt-6">
                  <GradeSubmissions />
                </TabsContent>

                <TabsContent value="analytics" className="mt-6">
                  <TeacherAnalytics />
                </TabsContent>
              </Tabs>
            </div>
          )}
        </main>
      </div>
    </AuthGuard>
  );
}