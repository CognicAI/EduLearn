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
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Plus, Edit, Trash2, Calendar as CalendarIcon, Search, Filter, FileText, Users, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

// Mock assignments data
const mockAssignments = [
  {
    id: '1',
    title: 'JavaScript Functions Quiz',
    description: 'Complete the quiz on JavaScript functions, closures, and scope.',
    courseId: '1',
    courseName: 'Introduction to Computer Science',
    dueDate: '2024-01-18',
    maxPoints: 100,
    submissions: 28,
    totalStudents: 45,
    graded: 25,
    status: 'active',
    createdAt: '2024-01-10'
  },
  {
    id: '2',
    title: 'Database Design Project',
    description: 'Design a normalized database schema for an e-commerce application.',
    courseId: '2',
    courseName: 'Database Design Fundamentals',
    dueDate: '2024-01-25',
    maxPoints: 150,
    submissions: 15,
    totalStudents: 28,
    graded: 8,
    status: 'active',
    createdAt: '2024-01-12'
  },
  {
    id: '3',
    title: 'Algorithm Analysis Report',
    description: 'Analyze the time complexity of sorting algorithms.',
    courseId: '1',
    courseName: 'Introduction to Computer Science',
    dueDate: '2024-02-01',
    maxPoints: 100,
    submissions: 5,
    totalStudents: 45,
    graded: 0,
    status: 'draft',
    createdAt: '2024-01-15'
  }
];

const mockCourses = [
  { id: '1', title: 'Introduction to Computer Science' },
  { id: '2', title: 'Advanced Web Development' },
  { id: '3', title: 'Database Design Fundamentals' }
];

export function AssignmentManagement() {
  const [assignments, setAssignments] = useState(mockAssignments);
  const [searchTerm, setSearchTerm] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<typeof mockAssignments[0] | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    courseId: '',
    dueDate: undefined as Date | undefined,
    maxPoints: '',
    status: 'draft'
  });

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = !courseFilter || courseFilter === 'all' || assignment.courseId === courseFilter;
    const matchesStatus = !statusFilter || statusFilter === 'all' || assignment.status === statusFilter;
    return matchesSearch && matchesCourse && matchesStatus;
  });

  const handleCreateAssignment = () => {
    setEditingAssignment(null);
    setFormData({
      title: '',
      description: '',
      courseId: '',
      dueDate: undefined,
      maxPoints: '',
      status: 'draft'
    });
    setIsCreateDialogOpen(true);
  };

  const handleEditAssignment = (assignment: typeof mockAssignments[0]) => {
    setEditingAssignment(assignment);
    setFormData({
      title: assignment.title,
      description: assignment.description,
      courseId: assignment.courseId,
      dueDate: new Date(assignment.dueDate),
      maxPoints: assignment.maxPoints.toString(),
      status: assignment.status
    });
    setIsCreateDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim() || !formData.courseId || !formData.dueDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    const course = mockCourses.find(c => c.id === formData.courseId);
    const assignmentData = {
      ...formData,
      courseName: course?.title || '',
      dueDate: format(formData.dueDate, 'yyyy-MM-dd'),
      maxPoints: parseInt(formData.maxPoints) || 100,
      submissions: editingAssignment?.submissions || 0,
      totalStudents: editingAssignment?.totalStudents || 0,
      graded: editingAssignment?.graded || 0,
      createdAt: editingAssignment?.createdAt || new Date().toISOString().split('T')[0]
    };

    if (editingAssignment) {
      setAssignments(prev => prev.map(assignment => 
        assignment.id === editingAssignment.id 
          ? { ...assignment, ...assignmentData }
          : assignment
      ));
      toast.success('Assignment updated successfully!');
    } else {
      const newAssignment = {
        id: Date.now().toString(),
        ...assignmentData
      };
      setAssignments(prev => [...prev, newAssignment]);
      toast.success('Assignment created successfully!');
    }

    setIsCreateDialogOpen(false);
  };

  const handleDeleteAssignment = (assignmentId: string) => {
    if (window.confirm('Are you sure you want to delete this assignment? This action cannot be undone.')) {
      setAssignments(prev => prev.filter(assignment => assignment.id !== assignmentId));
      toast.success('Assignment deleted successfully!');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'draft':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'closed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Assignment Management</h2>
          <p className="text-muted-foreground">Create and manage course assignments</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleCreateAssignment}>
              <Plus className="h-4 w-4 mr-2" />
              Create Assignment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {editingAssignment ? 'Edit Assignment' : 'Create New Assignment'}
              </DialogTitle>
              <DialogDescription>
                {editingAssignment ? 'Update assignment details' : 'Fill in the details to create a new assignment'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Assignment Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="JavaScript Functions Quiz"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="course">Course *</Label>
                  <Select value={formData.courseId} onValueChange={(value) => setFormData(prev => ({ ...prev, courseId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select course" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockCourses.map((course) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the assignment requirements..."
                  rows={3}
                  required
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Due Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.dueDate ? format(formData.dueDate, 'PPP') : 'Pick a date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.dueDate}
                        onSelect={(date) => setFormData(prev => ({ ...prev, dueDate: date }))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxPoints">Max Points</Label>
                  <Input
                    id="maxPoints"
                    type="number"
                    value={formData.maxPoints}
                    onChange={(e) => setFormData(prev => ({ ...prev, maxPoints: e.target.value }))}
                    placeholder="100"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingAssignment ? 'Update Assignment' : 'Create Assignment'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search assignments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={courseFilter} onValueChange={setCourseFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Courses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Courses</SelectItem>
            {mockCourses.map((course) => (
              <SelectItem key={course.id} value={course.id}>
                {course.title}
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
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Assignments List */}
      <div className="space-y-4">
        {filteredAssignments.map((assignment) => (
          <Card key={assignment.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CardTitle className="text-lg">{assignment.title}</CardTitle>
                    <Badge className={getStatusColor(assignment.status)}>
                      {assignment.status}
                    </Badge>
                    {isOverdue(assignment.dueDate) && assignment.status === 'active' && (
                      <Badge variant="destructive">Overdue</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">{assignment.courseName}</p>
                  <CardDescription>{assignment.description}</CardDescription>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">Due: {format(new Date(assignment.dueDate), 'MMM dd, yyyy')}</p>
                  <p className="text-sm text-muted-foreground">Max: {assignment.maxPoints} pts</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-1">
                    <Users className="h-3 w-3" />
                    <span>Submissions</span>
                  </div>
                  <p className="text-lg font-semibold">{assignment.submissions}/{assignment.totalStudents}</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-1">
                    <FileText className="h-3 w-3" />
                    <span>Graded</span>
                  </div>
                  <p className="text-lg font-semibold">{assignment.graded}/{assignment.submissions}</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-1">
                    <Clock className="h-3 w-3" />
                    <span>Pending</span>
                  </div>
                  <p className="text-lg font-semibold">{assignment.submissions - assignment.graded}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Created on {format(new Date(assignment.createdAt), 'MMM dd, yyyy')}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    View Submissions
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleEditAssignment(assignment)}>
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleDeleteAssignment(assignment.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAssignments.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No assignments found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || courseFilter || statusFilter
              ? 'Try adjusting your search or filters.'
              : 'Create your first assignment to get started.'
            }
          </p>
          {!searchTerm && !courseFilter && !statusFilter && (
            <Button onClick={handleCreateAssignment}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Assignment
            </Button>
          )}
        </div>
      )}
    </div>
  );
}