'use client';

import { useAuth } from '@/lib/auth/auth-context';
import { AuthGuard } from '@/lib/auth/auth-guard';
import { DashboardSidebar } from '@/components/layout/dashboard-sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart3, Users, BookOpenIcon, TrendingUp, Calendar, Download, Filter } from 'lucide-react';

const mockAnalyticsData = {
  overview: [
    { label: 'Total Students', value: 1247, change: '+12%', trend: 'up' },
    { label: 'Active Courses', value: 89, change: '+5%', trend: 'up' },
    { label: 'Completion Rate', value: '87%', change: '+3%', trend: 'up' },
    { label: 'Avg. Grade', value: '85.2', change: '+2.1', trend: 'up' },
  ],
  coursePerformance: [
    { course: 'Introduction to Computer Science', students: 45, avgGrade: 88.5, completion: 92 },
    { course: 'Advanced Web Development', students: 32, avgGrade: 91.2, completion: 89 },
    { course: 'Database Design Fundamentals', students: 28, avgGrade: 85.7, completion: 95 },
    { course: 'Machine Learning Basics', students: 67, avgGrade: 82.3, completion: 78 },
  ],
  studentEngagement: [
    { metric: 'Daily Active Users', value: 892, percentage: 71.5 },
    { metric: 'Weekly Login Rate', value: 1156, percentage: 92.7 },
    { metric: 'Assignment Submission Rate', value: 1089, percentage: 87.3 },
    { metric: 'Discussion Participation', value: 734, percentage: 58.9 },
  ],
};

export default function AnalyticsPage() {
  const { user } = useAuth();

  return (
    <AuthGuard allowedRoles={['teacher', 'admin']}>
      <div className="flex h-screen bg-background">
        <DashboardSidebar />

        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Analytics Dashboard
                </h1>
                <p className="text-muted-foreground mt-2">
                  {user?.role === 'admin'
                    ? 'Platform-wide analytics and insights'
                    : 'Course performance and student analytics'
                  }
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {mockAnalyticsData.overview.map((stat, index) => (
                <Card key={index}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                    {stat.label === 'Total Students' && <Users className="h-4 w-4 text-muted-foreground" />}
                    {stat.label === 'Active Courses' && <BookOpenIcon className="h-4 w-4 text-muted-foreground" />}
                    {stat.label === 'Completion Rate' && <TrendingUp className="h-4 w-4 text-muted-foreground" />}
                    {stat.label === 'Avg. Grade' && <BarChart3 className="h-4 w-4 text-muted-foreground" />}
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className={`text-xs ${stat.trend === 'up' ? 'text-green-600' :
                        stat.trend === 'down' ? 'text-red-600' :
                          'text-muted-foreground'
                      }`}>
                      {stat.change} from last month
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Course Performance */}
              <Card>
                <CardHeader>
                  <CardTitle>Course Performance</CardTitle>
                  <CardDescription>
                    Student enrollment and completion metrics
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mockAnalyticsData.coursePerformance.map((course, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium line-clamp-1">{course.course}</h4>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                            <span>{course.students} students</span>
                            <span>Avg: {course.avgGrade}%</span>
                          </div>
                        </div>
                        <Badge variant="outline">{course.completion}% complete</Badge>
                      </div>
                      <Progress value={course.completion} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Student Engagement */}
              <Card>
                <CardHeader>
                  <CardTitle>Student Engagement</CardTitle>
                  <CardDescription>
                    Platform usage and participation metrics
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mockAnalyticsData.studentEngagement.map((metric, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{metric.metric}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">{metric.value}</span>
                          <Badge variant="outline">{metric.percentage}%</Badge>
                        </div>
                      </div>
                      <Progress value={metric.percentage} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Additional Analytics Section */}
            <div className="mt-8">
              <Card>
                <CardHeader>
                  <CardTitle>Detailed Reports</CardTitle>
                  <CardDescription>
                    Access comprehensive analytics and reports
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                      <BarChart3 className="h-6 w-6 mb-2" />
                      <span>Grade Distribution</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                      <Users className="h-6 w-6 mb-2" />
                      <span>Student Progress</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                      <Calendar className="h-6 w-6 mb-2" />
                      <span>Activity Timeline</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}