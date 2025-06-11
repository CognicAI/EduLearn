'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CourseWithEnrollment } from '@/lib/types/course';
import { useAuth } from '@/lib/auth/auth-context';
import { useEnrollInCourse, useUnenrollFromCourse } from '@/lib/hooks/use-courses';
import { BookOpenIcon, Users, Clock, Star, Play, UserMinus } from 'lucide-react';

interface CourseCardProps {
  course: CourseWithEnrollment;
  onEdit?: (course: CourseWithEnrollment) => void;
  onDelete?: (courseId: string) => void;
}

export function CourseCard({ course, onEdit, onDelete }: CourseCardProps) {
  const { user } = useAuth();
  const enrollMutation = useEnrollInCourse();
  const unenrollMutation = useUnenrollFromCourse();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'draft':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'published':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'archived':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getButtonText = () => {
    if (user?.role === 'teacher') {
      return 'Manage';
    }
    
    if (course.isEnrolled) {
      return course.enrollment?.progress === 100 ? 'Review' : 'Continue';
    }
    
    return 'Enroll';
  };

  const handleEnrollment = () => {
    if (course.isEnrolled) {
      unenrollMutation.mutate(course.id);
    } else {
      enrollMutation.mutate(course.id);
    }
  };

  const handleAction = () => {
    if (user?.role === 'teacher' && onEdit) {
      onEdit(course);
    } else if (user?.role === 'student') {
      if (course.isEnrolled) {
        // Navigate to course content (would be implemented later)
        console.log('Navigate to course:', course.id);
      } else {
        handleEnrollment();
      }
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-video relative overflow-hidden">
        <img
          src={course.thumbnail || 'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=400'}
          alt={course.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-4 right-4">
          <Badge className={getStatusColor(course.isEnrolled ? 'active' : course.status)}>
            {course.isEnrolled ? 'Enrolled' : course.status}
          </Badge>
        </div>
      </div>
      
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg line-clamp-2 mb-1">
              {course.title}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {course.instructorName}
            </p>
          </div>
          {course.rating && (
            <div className="flex items-center gap-1 ml-2">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">{course.rating}</span>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <CardDescription className="line-clamp-2 mb-4">
          {course.description}
        </CardDescription>
        
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{course.currentStudents} students</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{course.durationWeeks} weeks</span>
          </div>
        </div>

        {course.enrollment && (
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Progress</span>
              <span>{course.enrollment.progress}%</span>
            </div>
            <Progress value={course.enrollment.progress} className="h-2" />
          </div>
        )}
        
        <div className="flex gap-2">
          <Button className="flex-1" onClick={handleAction}>
            {user?.role === 'student' && course.isEnrolled && (
              <Play className="h-4 w-4 mr-2" />
            )}
            {user?.role === 'student' && !course.isEnrolled && (
              <BookOpenIcon className="h-4 w-4 mr-2" />
            )}
            {getButtonText()}
          </Button>
          
          {user?.role === 'student' && course.isEnrolled && (
            <Button
              variant="outline"
              size="icon"
              onClick={handleEnrollment}
              disabled={unenrollMutation.isPending}
            >
              <UserMinus className="h-4 w-4" />
            </Button>
          )}
          
          {user?.role === 'teacher' && onDelete && (
            <Button
              variant="outline"
              onClick={() => onDelete(course.id)}
              className="text-destructive hover:text-destructive"
            >
              Delete
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}