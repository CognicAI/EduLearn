'use client';

import { useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { AuthGuard } from '@/lib/auth/auth-guard';
import { DashboardSidebar } from '@/components/layout/dashboard-sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  FileText, 
  Download, 
  CheckCircle, 
  AlertCircle,
  MessageSquare,
  Star,
  Upload
} from 'lucide-react';
import Link from 'next/link';

// Mock assignment data with feedback
const mockAssignmentDetails = {
  'a1': {
    id: 'a1',
    title: 'Data Structures Quiz',
    course: 'Introduction to Computer Science',
    courseId: '1',
    description: 'Complete the quiz on JavaScript functions, closures, and scope. This quiz covers fundamental concepts that are essential for understanding advanced programming topics.',
    dueDate: '2024-01-18',
    submittedAt: '2024-01-17T14:30:00Z',
    maxPoints: 100,
    grade: 92,
    status: 'graded',
    feedback: {
      overall: 'Excellent work! Your understanding of linked lists and binary trees is very clear. The explanations are well-structured and demonstrate deep comprehension of the material.',
      strengths: [
        'Clear explanation of time complexity',
        'Good use of examples',
        'Well-organized presentation'
      ],
      improvements: [
        'Could include more edge cases in analysis',
        'Consider discussing space complexity as well'
      ],
      rubric: [
        { criteria: 'Understanding of Concepts', points: 25, earned: 24 },
        { criteria: 'Code Quality', points: 25, earned: 23 },
        { criteria: 'Documentation', points: 25, earned: 23 },
        { criteria: 'Testing & Examples', points: 25, earned: 22 }
      ]
    },
    submittedFiles: [
      { name: 'data_structures_analysis.pdf', size: '2.3 MB', type: 'pdf' },
      { name: 'code_examples.zip', size: '1.1 MB', type: 'zip' }
    ],
    submissionText: 'This assignment analyzes various data structures including arrays, linked lists, stacks, queues, and trees. I have provided detailed explanations of their time and space complexities along with practical examples...',
    requirements: [
      'Analyze at least 5 different data structures',
      'Include time complexity analysis',
      'Provide code examples',
      'Minimum 1000 words'
    ]
  },
  'a2': {
    id: 'a2',
    title: 'Algorithm Analysis Report',
    course: 'Introduction to Computer Science',
    courseId: '1',
    description: 'Analyze the time complexity of various sorting algorithms and provide detailed explanations with examples.',
    dueDate: '2024-01-25',
    submittedAt: null,
    maxPoints: 100,
    grade: null,
    status: 'pending',
    feedback: null,
    submittedFiles: [],
    submissionText: '',
    requirements: [
      'Minimum 1500 words',
      'Include code examples',
      'Provide performance graphs',
      'Use proper citations'
    ]
  }
};

