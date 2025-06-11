'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { AuthGuard } from '@/lib/auth/auth-guard';
import { DashboardSidebar } from '@/components/layout/dashboard-sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Play, 
  FileText, 
  Download, 
  Clock, 
  CheckCircle, 
  BookOpenIcon,
  Users,
  Star,
  Calendar,
  Video,
  File,
  Link as LinkIcon
} from 'lucide-react';
import Link from 'next/link';

// Mock course data with detailed information
const mockCourseDetails = {
  '1': {
    id: '1',
    title: 'Introduction to Computer Science',
    description: 'Learn the fundamentals of computer science including algorithms, data structures, and programming concepts. This comprehensive course covers everything from basic programming principles to advanced algorithmic thinking.',
    instructor: 'Prof. Johnson',
    instructorBio: 'Professor Johnson has over 15 years of experience in computer science education and has published numerous papers on algorithmic efficiency.',
    thumbnail: 'https://images.pexels.com/photos/574071/pexels-photo-574071.jpeg?auto=compress&cs=tinysrgb&w=400',
    progress: 75,
    totalLessons: 24,
    completedLessons: 18,
    currentGrade: 88,
    rating: 4.8,
    totalStudents: 45,
    duration: '12 weeks',
    difficulty: 'Beginner',
    modules: [
      {
        id: 'm1',
        title: 'Introduction to Programming',
        lessons: 6,
        completed: 6,
        status: 'completed'
      },
      {
        id: 'm2',
        title: 'Data Types and Variables',
        lessons: 4,
        completed: 4,
        status: 'completed'
      },
      {
        id: 'm3',
        title: 'Control Structures',
        lessons: 5,
        completed: 5,
        status: 'completed'
      },
      {
        id: 'm4',
        title: 'Functions and Methods',
        lessons: 4,
        completed: 3,
        status: 'in-progress'
      },
      {
        id: 'm5',
        title: 'Data Structures',
        lessons: 3,
        completed: 0,
        status: 'locked'
      },
      {
        id: 'm6',
        title: 'Algorithms',
        lessons: 2,
        completed: 0,
        status: 'locked'
      }
    ],
    files: [
      { 
        id: 'f1',
        name: 'Course Syllabus.pdf', 
        type: 'pdf', 
        size: '2.3 MB',
        category: 'syllabus',
        uploadDate: '2024-01-01'
      },
      { 
        id: 'f2',
        name: 'Lecture Notes - Week 1.pdf', 
        type: 'pdf', 
        size: '1.8 MB',
        category: 'notes',
        uploadDate: '2024-01-08'
      },
      { 
        id: 'f3',
        name: 'Assignment Template.docx', 
        type: 'doc', 
        size: '0.5 MB',
        category: 'template',
        uploadDate: '2024-01-10'
      },
      { 
        id: 'f4',
        name: 'Code Examples.zip', 
        type: 'zip', 
        size: '5.2 MB',
        category: 'code',
        uploadDate: '2024-01-15'
      }
    ],
    assignments: [
      { 
        id: 'a1', 
        title: 'Data Structures Quiz', 
        dueDate: '2024-01-18', 
        status: 'submitted', 
        grade: 92,
        maxPoints: 100,
        submittedAt: '2024-01-17',
        feedback: 'Excellent work! Your understanding of linked lists is very clear.'
      },
      { 
        id: 'a2', 
        title: 'Algorithm Analysis', 
        dueDate: '2024-01-25', 
        status: 'pending', 
        grade: null,
        maxPoints: 100,
        description: 'Analyze the time complexity of various sorting algorithms and provide detailed explanations.'
      },
    ],
    announcements: [
      {
        id: 'an1',
        title: 'Midterm Exam Schedule',
        content: 'The midterm exam will be held on February 15th. Please review chapters 1-6.',
        date: '2024-01-20',
        important: true
      },
      {
        id: 'an2',
        title: 'Office Hours Update',
        content: 'Office hours have been moved to Tuesdays and Thursdays 2-4 PM.',
        date: '2024-01-18',
        important: false
      }
    ]
  }
};

