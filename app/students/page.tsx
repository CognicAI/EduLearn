'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { AuthGuard } from '@/lib/auth/auth-guard';
import { DashboardSidebar } from '@/components/layout/dashboard-sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Search, 
  Filter, 
  Users, 
  GraduationCap, 
  BookOpenIcon, 
  TrendingUp, 
  Mail, 
  Phone,
  Calendar,
  Award,
  Eye,
  MessageSquare,
  Download
} from 'lucide-react';

const mockStudents = [
  {
    id: '1',
    firstName: 'Alice',
    lastName: 'Johnson',
    email: 'alice.johnson@email.com',
    avatar: undefined,
    enrolledCourses: 3,
    completedCourses: 1,
    averageGrade: 88.5,
    totalProgress: 75,
    status: 'active',
    enrolledAt: '2024-01-15',
    lastActivity: '2 hours ago',
    courses: [
      { id: '1', title: 'Introduction to Computer Science', progress: 85, grade: 92 },
      { id: '2', title: 'Advanced Web Development', progress: 70, grade: 88 },
      { id: '3', title: 'Database Design Fundamentals', progress: 60, grade: null },
    ]
  },
  {
    id: '2',
    firstName: 'Bob',
    lastName: 'Smith',
    email: 'bob.smith@email.com',
    avatar: undefined,
    enrolledCourses: 2,
    completedCourses: 0,
    averageGrade: 76.3,
    totalProgress: 45,
    status: 'active',
    enrolledAt: '2024-01-20',
    lastActivity: '1 day ago',
    courses: [
      { id: '1', title: 'Introduction to Computer Science', progress: 55, grade: 78 },
      { id: '4', title: 'Machine Learning Basics', progress: 35, grade: null },
    ]
  },
  {
    id: '3',
    firstName: 'Carol',
    lastName: 'Davis',
    email: 'carol.davis@email.com',
    avatar: undefined,
    enrolledCourses: 4,
    completedCourses: 2,
    averageGrade: 94.2,
    totalProgress: 90,
    status: 'active',
    enrolledAt: '2024-01-10',
    lastActivity: '30 minutes ago',
    courses: [
      { id: '1', title: 'Introduction to Computer Science', progress: 100, grade: 96 },
      { id: '2', title: 'Advanced Web Development', progress: 100, grade: 94 },
      { id: '3', title: 'Database Design Fundamentals', progress: 80, grade: 92 },
      { id: '5', title: 'Digital Marketing Strategy', progress: 70, grade: null },
    ]
  },
  {
    id: '4',
    firstName: 'David',
    lastName: 'Wilson',
    email: 'david.wilson@email.com',
    avatar: undefined,
    enrolledCourses: 1,
    completedCourses: 0,
    averageGrade: 82.0,
    totalProgress: 25,
    status: 'inactive',
    enrolledAt: '2024-02-01',
    lastActivity: '1 week ago',
    courses: [
      { id: '6', title: 'Mobile App Development', progress: 25, grade: 82 },
    ]
  },
  {
    id: '5',
    firstName: 'Emma',
    lastName: 'Brown',
    email: 'emma.brown@email.com',
    avatar: undefined,
    enrolledCourses: 3,
    completedCourses: 1,
    averageGrade: 91.7,
    totalProgress: 80,
    status: 'active',
    enrolledAt: '2024-01-25',
    lastActivity: '4 hours ago',
    courses: [
      { id: '2', title: 'Advanced Web Development', progress: 100, grade: 95 },
      { id: '3', title: 'Database Design Fundamentals', progress: 75, grade: 89 },
      { id: '4', title: 'Machine Learning Basics', progress: 65, grade: null },
    ]
  },
];

