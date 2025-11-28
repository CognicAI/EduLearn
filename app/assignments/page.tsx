'use client';

import { useAuth } from '@/lib/auth/auth-context';
import { AuthGuard } from '@/lib/auth/auth-guard';
import { DashboardSidebar } from '@/components/layout/dashboard-sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  FileText,
  Search,
  Plus,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  Edit,
  Upload
} from 'lucide-react';

const mockAssignments = [
  {
    id: '1',
    title: 'JavaScript Functions Quiz',
    course: 'Web Development Fundamentals',
    dueDate: '2024-01-15',
    status: 'submitted',
    grade: 85,
    maxPoints: 100,
    submittedAt: '2024-01-14',
    description: 'Complete the quiz on JavaScript functions, closures, and scope.',
  },
  {
    id: '2',
    title: 'Database Design Project',
    course: 'Database Design Fundamentals',
    dueDate: '2024-01-20',
    status: 'pending',
    maxPoints: 100,
    description: 'Design a normalized database schema for an e-commerce application.',
  },
  {
    id: '3',
    title: 'Algorithm Analysis Report',
    course: 'Introduction to Computer Science',
    dueDate: '2024-01-25',
    status: 'draft',
    maxPoints: 100,
    description: 'Analyze the time complexity of sorting algorithms and provide detailed explanations.',
  },
  {
    id: '4',
    title: 'React Component Library',
    course: 'Advanced Web Development',
    dueDate: '2024-01-30',
    status: 'not_started',
    maxPoints: 150,
    description: 'Create a reusable component library with TypeScript and Storybook.',
  },
];

const teacherAssignments = [
  {
    id: '1',
    title: 'JavaScript Functions Quiz',
    course: 'Web Development Fundamentals',
    dueDate: '2024-01-15',
    submissions: 28,
    totalStudents: 32,
    graded: 25,
    maxPoints: 100,
    averageGrade: 82,
  },
  {
    id: '2',
    title: 'Database Design Project',
    course: 'Database Design Fundamentals',
    dueDate: '2024-01-20',
    submissions: 15,
    totalStudents: 28,
    graded: 8,
    maxPoints: 100,
    averageGrade: 78,
  },
  {
    id: '3',
    title: 'Algorithm Analysis Report',
    course: 'Introduction to Computer Science',
    dueDate: '2024-01-25',
    submissions: 5,
    totalStudents: 45,
    graded: 0,
    maxPoints: 100,
    averageGrade: null,
  },
];

export default function AssignmentsPage() {
  const { user } = useAuth();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'draft':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'not_started':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'overdue':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'Submitted';
      case 'pending':
        return 'Pending';
      case 'draft':
        return 'Draft';
      case 'not_started':
        return 'Not Started';
      case 'overdue':
        return 'Overdue';
      default:
        return 'Unknown';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted':
        return <CheckCircle className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'overdue':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const StudentAssignments = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockAssignments.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Submitted</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockAssignments.filter(a => a.status === 'submitted').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockAssignments.filter(a => a.status === 'pending').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Grade</CardTitle>
            <Badge className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(mockAssignments.filter(a => a.grade).reduce((acc, a) => acc + (a.grade || 0), 0) / mockAssignments.filter(a => a.grade).length) || 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assignments List */}
      <div className="space-y-4">
        {mockAssignments.map((assignment) => {
          const actualStatus = isOverdue(assignment.dueDate) && assignment.status !== 'submitted' ? 'overdue' : assignment.status;

          return (
            <Card key={assignment.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-lg">{assignment.title}</CardTitle>
                      <Badge className={getStatusColor(actualStatus)}>
                        {getStatusIcon(actualStatus)}
                        <span className="ml-1">{getStatusText(actualStatus)}</span>
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">{assignment.course}</p>
                    <CardDescription>{assignment.description}</CardDescription>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">Due: {formatDate(assignment.dueDate)}</p>
                    <p className="text-sm text-muted-foreground">Max: {assignment.maxPoints} pts</p>
                    {assignment.grade && (
                      <p className="text-sm font-medium text-green-600">
                        Grade: {assignment.grade}/{assignment.maxPoints}
                      </p>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {assignment.submittedAt
                        ? `Submitted on ${formatDate(assignment.submittedAt)}`
                        : `Due in ${Math.ceil((new Date(assignment.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days`
                      }
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    {assignment.status !== 'submitted' && (
                      <Button size="sm">
                        <Upload className="h-4 w-4 mr-1" />
                        Submit
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );

  const TeacherAssignments = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teacherAssignments.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Grading</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {teacherAssignments.reduce((acc, a) => acc + (a.submissions - a.graded), 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {teacherAssignments.reduce((acc, a) => acc + a.submissions, 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Grade</CardTitle>
            <Badge className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(teacherAssignments.filter(a => a.averageGrade).reduce((acc, a) => acc + (a.averageGrade || 0), 0) / teacherAssignments.filter(a => a.averageGrade).length) || 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assignments List */}
      <div className="space-y-4">
        {teacherAssignments.map((assignment) => (
          <Card key={assignment.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-2">{assignment.title}</CardTitle>
                  <p className="text-sm text-muted-foreground mb-2">{assignment.course}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Due: {formatDate(assignment.dueDate)}</span>
                    <span>Max Points: {assignment.maxPoints}</span>
                  </div>
                </div>
                <div className="text-right">
                  {assignment.averageGrade && (
                    <p className="text-sm font-medium text-green-600 mb-1">
                      Avg: {assignment.averageGrade}%
                    </p>
                  )}
                  <Badge variant="outline">
                    {assignment.submissions}/{assignment.totalStudents} submitted
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Submission Progress</span>
                    <span>{Math.round((assignment.submissions / assignment.totalStudents) * 100)}%</span>
                  </div>
                  <Progress value={(assignment.submissions / assignment.totalStudents) * 100} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Grading Progress</span>
                    <span>{Math.round((assignment.graded / assignment.submissions) * 100)}%</span>
                  </div>
                  <Progress value={(assignment.graded / assignment.submissions) * 100} className="h-2" />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <AlertCircle className="h-4 w-4" />
                    <span>{assignment.submissions - assignment.graded} submissions need grading</span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      View Submissions
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <AuthGuard allowedRoles={['student', 'teacher']}>
      <div className="flex h-screen bg-background">
        <DashboardSidebar />

        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  {user?.role === 'teacher' ? 'Assignment Management' : 'My Assignments'}
                </h1>
                <p className="text-muted-foreground mt-2">
                  {user?.role === 'teacher'
                    ? 'Create and manage assignments for your courses'
                    : 'View and submit your course assignments'
                  }
                </p>
              </div>
              {user?.role === 'teacher' && (
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Assignment
                </Button>
              )}
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search assignments..."
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline">All Courses</Button>
                <Button variant="outline">Due Soon</Button>
                {user?.role === 'student' && <Button variant="outline">Submitted</Button>}
                {user?.role === 'teacher' && <Button variant="outline">Need Grading</Button>}
              </div>
            </div>

            {/* Content based on role */}
            {user?.role === 'student' ? <StudentAssignments /> : <TeacherAssignments />}
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}