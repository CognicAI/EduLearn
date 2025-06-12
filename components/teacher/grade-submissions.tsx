'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { FileText, Download, Search, Filter, Star, MessageSquare, Clock, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

// Mock submissions data
const mockSubmissions = [
  {
    id: '1',
    assignmentId: '1',
    assignmentTitle: 'JavaScript Functions Quiz',
    studentId: '1',
    studentName: 'Alice Johnson',
    studentEmail: 'alice.johnson@email.com',
    submittedAt: '2024-01-17T14:30:00Z',
    status: 'submitted',
    grade: null,
    maxPoints: 100,
    files: [
      { name: 'quiz_answers.pdf', size: '1.2 MB' },
      { name: 'code_examples.js', size: '0.3 MB' }
    ],
    textSubmission: 'Here are my answers to the JavaScript functions quiz. I have included detailed explanations for each question...',
    feedback: null
  },
  {
    id: '2',
    assignmentId: '1',
    assignmentTitle: 'JavaScript Functions Quiz',
    studentId: '2',
    studentName: 'Bob Smith',
    studentEmail: 'bob.smith@email.com',
    submittedAt: '2024-01-16T09:15:00Z',
    status: 'graded',
    grade: 88,
    maxPoints: 100,
    files: [
      { name: 'assignment_solution.pdf', size: '2.1 MB' }
    ],
    textSubmission: 'My solutions to the JavaScript quiz with explanations...',
    feedback: 'Good work! Your understanding of closures is clear. Consider reviewing arrow functions.'
  },
  {
    id: '3',
    assignmentId: '2',
    assignmentTitle: 'Database Design Project',
    studentId: '3',
    studentName: 'Carol Davis',
    studentEmail: 'carol.davis@email.com',
    submittedAt: '2024-01-18T16:45:00Z',
    status: 'submitted',
    grade: null,
    maxPoints: 150,
    files: [
      { name: 'database_schema.sql', size: '0.8 MB' },
      { name: 'project_report.pdf', size: '3.2 MB' }
    ],
    textSubmission: 'Complete database design for e-commerce platform with normalization...',
    feedback: null
  },
  {
    id: '4',
    assignmentId: '1',
    assignmentTitle: 'JavaScript Functions Quiz',
    studentId: '4',
    studentName: 'David Wilson',
    studentEmail: 'david.wilson@email.com',
    submittedAt: '2024-01-15T11:20:00Z',
    status: 'graded',
    grade: 92,
    maxPoints: 100,
    files: [],
    textSubmission: 'Comprehensive answers with code examples and detailed explanations...',
    feedback: 'Excellent work! Your code examples are well-structured and demonstrate deep understanding.'
  }
];

const mockAssignments = [
  { id: '1', title: 'JavaScript Functions Quiz' },
  { id: '2', title: 'Database Design Project' },
  { id: '3', title: 'Algorithm Analysis Report' }
];