export default function CourseDetailPage() {
  const params = useParams();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  
  const courseId = params.id as string;
  const course = mockCourseDetails[courseId as keyof typeof mockCourseDetails];

  if (!course) {
    return (
      <AuthGuard>
        <div className="flex h-screen bg-background">
          <DashboardSidebar />
          <main className="flex-1 overflow-y-auto">
            <div className="p-6">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-destructive mb-2">Course Not Found</h1>
                <p className="text-muted-foreground">The course you're looking for doesn't exist.</p>
                <Button asChild className="mt-4">
                  <Link href="/courses">Back to Courses</Link>
                </Button>
              </div>
            </div>
          </main>
        </div>
      </AuthGuard>
    );
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="h-4 w-4 text-red-500" />;
      case 'doc':
      case 'docx':
        return <FileText className="h-4 w-4 text-blue-500" />;
      case 'zip':
        return <File className="h-4 w-4 text-yellow-500" />;
      case 'video':
        return <Video className="h-4 w-4 text-purple-500" />;
      default:
        return <File className="h-4 w-4 text-gray-500" />;
    }
  };

  const getModuleStatus = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in-progress':
        return <Play className="h-4 w-4 text-blue-500" />;
      case 'locked':
        return <Clock className="h-4 w-4 text-gray-400" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <AuthGuard>
      <div className="flex h-screen bg-background">
        <DashboardSidebar />
        
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
              <Button variant="outline" size="icon" asChild>
                <Link href="/courses">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-foreground">{course.title}</h1>
                <p className="text-muted-foreground">Instructor: {course.instructor}</p>
              </div>
              <Button asChild>
                <Link href={`/courses/${course.id}/learn`}>
                  <Play className="h-4 w-4 mr-2" />
                  Continue Learning
                </Link>
              </Button>
            </div>

            {/* Course Hero */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex gap-6">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-48 h-32 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <Badge variant="outline">{course.difficulty}</Badge>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{course.rating}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{course.totalStudents} students</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{course.duration}</span>
                      </div>
                    </div>
                    
                    <p className="text-muted-foreground mb-4">{course.description}</p>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{course.completedLessons}/{course.totalLessons} lessons completed</span>
                      </div>
                      <Progress value={course.progress} className="h-2" />
                      <div className="flex justify-between text-sm">
                        <span>Current Grade: <span className="font-medium">{course.currentGrade}%</span></span>
                        <span>{course.progress}% complete</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="modules">Modules</TabsTrigger>
                <TabsTrigger value="assignments">Assignments</TabsTrigger>
                <TabsTrigger value="files">Files</TabsTrigger>
                <TabsTrigger value="announcements">Announcements</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <Card>
                      <CardHeader>
                        <CardTitle>Course Description</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground leading-relaxed">
                          {course.description}
                        </p>
                        <div className="mt-6">
                          <h4 className="font-medium mb-2">About the Instructor</h4>
                          <p className="text-sm text-muted-foreground">
                            {course.instructorBio}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div>
                    <Card>
                      <CardHeader>
                        <CardTitle>Course Stats</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Total Lessons</span>
                          <span className="font-medium">{course.totalLessons}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Completed</span>
                          <span className="font-medium">{course.completedLessons}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Current Grade</span>
                          <span className="font-medium">{course.currentGrade}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Duration</span>
                          <span className="font-medium">{course.duration}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Difficulty</span>
                          <span className="font-medium">{course.difficulty}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="modules" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Course Modules</CardTitle>
                    <CardDescription>
                      Track your progress through each module
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {course.modules.map((module, index) => (
                        <div key={module.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-4">
                            {getModuleStatus(module.status)}
                            <div>
                              <h4 className="font-medium">
                                Module {index + 1}: {module.title}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {module.completed}/{module.lessons} lessons completed
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <Progress 
                              value={(module.completed / module.lessons) * 100} 
                              className="w-24 h-2" 
                            />
                            <Button 
                              size="sm" 
                              disabled={module.status === 'locked'}
                              variant={module.status === 'completed' ? 'outline' : 'default'}
                            >
                              {module.status === 'completed' ? 'Review' : 
                               module.status === 'in-progress' ? 'Continue' : 
                               'Locked'}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="assignments" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Assignments</CardTitle>
                    <CardDescription>
                      View and submit your assignments
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {course.assignments.map((assignment) => (
                        <div key={assignment.id} className="p-4 border rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-medium">{assignment.title}</h4>
                              <p className="text-sm text-muted-foreground">
                                Due: {new Date(assignment.dueDate).toLocaleDateString()}
                              </p>
                              {assignment.description && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {assignment.description}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {assignment.grade !== null && (
                                <Badge variant="outline">
                                  {assignment.grade}/{assignment.maxPoints}
                                </Badge>
                              )}
                              <Badge 
                                className={
                                  assignment.status === 'submitted' 
                                    ? 'bg-green-100 text-green-800 border-green-200'
                                    : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                                }
                              >
                                {assignment.status}
                              </Badge>
                            </div>
                          </div>
                          
                          {assignment.feedback && (
                            <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                              <h5 className="text-sm font-medium mb-1">Teacher Feedback:</h5>
                              <p className="text-sm text-muted-foreground">{assignment.feedback}</p>
                            </div>
                          )}
                          
                          <div className="flex gap-2 mt-3">
                            <Button size="sm" variant="outline" asChild>
                              <Link href={`/assignments/${assignment.id}`}>
                                View Details
                              </Link>
                            </Button>
                            {assignment.status === 'pending' && (
                              <Button size="sm" asChild>
                                <Link href={`/assignments/${assignment.id}/submit`}>
                                  Submit Assignment
                                </Link>
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="files" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Course Files</CardTitle>
                    <CardDescription>
                      Download course materials and resources
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {course.files.map((file) => (
                        <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="flex items-center gap-3">
                            {getFileIcon(file.type)}
                            <div>
                              <p className="font-medium">{file.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {file.size} • Uploaded {new Date(file.uploadDate).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <Button size="sm" variant="outline">
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="announcements" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Announcements</CardTitle>
                    <CardDescription>
                      Important updates from your instructor
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {course.announcements.map((announcement) => (
                        <div key={announcement.id} className="p-4 border rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium">{announcement.title}</h4>
                            <div className="flex items-center gap-2">
                              {announcement.important && (
                                <Badge variant="destructive">Important</Badge>
                              )}
                              <span className="text-sm text-muted-foreground">
                                {new Date(announcement.date).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <p className="text-muted-foreground">{announcement.content}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}