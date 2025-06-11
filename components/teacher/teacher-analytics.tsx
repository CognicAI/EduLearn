'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Users, BookOpenIcon, FileText, Award } from 'lucide-react';

// Mock analytics data
const performanceData = [
  { month: 'Sep', avgGrade: 78, submissions: 145, completion: 82 },
  { month: 'Oct', avgGrade: 82, submissions: 167, completion: 85 },
  { month: 'Nov', avgGrade: 85, submissions: 189, completion: 88 },
  { month: 'Dec', avgGrade: 87, submissions: 203, completion: 91 },
  { month: 'Jan', avgGrade: 89, submissions: 221, completion: 93 }
];

const courseDistribution = [
  { name: 'Computer Science', students: 45, color: '#8884d8' },
  { name: 'Web Development', students: 32, color: '#82ca9d' },
  { name: 'Database Design', students: 28, color: '#ffc658' },
  { name: 'Machine Learning', students: 67, color: '#ff7300' }
];

const gradeDistribution = [
  { grade: 'A (90-100)', count: 28, percentage: 35 },
  { grade: 'B (80-89)', count: 32, percentage: 40 },
  { grade: 'C (70-79)', count: 15, percentage: 19 },
  { grade: 'D (60-69)', count: 4, percentage: 5 },
  { grade: 'F (0-59)', count: 1, percentage: 1 }
];

const engagementData = [
  { week: 'Week 1', logins: 156, submissions: 89, discussions: 45 },
  { week: 'Week 2', logins: 142, submissions: 92, discussions: 52 },
  { week: 'Week 3', logins: 168, submissions: 87, discussions: 48 },
  { week: 'Week 4', logins: 174, submissions: 95, discussions: 61 },
  { week: 'Week 5', logins: 159, submissions: 91, discussions: 55 }
];

export function TeacherAnalytics() {
  const totalStudents = courseDistribution.reduce((sum, course) => sum + course.students, 0);
  const avgGrade = performanceData[performanceData.length - 1].avgGrade;
  const completionRate = performanceData[performanceData.length - 1].completion;
  const totalSubmissions = performanceData[performanceData.length - 1].submissions;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
        <p className="text-muted-foreground">Comprehensive insights into your teaching performance</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +12% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Grade</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgGrade}%</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +3% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <BookOpenIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionRate}%</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +5% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSubmissions}</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +8% from last month
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Trends</CardTitle>
            <CardDescription>
              Average grades and completion rates over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="avgGrade" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  name="Average Grade"
                />
                <Line 
                  type="monotone" 
                  dataKey="completion" 
                  stroke="#82ca9d" 
                  strokeWidth={2}
                  name="Completion Rate"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Course Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Course Distribution</CardTitle>
            <CardDescription>
              Student enrollment across your courses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={courseDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name}: ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="students"
                >
                  {courseDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Grade Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Grade Distribution</CardTitle>
            <CardDescription>
              Distribution of student grades across all courses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {gradeDistribution.map((grade, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{grade.grade}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">{grade.count} students</span>
                      <Badge variant="outline">{grade.percentage}%</Badge>
                    </div>
                  </div>
                  <Progress value={grade.percentage} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Student Engagement */}
        <Card>
          <CardHeader>
            <CardTitle>Student Engagement</CardTitle>
            <CardDescription>
              Weekly student activity metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={engagementData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="logins" fill="#8884d8" name="Logins" />
                <Bar dataKey="submissions" fill="#82ca9d" name="Submissions" />
                <Bar dataKey="discussions" fill="#ffc658" name="Discussions" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Course Performance Details */}
      <Card>
        <CardHeader>
          <CardTitle>Course Performance Details</CardTitle>
          <CardDescription>
            Detailed metrics for each of your courses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {courseDistribution.map((course, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">{course.name}</h4>
                  <Badge variant="outline">{course.students} students</Badge>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground mb-1">Average Grade</p>
                    <p className="font-medium">{85 + index * 2}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Completion Rate</p>
                    <p className="font-medium">{88 + index * 3}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Engagement</p>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">{82 + index * 4}%</span>
                      {index % 2 === 0 ? (
                        <TrendingUp className="h-3 w-3 text-green-500" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-red-500" />
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="mt-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Overall Progress</span>
                    <span>{88 + index * 3}%</span>
                  </div>
                  <Progress value={88 + index * 3} className="h-2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}