export function GradeSubmissions() {
  const [submissions, setSubmissions] = useState(mockSubmissions);
  const [searchTerm, setSearchTerm] = useState('');
  const [assignmentFilter, setAssignmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState<typeof mockSubmissions[0] | null>(null);
  const [isGradeDialogOpen, setIsGradeDialogOpen] = useState(false);
  const [gradeForm, setGradeForm] = useState({
    grade: '',
    feedback: ''
  });

  const filteredSubmissions = submissions.filter(submission => {
    const matchesSearch = submission.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         submission.assignmentTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAssignment = !assignmentFilter || assignmentFilter === 'all' || submission.assignmentId === assignmentFilter;
    const matchesStatus = !statusFilter || statusFilter === 'all' || submission.status === statusFilter;
    return matchesSearch && matchesAssignment && matchesStatus;
  });

  const handleGradeSubmission = (submission: typeof mockSubmissions[0]) => {
    setSelectedSubmission(submission);
    setGradeForm({
      grade: submission.grade?.toString() || '',
      feedback: submission.feedback || ''
    });
    setIsGradeDialogOpen(true);
  };

  const handleSubmitGrade = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedSubmission) return;
    
    const grade = parseInt(gradeForm.grade);
    if (isNaN(grade) || grade < 0 || grade > selectedSubmission.maxPoints) {
      toast.error(`Grade must be between 0 and ${selectedSubmission.maxPoints}`);
      return;
    }

    setSubmissions(prev => prev.map(submission => 
      submission.id === selectedSubmission.id 
        ? { 
            ...submission, 
            grade,
            feedback: gradeForm.feedback,
            status: 'graded'
          }
        : submission
    ));

    toast.success('Grade submitted successfully!');
    setIsGradeDialogOpen(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'graded':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'submitted':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'late':
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
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Grade Submissions</h2>
          <p className="text-muted-foreground">Review and grade student submissions</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline">
            {submissions.filter(s => s.status === 'submitted').length} pending
          </Badge>
          <Badge variant="outline">
            {submissions.filter(s => s.status === 'graded').length} graded
          </Badge>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search by student name or assignment..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={assignmentFilter} onValueChange={setAssignmentFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Assignments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Assignments</SelectItem>
            {mockAssignments.map((assignment) => (
              <SelectItem key={assignment.id} value={assignment.id}>
                {assignment.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-32">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="submitted">Submitted</SelectItem>
            <SelectItem value="graded">Graded</SelectItem>
            <SelectItem value="late">Late</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Submissions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Submissions</CardTitle>
          <CardDescription>
            Student submissions requiring review and grading
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Assignment</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubmissions.map((submission) => (
                <TableRow key={submission.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="" alt={submission.studentName} />
                        <AvatarFallback className="text-xs">
                          {getInitials(submission.studentName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{submission.studentName}</p>
                        <p className="text-xs text-muted-foreground">{submission.studentEmail}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{submission.assignmentTitle}</p>
                      <p className="text-xs text-muted-foreground">Max: {submission.maxPoints} pts</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm">{format(new Date(submission.submittedAt), 'MMM dd, yyyy')}</p>
                      <p className="text-xs text-muted-foreground">{format(new Date(submission.submittedAt), 'HH:mm')}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(submission.status)}>
                      {getStatusIcon(submission.status)}
                      <span className="ml-1">{submission.status}</span>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {submission.grade !== null ? (
                      <div className="flex items-center gap-1">
                        <span className="font-medium">{submission.grade}/{submission.maxPoints}</span>
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${
                                i < (submission.grade! / submission.maxPoints) * 5
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Not graded</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <FileText className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={() => handleGradeSubmission(submission)}
                        disabled={submission.status === 'graded'}
                      >
                        <MessageSquare className="h-4 w-4 mr-1" />
                        {submission.status === 'graded' ? 'Graded' : 'Grade'}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredSubmissions.length === 0 && (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No submissions found</h3>
              <p className="text-muted-foreground">
                {searchTerm || assignmentFilter || statusFilter
                  ? 'Try adjusting your search or filters.'
                  : 'No submissions available for grading.'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Grade Dialog */}
      <Dialog open={isGradeDialogOpen} onOpenChange={setIsGradeDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Grade Submission</DialogTitle>
            <DialogDescription>
              {selectedSubmission && (
                <>Grade {selectedSubmission.studentName}'s submission for {selectedSubmission.assignmentTitle}</>
              )}
            </DialogDescription>
          </DialogHeader>
          
          {selectedSubmission && (
            <div className="space-y-6">
              {/* Submission Details */}
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Student</Label>
                  <p className="text-sm text-muted-foreground">{selectedSubmission.studentName}</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Submitted Files</Label>
                  {selectedSubmission.files.length > 0 ? (
                    <div className="space-y-2 mt-1">
                      {selectedSubmission.files.map((file, index) => (
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
                  ) : (
                    <p className="text-sm text-muted-foreground">No files submitted</p>
                  )}
                </div>
                
                {selectedSubmission.textSubmission && (
                  <div>
                    <Label className="text-sm font-medium">Text Submission</Label>
                    <div className="mt-1 p-3 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        {selectedSubmission.textSubmission}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Grading Form */}
              <form onSubmit={handleSubmitGrade} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="grade">Grade (out of {selectedSubmission.maxPoints})</Label>
                    <Input
                      id="grade"
                      type="number"
                      min="0"
                      max={selectedSubmission.maxPoints}
                      value={gradeForm.grade}
                      onChange={(e) => setGradeForm(prev => ({ ...prev, grade: e.target.value }))}
                      placeholder="85"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Percentage</Label>
                    <div className="flex items-center h-10 px-3 border rounded-md bg-muted">
                      <span className="text-sm text-muted-foreground">
                        {gradeForm.grade ? Math.round((parseInt(gradeForm.grade) / selectedSubmission.maxPoints) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="feedback">Feedback</Label>
                  <Textarea
                    id="feedback"
                    value={gradeForm.feedback}
                    onChange={(e) => setGradeForm(prev => ({ ...prev, feedback: e.target.value }))}
                    placeholder="Provide constructive feedback for the student..."
                    rows={4}
                  />
                </div>
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsGradeDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    Submit Grade
                  </Button>
                </div>
              </form>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}