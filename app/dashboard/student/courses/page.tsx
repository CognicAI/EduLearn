'use client';

import { useAuth } from '@/lib/auth/auth-context';
import { AuthGuard } from '@/lib/auth/auth-guard';
import { DashboardSidebar } from '@/components/layout/dashboard-sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { BookOpenIcon, Clock, Users, Eye, Search } from 'lucide-react';
import { useStudentCourses } from '@/lib/hooks/use-courses';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

function CoursesSkeleton() {
    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-10 w-64" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i} className="flex flex-col">
                        <CardHeader>
                            <Skeleton className="h-4 w-20 mb-2" />
                            <Skeleton className="h-6 w-full mb-2" />
                            <Skeleton className="h-4 w-32" />
                        </CardHeader>
                        <CardContent className="flex-1 space-y-4">
                            <Skeleton className="h-2 w-full" />
                            <Skeleton className="h-8 w-full" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}

export default function StudentCoursesPage() {
    const { user } = useAuth();
    const { data: courses, isLoading, error } = useStudentCourses();
    const [searchQuery, setSearchQuery] = useState('');

    const filteredCourses = courses?.filter(course =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.instructor.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (error) {
        return (
            <AuthGuard allowedRoles={['student']}>
                <div className="flex h-screen bg-background">
                    <DashboardSidebar />
                    <main className="flex-1 overflow-y-auto">
                        <div className="p-6 text-center">
                            <h1 className="text-2xl font-bold text-destructive mb-2">Error Loading Courses</h1>
                            <p className="text-muted-foreground">Please try refreshing the page.</p>
                        </div>
                    </main>
                </div>
            </AuthGuard>
        );
    }

    return (
        <AuthGuard allowedRoles={['student']}>
            <div className="flex h-screen bg-background">
                <DashboardSidebar />
                <main className="flex-1 overflow-y-auto">
                    {isLoading ? (
                        <CoursesSkeleton />
                    ) : (
                        <div className="p-6 space-y-6">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div>
                                    <h1 className="text-3xl font-bold text-foreground">My Courses</h1>
                                    <p className="text-muted-foreground mt-1">
                                        Continue learning where you left off
                                    </p>
                                </div>
                                <div className="relative w-full md:w-64">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search courses..."
                                        className="pl-8"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </div>

                            {filteredCourses?.length === 0 ? (
                                <div className="text-center py-12 border rounded-lg bg-card">
                                    <BookOpenIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                    <h3 className="text-lg font-medium text-foreground">No courses found</h3>
                                    <p className="text-muted-foreground mt-2">
                                        {searchQuery ? 'Try adjusting your search terms' : 'You are not enrolled in any courses yet'}
                                    </p>
                                    {!searchQuery && (
                                        <Button className="mt-4" asChild>
                                            <Link href="/courses">Browse Courses</Link>
                                        </Button>
                                    )}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredCourses?.map((course) => (
                                        <Card key={course.id} className="flex flex-col hover:shadow-md transition-shadow">
                                            <CardHeader>
                                                <div className="flex justify-between items-start mb-2">
                                                    <Badge variant={course.status === 'active' ? 'default' : 'secondary'}>
                                                        {course.status}
                                                    </Badge>
                                                </div>
                                                <CardTitle className="line-clamp-2 text-xl">{course.title}</CardTitle>
                                                <CardDescription className="flex items-center mt-1">
                                                    <Users className="h-4 w-4 mr-1" />
                                                    {course.instructor}
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent className="flex-1 flex flex-col justify-end space-y-4">
                                                <div className="space-y-2">
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-muted-foreground">Progress</span>
                                                        <span className="font-medium">{course.progress}%</span>
                                                    </div>
                                                    <Progress value={course.progress} className="h-2" />
                                                </div>

                                                {course.next_deadline && (
                                                    <div className="flex items-center text-sm text-amber-500 bg-amber-500/10 p-2 rounded">
                                                        <Clock className="h-3 w-3 mr-2" />
                                                        <span className="truncate">Next due: {course.next_deadline}</span>
                                                    </div>
                                                )}

                                                <Button className="w-full" asChild>
                                                    <Link href={`/courses/${course.id}`}>
                                                        <Eye className="h-4 w-4 mr-2" />
                                                        View Course
                                                    </Link>
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>
        </AuthGuard>
    );
}
