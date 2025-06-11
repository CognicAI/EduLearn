'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { AuthGuard } from '@/lib/auth/auth-guard';
import { DashboardSidebar } from '@/components/layout/dashboard-sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Upload, 
  FileText, 
  Calendar, 
  Clock, 
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

// Mock assignment data
const mockAssignment = {
  id: 'a2',
  title: 'Algorithm Analysis Report',
  course: 'Introduction to Computer Science',
  courseId: '1',
  description: 'Analyze the time complexity of various sorting algorithms (Bubble Sort, Quick Sort, Merge Sort) and provide detailed explanations with examples. Include Big O notation analysis and performance comparisons.',
  dueDate: '2024-01-25',
  maxPoints: 100,
  requirements: [
    'Minimum 1500 words',
    'Include code examples',
    'Provide performance graphs',
    'Use proper citations'
  ],
  submissionTypes: ['file', 'text'],
  allowedFileTypes: ['.pdf', '.doc', '.docx'],
  maxFileSize: '10 MB'
};

// Mock enrolled courses for dropdown
const mockEnrolledCourses = [
  { id: '1', title: 'Introduction to Computer Science' },
  { id: '2', title: 'Advanced Web Development' },
  { id: '3', title: 'Database Design Fundamentals' }
];

export default function SubmitAssignmentPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const assignmentId = params.id as string;
  const assignment = mockAssignment; // In real app, fetch by assignmentId
  
  const [selectedCourse, setSelectedCourse] = useState(assignment.courseId);
  const [submissionText, setSubmissionText] = useState('');
  const [comments, setComments] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    // Validate file types
    const allowedTypes = assignment.allowedFileTypes;
    const invalidFiles = files.filter(file => 
      !allowedTypes.some(type => file.name.toLowerCase().endsWith(type))
    );
    
    if (invalidFiles.length > 0) {
      toast.error(`Invalid file types. Allowed: ${allowedTypes.join(', ')}`);
      return;
    }
    
    // Validate file size (10MB = 10 * 1024 * 1024 bytes)
    const maxSize = 10 * 1024 * 1024;
    const oversizedFiles = files.filter(file => file.size > maxSize);
    
    if (oversizedFiles.length > 0) {
      toast.error(`Files too large. Maximum size: ${assignment.maxFileSize}`);
      return;
    }
    
    setUploadedFiles(prev => [...prev, ...files]);
    toast.success(`${files.length} file(s) uploaded successfully`);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!submissionText.trim() && uploadedFiles.length === 0) {
      toast.error('Please provide either text submission or upload files');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('Assignment submitted successfully!');
      router.push('/assignments');
    } catch (error) {
      toast.error('Failed to submit assignment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isOverdue = new Date(assignment.dueDate) < new Date();
  const daysUntilDue = Math.ceil((new Date(assignment.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

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
                <h1 className="text-3xl font-bold text-foreground">Submit Assignment</h1>
                <p className="text-muted-foreground">{assignment.title}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Assignment Details */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle>Assignment Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Course</Label>
                      <p className="text-sm text-muted-foreground">{assignment.course}</p>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium">Due Date</Label>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {new Date(assignment.dueDate).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                      {isOverdue ? (
                        <Badge variant="destructive" className="mt-1">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Overdue
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="mt-1">
                          <Clock className="h-3 w-3 mr-1" />
                          {daysUntilDue} days left
                        </Badge>
                      )}
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium">Max Points</Label>
                      <p className="text-sm text-muted-foreground">{assignment.maxPoints} points</p>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium">Requirements</Label>
                      <ul className="text-sm text-muted-foreground space-y-1 mt-1">
                        {assignment.requirements.map((req, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium">Allowed File Types</Label>
                      <p className="text-sm text-muted-foreground">
                        {assignment.allowedFileTypes.join(', ')}
                      </p>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium">Max File Size</Label>
                      <p className="text-sm text-muted-foreground">{assignment.maxFileSize}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Submission Form */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Assignment Submission</CardTitle>
                    <CardDescription>
                      {assignment.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Course Selection */}
                      <div className="space-y-2">
                        <Label htmlFor="course">Course</Label>
                        <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select course" />
                          </SelectTrigger>
                          <SelectContent>
                            {mockEnrolledCourses.map((course) => (
                              <SelectItem key={course.id} value={course.id}>
                                {course.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* File Upload */}
                      <div className="space-y-2">
                        <Label htmlFor="file-upload">Upload Files</Label>
                        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                          <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground mb-2">
                            Drag and drop files here, or click to browse
                          </p>
                          <Input
                            id="file-upload"
                            type="file"
                            multiple
                            accept={assignment.allowedFileTypes.join(',')}
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => document.getElementById('file-upload')?.click()}
                          >
                            Choose Files
                          </Button>
                        </div>
                        
                        {/* Uploaded Files */}
                        {uploadedFiles.length > 0 && (
                          <div className="space-y-2">
                            <Label>Uploaded Files</Label>
                            {uploadedFiles.map((file, index) => (
                              <div key={index} className="flex items-center justify-between p-2 border rounded">
                                <div className="flex items-center gap-2">
                                  <FileText className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm">{file.name}</span>
                                  <span className="text-xs text-muted-foreground">
                                    ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                  </span>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeFile(index)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Text Submission */}
                      <div className="space-y-2">
                        <Label htmlFor="submission-text">Text Submission</Label>
                        <Textarea
                          id="submission-text"
                          placeholder="Enter your assignment submission here..."
                          value={submissionText}
                          onChange={(e) => setSubmissionText(e.target.value)}
                          rows={10}
                          className="min-h-[200px]"
                        />
                        <p className="text-xs text-muted-foreground">
                          {submissionText.length} characters
                        </p>
                      </div>

                      {/* Comments */}
                      <div className="space-y-2">
                        <Label htmlFor="comments">Comments (Optional)</Label>
                        <Textarea
                          id="comments"
                          placeholder="Any additional comments for your instructor..."
                          value={comments}
                          onChange={(e) => setComments(e.target.value)}
                          rows={3}
                        />
                      </div>

                      {/* Submit Button */}
                      <div className="flex gap-4">
                        <Button
                          type="submit"
                          disabled={isSubmitting || (!submissionText.trim() && uploadedFiles.length === 0)}
                          className="flex-1"
                        >
                          {isSubmitting ? (
                            <>
                              <Upload className="h-4 w-4 mr-2 animate-spin" />
                              Submitting...
                            </>
                          ) : (
                            <>
                              <Upload className="h-4 w-4 mr-2" />
                              Submit Assignment
                            </>
                          )}
                        </Button>
                        <Button type="button" variant="outline" asChild>
                          <Link href="/assignments">Cancel</Link>
                        </Button>
                      </div>
                    </form>
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