export default function StudentsPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<typeof mockStudents[0] | null>(null);

  const filteredStudents = mockStudents.filter(student => {
    const matchesSearch = 
      student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || student.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`;
  };

  const StudentOverview = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStudents.length}</div>
            <p className="text-xs text-muted-foreground">
              +2 from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Students</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockStudents.filter(s => s.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.round((mockStudents.filter(s => s.status === 'active').length / mockStudents.length) * 100)}% active rate
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Performance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(mockStudents.reduce((acc, s) => acc + s.averageGrade, 0) / mockStudents.length)}%
            </div>
            <p className="text-xs text-muted-foreground">
              +3% from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Course Completions</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockStudents.reduce((acc, s) => acc + s.completedCourses, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total completed courses
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Students List */}
      <Card>
        <CardHeader>
          <CardTitle>Students</CardTitle>
          <CardDescription>
            Manage and monitor student progress
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredStudents.map((student) => (
              <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={student.avatar} alt={`${student.firstName} ${student.lastName}`} />
                    <AvatarFallback>{getInitials(student.firstName, student.lastName)}</AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{student.firstName} {student.lastName}</h3>
                      <Badge className={getStatusColor(student.status)}>
                        {student.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">{student.email}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{student.enrolledCourses} courses</span>
                      <span>Avg: {student.averageGrade}%</span>
                      <span>Last active: {student.lastActivity}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm font-medium">{student.totalProgress}% Progress</div>
                    <Progress value={student.totalProgress} className="w-24 h-2 mt-1" />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedStudent(student)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button variant="outline" size="sm">
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Message
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const StudentDetail = () => {
    if (!selectedStudent) return null;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => setSelectedStudent(null)}>
            ← Back to Students
          </Button>
          <div className="flex gap-2">
            <Button variant="outline">
              <Mail className="h-4 w-4 mr-2" />
              Send Email
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Student Profile */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={selectedStudent.avatar} alt={`${selectedStudent.firstName} ${selectedStudent.lastName}`} />
                <AvatarFallback className="text-lg">
                  {getInitials(selectedStudent.firstName, selectedStudent.lastName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">
                  {selectedStudent.firstName} {selectedStudent.lastName}
                </CardTitle>
                <p className="text-muted-foreground">{selectedStudent.email}</p>
                <div className="flex items-center gap-4 mt-2">
                  <Badge className={getStatusColor(selectedStudent.status)}>
                    {selectedStudent.status}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Enrolled: {new Date(selectedStudent.enrolledAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Performance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Enrolled Courses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{selectedStudent.enrolledCourses}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Completed Courses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{selectedStudent.completedCourses}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Average Grade</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{selectedStudent.averageGrade}%</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{selectedStudent.totalProgress}%</div>
            </CardContent>
          </Card>
        </div>

        {/* Course Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Course Progress</CardTitle>
            <CardDescription>
              Detailed progress for each enrolled course
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {selectedStudent.courses.map((course) => (
                <div key={course.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{course.title}</h4>
                    <div className="flex items-center gap-2">
                      {course.grade && (
                        <Badge variant="outline">Grade: {course.grade}%</Badge>
                      )}
                      <Badge variant="outline">{course.progress}% Complete</Badge>
                    </div>
                  </div>
                  <Progress value={course.progress} className="mb-2" />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Progress: {course.progress}%</span>
                    <span>{course.grade ? `Current Grade: ${course.grade}%` : 'No grade yet'}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <AuthGuard allowedRoles={['teacher', 'admin']}>
      <div className="flex h-screen bg-background">
        <DashboardSidebar />
        
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            {!selectedStudent ? (
              <>
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h1 className="text-3xl font-bold text-foreground">
                      {user?.role === 'admin' ? 'All Students' : 'My Students'}
                    </h1>
                    <p className="text-muted-foreground mt-2">
                      {user?.role === 'admin' 
                        ? 'Manage all students on the platform'
                        : 'Monitor and manage your students\' progress'
                      }
                    </p>
                  </div>
                  <Button>
                    <Download className="h-4 w-4 mr-2" />
                    Export Report
                  </Button>
                </div>

                {/* Search and Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search students..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-40">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <StudentOverview />
              </>
            ) : (
              <StudentDetail />
            )}
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}