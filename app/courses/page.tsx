'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { AuthGuard } from '@/lib/auth/auth-guard';
import { DashboardSidebar } from '@/components/layout/dashboard-sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { CourseCard } from '@/components/courses/course-card';
import { CourseForm } from '@/components/courses/course-form';
import { useCourses, useDeleteCourse } from '@/lib/hooks/use-courses';
import { CourseWithEnrollment, Course } from '@/lib/types/course';
import { BookOpenIcon, Search, Plus, Filter } from 'lucide-react';

function CoursesSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <Skeleton className="aspect-video w-full" />
          <CardHeader className="pb-3">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <div className="flex justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function CoursesPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | undefined>();

  const deleteMutation = useDeleteCourse();

  // Build query parameters
  const queryParams = {
    page: currentPage,
    limit: 12,
    search: searchTerm,
    status: statusFilter,
    ...(user?.role === 'teacher' && { instructorId: user.id }),
  };

  const { data: coursesData, isLoading, error } = useCourses(queryParams);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value === 'all' ? '' : value);
    setCurrentPage(1);
  };

  const handleCreateCourse = () => {
    setEditingCourse(undefined);
    setShowCourseForm(true);
  };

  const handleEditCourse = (course: CourseWithEnrollment) => {
    setEditingCourse(course);
    setShowCourseForm(true);
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      deleteMutation.mutate(courseId);
    }
  };

  const getPageTitle = () => {
    switch (user?.role) {
      case 'teacher':
        return 'My Courses';
      case 'student':
        return 'Courses';
      case 'admin':
        return 'All Courses';
      default:
        return 'Courses';
    }
  };

  const getPageDescription = () => {
    switch (user?.role) {
      case 'teacher':
        return 'Manage and create your courses';
      case 'student':
        return 'Discover and enroll in courses to advance your learning';
      case 'admin':
        return 'Manage all courses on the platform';
      default:
        return 'Browse available courses';
    }
  };

  if (error) {
    return (
      <AuthGuard>
        <div className="flex h-screen bg-background">
          <DashboardSidebar />
          <main className="flex-1 overflow-y-auto">
            <div className="p-6">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-destructive mb-2">Error Loading Courses</h1>
                <p className="text-muted-foreground">Please try refreshing the page.</p>
              </div>
            </div>
          </main>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="flex h-screen bg-background">
        <DashboardSidebar />
        
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  {getPageTitle()}
                </h1>
                <p className="text-muted-foreground mt-2">
                  {getPageDescription()}
                </p>
              </div>
              {user?.role === 'teacher' && (
                <Button onClick={handleCreateCourse}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Course
                </Button>
              )}
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Select value={statusFilter || 'all'} onValueChange={handleStatusFilter}>
                  <SelectTrigger className="w-40">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Courses</SelectItem>
                    {user?.role === 'student' && (
                      <>
                        <SelectItem value="enrolled">My Courses</SelectItem>
                        <SelectItem value="available">Available</SelectItem>
                      </>
                    )}
                    {user?.role === 'teacher' && (
                      <>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Courses Grid */}
            {isLoading ? (
              <CoursesSkeleton />
            ) : coursesData?.courses.length === 0 ? (
              <div className="text-center py-12">
                <BookOpenIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No courses found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || statusFilter
                    ? 'Try adjusting your search or filters.'
                    : user?.role === 'teacher'
                    ? 'Create your first course to get started.'
                    : 'No courses are available at the moment.'
                  }
                </p>
                {user?.role === 'teacher' && !searchTerm && !statusFilter && (
                  <Button onClick={handleCreateCourse}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Course
                  </Button>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {coursesData?.courses.map((course) => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      onEdit={user?.role === 'teacher' ? handleEditCourse : undefined}
                      onDelete={user?.role === 'teacher' ? handleDeleteCourse : undefined}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {coursesData && coursesData.totalPages > 1 && (
                  <div className="flex justify-center mt-12">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      <span className="flex items-center px-4 text-sm text-muted-foreground">
                        Page {currentPage} of {coursesData.totalPages}
                      </span>
                      <Button
                        variant="outline"
                        onClick={() => setCurrentPage(prev => Math.min(coursesData.totalPages, prev + 1))}
                        disabled={currentPage === coursesData.totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>

      {/* Course Form Modal */}
      <CourseForm
        open={showCourseForm}
        onOpenChange={setShowCourseForm}
        course={editingCourse}
        mode={editingCourse ? 'edit' : 'create'}
      />
    </AuthGuard>
  );
}