export default function AssignmentDetailPage() {
  const params = useParams();
  const { user } = useAuth();
  
  const assignmentId = params.id as string;
  const assignment = mockAssignmentDetails[assignmentId as keyof typeof mockAssignmentDetails];

  if (!assignment) {
    return (
      <AuthGuard allowedRoles={['student']}>
        <div className="flex h-screen bg-background">
          <DashboardSidebar />
          <main className="flex-1 overflow-y-auto">
            <div className="p-6">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-destructive mb-2">Assignment Not Found</h1>
                <p className="text-muted-foreground">The assignment you're looking for doesn't exist.</p>
                <Button asChild className="mt-4">
                  <Link href="/assignments">Back to Assignments</Link>
                </Button>
              </div>
            </div>
          </main>
        </div>
      </AuthGuard>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'graded':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'submitted':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'overdue':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'graded':
        return <CheckCircle className="h-4 w-4" />;
      case 'submitted':
        return <Clock className="h-4 w-4" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const isOverdue = new Date(assignment.dueDate) < new Date() && assignment.status === 'pending';

  return (
    <AuthGuard allowedRoles={['student']}>
      <div className="flex h-screen bg-background">
        <DashboardSidebar />
        
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
              <Button variant="outline" size="icon" asChild>
                <Link href="/assignments">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-foreground">{assignment.title}</h1>
                <p className="text-muted-foreground">{assignment.course}</p>
              </div>
              {assignment.status === 'pending' && (
                <Button asChild>
                  <Link href={`/assignments/${assignment.id}/submit`}>
                    <Upload className="h-4 w-4 mr-2" />
                    Submit Assignment
                  </Link>
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Assignment Overview */}
              <div className="lg:col-span-2 space-y-6">
                {/* Assignment Details */}
                <Card>
                  <CardHeader>
                    <CardTitle>Assignment Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-muted-foreground leading-relaxed">
                        {assignment.description}
                      </p>
                      
                      <div>
                        <h4 className="font-medium mb-2">Requirements:</h4>
                        <ul className="space-y-1">
                          {assignment.requirements.map((req, index) => (
                            <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                              <CheckCircle className="h-3 w-3 text-green-500" />
                              {req}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Submission */}
                {assignment.submittedAt && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Your Submission</CardTitle>
                      <CardDescription>
                        Submitted on {new Date(assignment.submittedAt).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {assignment.submittedFiles.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Submitted Files:</h4>
                          <div className="space-y-2">
                            {assignment.submittedFiles.map((file, index) => (
                              <div key={index} className="flex items-center justify-between p-2 border rounded">
                                <div className="flex items-center gap-2">
                                  <FileText className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm">{file.name}</span>
                                  <span className="text-xs text-muted-foreground">({file.size})</span>
                                </div>
                                <Button size="sm" variant="outline">
                                  <Download className="h-4 w-4 mr-1" />
                                  Download
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {assignment.submissionText && (
                        <div>
                          <h4 className="font-medium mb-2">Text Submission:</h4>
                          <div className="p-3 bg-muted/50 rounded-lg">
                            <p className="text-sm text-muted-foreground">
                              {assignment.submissionText}
                            </p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Feedback */}
                {assignment.feedback && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        Teacher Feedback
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Overall Feedback */}
                      <div>
                        <h4 className="font-medium mb-2">Overall Comments:</h4>
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-sm text-blue-800">{assignment.feedback.overall}</p>
                        </div>
                      </div>

                      {/* Strengths and Improvements */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium mb-2 text-green-700">Strengths:</h4>
                          <ul className="space-y-1">
                            {assignment.feedback.strengths.map((strength, index) => (
                              <li key={index} className="flex items-center gap-2 text-sm">
                                <CheckCircle className="h-3 w-3 text-green-500" />
                                <span className="text-green-700">{strength}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-2 text-orange-700">Areas for Improvement:</h4>
                          <ul className="space-y-1">
                            {assignment.feedback.improvements.map((improvement, index) => (
                              <li key={index} className="flex items-center gap-2 text-sm">
                                <AlertCircle className="h-3 w-3 text-orange-500" />
                                <span className="text-orange-700">{improvement}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Rubric */}
                      <div>
                        <h4 className="font-medium mb-3">Grading Rubric:</h4>
                        <div className="space-y-3">
                          {assignment.feedback.rubric.map((item, index) => (
                            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                              <span className="text-sm font-medium">{item.criteria}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">
                                  {item.earned}/{item.points}
                                </span>
                                <div className="flex">
                                  {Array.from({ length: 5 }).map((_, starIndex) => (
                                    <Star
                                      key={starIndex}
                                      className={`h-4 w-4 ${
                                        starIndex < (item.earned / item.points) * 5
                                          ? 'fill-yellow-400 text-yellow-400'
                                          : 'text-gray-300'
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Assignment Info */}
                <Card>
                  <CardHeader>
                    <CardTitle>Assignment Info</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Status</span>
                      <Badge className={getStatusColor(isOverdue ? 'overdue' : assignment.status)}>
                        {getStatusIcon(isOverdue ? 'overdue' : assignment.status)}
                        <span className="ml-1">
                          {isOverdue ? 'Overdue' : assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                        </span>
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Due Date</span>
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3" />
                        {new Date(assignment.dueDate).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Max Points</span>
                      <span className="text-sm font-medium">{assignment.maxPoints}</span>
                    </div>
                    
                    {assignment.grade !== null && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Your Grade</span>
                        <span className="text-sm font-medium text-green-600">
                          {assignment.grade}/{assignment.maxPoints} ({Math.round((assignment.grade / assignment.maxPoints) * 100)}%)
                        </span>
                      </div>
                    )}
                    
                    {assignment.submittedAt && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Submitted</span>
                        <span className="text-sm">
                          {new Date(assignment.submittedAt).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {assignment.status === 'pending' && (
                      <Button className="w-full" asChild>
                        <Link href={`/assignments/${assignment.id}/submit`}>
                          <Upload className="h-4 w-4 mr-2" />
                          Submit Assignment
                        </Link>
                      </Button>
                    )}
                    
                    <Button variant="outline" className="w-full" asChild>
                      <Link href={`/courses/${assignment.courseId}`}>
                        <FileText className="h-4 w-4 mr-2" />
                        View Course
                      </Link>
                    </Button>
                    
                    {assignment.submittedFiles.length > 0 && (
                      <Button variant="outline" className="w-full">
                        <Download className="h-4 w-4 mr-2" />
                        Download Submission
                      </Button>
                    )}
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