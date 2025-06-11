'use client';

import { useAuth } from '@/lib/auth/auth-context';
import { AuthGuard } from '@/lib/auth/auth-guard';
import { DashboardSidebar } from '@/components/layout/dashboard-sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpenIcon, Users, FileText, Clock, TrendingUp, Plus, Eye } from 'lucide-react';

const mockCourses = [
  {
    id: '1',
    title: 'Introduction to Computer Science',
    students: 45,
    assignments: 8,
    pendingGrades: 12,
    status: 'active',
  },
  {
    id: '2',
    title: 'Advanced Web Development',
    students: 32,
    assignments: 6,
    pendingGrades: 5,
    status: 'active',
  },
  {
    id: '3',
    title: 'Database Design Fundamentals',
    students: 28,
    assignments: 4,
    pendingGrades: 0,
    status: 'completed',
  },
];

const mockRecentActivity = [
  { type: 'submission', title: 'New assignment submission', student: 'John Doe', course: 'Computer Science', time: '1 hour ago' },
  { type: 'question', title: 'Student question posted', student: 'Jane Smith', course: 'Web Development', time: '3 hours ago' },
  { type: 'grade', title: 'Grades published', course: 'Database Design', time: '1 day ago' },
];

const mockUpcomingDeadlines = [
  { title: 'Final Project Submissions', course: 'Computer Science', date: 'Tomorrow', type: 'assignment' },
  { title: 'Midterm Exam', course: 'Web Development', date: 'In 3 days', type: 'exam' },
  { title: 'Quiz 3', course: 'Database Design', date: 'Next Monday', type: 'quiz' },
];

export default function TeacherDashboard() {
  const { user } = useAuth();

  return (
    <AuthGuard allowedRoles={['teacher']}>
      <div className="flex h-screen bg-background">
        <DashboardSidebar />
        
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Welcome back, Prof. {user?.firstName}!
                </h1>
                <p className="text-muted-foreground mt-2">
                  Manage your courses and track student progress.
                </p>
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Course
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
                  <div className="text-2xl font-bold">3</div>
                  <p className="text-xs text-muted-foreground">
                    105 total students
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">105</div>
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
                  <div className="text-2xl font-bold">17</div>
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
                  <div className="text-2xl font-bold">87%</div>
                  <p className="text-xs text-muted-foreground">
                    +3% from last month
                  </p>
                </CardContent>
              </Card>
            </div>

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
                    {mockCourses.map((course) => (
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
                    ))}
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
                    {mockRecentActivity.map((activity, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{activity.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {activity.student && `${activity.student} • `}{activity.course}
                          </p>
                          <p className="text-xs text-muted-foreground">{activity.time}</p>
                        </div>
                      </div>
                    ))}
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
                    {mockUpcomingDeadlines.map((deadline, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium">{deadline.title}</p>
                          <p className="text-xs text-muted-foreground">{deadline.course}</p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {deadline.date}
                        </Badge>
                      </div>
                    ))}
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