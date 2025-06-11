'use client';

import { useAuth } from '@/lib/auth/auth-context';
import { AuthGuard } from '@/lib/auth/auth-guard';
import { DashboardSidebar } from '@/components/layout/dashboard-sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { BookOpenIcon, Clock, Trophy, TrendingUp, Calendar, Play, FileText, Download, Eye } from 'lucide-react';
import { useDashboardData } from '@/lib/hooks/use-dashboard-data';
import { useUserProfile } from '@/lib/hooks/use-user';
import Link from 'next/link';

// Enhanced mock data for student courses
const mockEnrolledCourses = [
  {
    id: '1',
    title: 'Introduction to Computer Science',
    instructor: 'Prof. Johnson',
    progress: 75,
    nextDeadline: 'Assignment due in 3 days',
    status: 'active',
    thumbnail: 'https://images.pexels.com/photos/574071/pexels-photo-574071.jpeg?auto=compress&cs=tinysrgb&w=400',
    totalLessons: 24,
    completedLessons: 18,
    currentGrade: 88,
    recentActivity: 'Completed Module 6: Data Structures',
    files: [
      { name: 'Course Syllabus.pdf', type: 'pdf', size: '2.3 MB' },
      { name: 'Lecture Notes - Week 1.pdf', type: 'pdf', size: '1.8 MB' },
      { name: 'Assignment Template.docx', type: 'doc', size: '0.5 MB' },
    ],
    assignments: [
      { id: 'a1', title: 'Data Structures Quiz', dueDate: '2024-01-18', status: 'submitted', grade: 92 },
      { id: 'a2', title: 'Algorithm Analysis', dueDate: '2024-01-25', status: 'pending', grade: null },
    ]
  },
  {
    id: '2',
    title: 'Advanced Web Development',
    instructor: 'Dr. Smith',
    progress: 60,
    nextDeadline: 'Quiz tomorrow',
    status: 'active',
    thumbnail: 'https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?auto=compress&cs=tinysrgb&w=400',
    totalLessons: 20,
    completedLessons: 12,
    currentGrade: 91,
    recentActivity: 'Started Module 4: React Hooks',
    files: [
      { name: 'React Documentation.pdf', type: 'pdf', size: '3.1 MB' },
      { name: 'Project Starter Code.zip', type: 'zip', size: '15.2 MB' },
      { name: 'API Reference.pdf', type: 'pdf', size: '1.2 MB' },
    ],
    assignments: [
      { id: 'a3', title: 'React Component Library', dueDate: '2024-01-20', status: 'in-progress', grade: null },
      { id: 'a4', title: 'API Integration Project', dueDate: '2024-01-30', status: 'not-started', grade: null },
    ]
  },
  {
    id: '3',
    title: 'Database Design Fundamentals',
    instructor: 'Ms. Davis',
    progress: 90,
    nextDeadline: 'Final project next week',
    status: 'nearly-complete',
    thumbnail: 'https://images.pexels.com/photos/1181677/pexels-photo-1181677.jpeg?auto=compress&cs=tinysrgb&w=400',
    totalLessons: 16,
    completedLessons: 14,
    currentGrade: 94,
    recentActivity: 'Completed Final Review Session',
    files: [
      { name: 'SQL Reference Guide.pdf', type: 'pdf', size: '2.8 MB' },
      { name: 'Database Schema Examples.sql', type: 'sql', size: '0.3 MB' },
      { name: 'Normalization Worksheet.pdf', type: 'pdf', size: '1.1 MB' },
    ],
    assignments: [
      { id: 'a5', title: 'E-commerce Database Design', dueDate: '2024-01-28', status: 'submitted', grade: 96 },
      { id: 'a6', title: 'Query Optimization', dueDate: '2024-02-05', status: 'pending', grade: null },
    ]
  },
];

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
                    <CardTitle className="text-sm font-medium">Enrolled Courses</CardTitle>
                    <BookOpenIcon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{mockEnrolledCourses.length}</div>
                    <p className="text-xs text-muted-foreground">
                      +1 from last month
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg. Progress</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {Math.round(mockEnrolledCourses.reduce((acc, course) => acc + course.progress, 0) / mockEnrolledCourses.length)}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      +5% from last week
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pending Assignments</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {mockEnrolledCourses.reduce((acc, course) => 
                        acc + course.assignments.filter(a => a.status === 'pending' || a.status === 'in-progress').length, 0
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Due this week
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Current GPA</CardTitle>
                    <Trophy className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {(mockEnrolledCourses.reduce((acc, course) => acc + course.currentGrade, 0) / mockEnrolledCourses.length / 20).toFixed(1)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Out of 5.0
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Enrolled Courses */}
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>My Courses</CardTitle>
                      <CardDescription>
                        Continue your learning journey
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {mockEnrolledCourses.map((course) => (
                        <div key={course.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                          <div className="flex items-start gap-4">
                            <img
                              src={course.thumbnail}
                              alt={course.title}
                              className="w-20 h-20 rounded-lg object-cover"
                            />
                            
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h3 className="font-semibold text-lg mb-1">{course.title}</h3>
                                  <p className="text-sm text-muted-foreground mb-2">
                                    Instructor: {course.instructor}
                                  </p>
                                </div>
                                <Badge variant={course.status === 'nearly-complete' ? 'default' : 'secondary'}>
                                  {course.progress}% complete
                                </Badge>
                              </div>
                              
                              <div className="space-y-3">
                                <div>
                                  <div className="flex justify-between text-sm mb-1">
                                    <span>Progress</span>
                                    <span>{course.completedLessons}/{course.totalLessons} lessons</span>
                                  </div>
                                  <Progress value={course.progress} className="h-2" />
                                </div>
                                
                                <div className="flex items-center justify-between text-sm">
                                  <div className="flex items-center gap-4">
                                    <span className="text-muted-foreground">
                                      Current Grade: <span className="font-medium text-foreground">{course.currentGrade}%</span>
                                    </span>
                                    <span className="text-orange-600 flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      {course.nextDeadline}
                                    </span>
                                  </div>
                                </div>
                                
                                <p className="text-sm text-muted-foreground">
                                  Recent: {course.recentActivity}
                                </p>
                                
                                <div className="flex gap-2 pt-2">
                                  <Button size="sm" asChild>
                                    <Link href={`/courses/${course.id}`}>
                                      <Play className="h-3 w-3 mr-1" />
                                      Continue Learning
                                    </Link>
                                  </Button>
                                  <Button variant="outline" size="sm" asChild>
                                    <Link href={`/courses/${course.id}/details`}>
                                      <Eye className="h-3 w-3 mr-1" />
                                      View Details
                                    </Link>
                                  </Button>
                                  <Button variant="outline" size="sm" asChild>
                                    <Link href={`/assignments?course=${course.id}`}>
                                      <FileText className="h-3 w-3 mr-1" />
                                      Assignments
                                    </Link>
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-6">
                  {/* Upcoming Deadlines */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Upcoming Deadlines</CardTitle>
                      <CardDescription>
                        Don't miss these important dates
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {mockEnrolledCourses.flatMap(course => 
                        course.assignments.filter(a => a.status === 'pending' || a.status === 'in-progress')
                          .map(assignment => ({ ...assignment, courseName: course.title }))
                      ).slice(0, 5).map((assignment) => (
                        <div key={assignment.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                          <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{assignment.title}</p>
                            <p className="text-xs text-muted-foreground">{assignment.courseName}</p>
                            <p className="text-xs text-muted-foreground">
                              Due: {new Date(assignment.dueDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Recent Activity */}
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
                  <Card>
                    <CardHeader>
                      <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Button variant="outline" className="w-full justify-start" asChild>
                        <Link href="/calendar">
                          <Calendar className="h-4 w-4 mr-2" />
                          View Calendar
                        </Link>
                      </Button>
                      <Button variant="outline" className="w-full justify-start" asChild>
                        <Link href="/courses">
                          <BookOpenIcon className="h-4 w-4 mr-2" />
                          Browse Courses
                        </Link>
                      </Button>
                      <Button variant="outline" className="w-full justify-start" asChild>
                        <Link href="/assignments">
                          <FileText className="h-4 w-4 mr-2" />
                          View Assignments
                        </Link>
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