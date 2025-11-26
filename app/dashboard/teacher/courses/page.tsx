'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { PermissionBadge } from '@/components/courses/PermissionBadge';
import { getTeacherCourses, type Course } from '@/lib/services/courseAssignments';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { AuthGuard } from '@/lib/auth/auth-guard';
import { DashboardSidebar } from '@/components/layout/dashboard-sidebar';

export default function TeacherCoursesPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [ownershipFilter, setOwnershipFilter] = useState<string>('all'); // all, owned, assigned
    const { toast } = useToast();

    const loadCourses = useCallback(async () => {
        setLoading(true);
        try {
            const filters: any = {};
            if (statusFilter !== 'all') filters.status = statusFilter;
            if (searchTerm) filters.search = searchTerm;

            const { data } = await getTeacherCourses(filters);
            setCourses(data);
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to load courses',
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    }, [statusFilter, searchTerm, toast]);

    useEffect(() => {
        loadCourses();
    }, [loadCourses]);

    // Filter courses based on ownership
    const filteredCourses = courses.filter(course => {
        if (ownershipFilter === 'owned') return course.is_owner;
        if (ownershipFilter === 'assigned') return !course.is_owner;
        return true; // all
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'published':
                return 'success';
            case 'draft':
                return 'warning';
            case 'archived':
                return 'destructive';
            default:
                return 'default';
        }
    };

    return (
        <AuthGuard allowedRoles={['teacher']}>
            <div className="flex h-screen bg-background">
                <DashboardSidebar />

                <main className="flex-1 overflow-y-auto">
                    <div className="container mx-auto py-8 px-6 space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold">My Courses</h1>
                                <p className="text-muted-foreground">
                                    Courses you created and courses assigned to you
                                </p>
                            </div>
                            <Button asChild>
                                <Link href="/courses/create">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create Course
                                </Link>
                            </Button>
                        </div>

                        {/* Filters */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Input
                                placeholder="Search courses..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="flex-1"
                            />
                            <Select value={ownershipFilter} onValueChange={setOwnershipFilter}>
                                <SelectTrigger className="w-full sm:w-48">
                                    <SelectValue placeholder="Filter by ownership" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Courses</SelectItem>
                                    <SelectItem value="owned">My Courses</SelectItem>
                                    <SelectItem value="assigned">Assigned to Me</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-full sm:w-48">
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="draft">Draft</SelectItem>
                                    <SelectItem value="published">Published</SelectItem>
                                    <SelectItem value="archived">Archived</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Statistics */}
                        <div className="grid gap-4 md:grid-cols-3">
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardDescription>Total Courses</CardDescription>
                                    <CardTitle className="text-2xl">{courses.length}</CardTitle>
                                </CardHeader>
                            </Card>
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardDescription>Courses I Own</CardDescription>
                                    <CardTitle className="text-2xl">
                                        {courses.filter(c => c.is_owner).length}
                                    </CardTitle>
                                </CardHeader>
                            </Card>
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardDescription>Assigned to Me</CardDescription>
                                    <CardTitle className="text-2xl">
                                        {courses.filter(c => !c.is_owner).length}
                                    </CardTitle>
                                </CardHeader>
                            </Card>
                        </div>

                        {/* Courses Grid */}
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin" />
                            </div>
                        ) : filteredCourses.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-muted-foreground">No courses found</p>
                            </div>
                        ) : (
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {filteredCourses.map((course) => (
                                    <Card
                                        key={course.id}
                                        className={course.is_owner ? 'border-primary/50' : 'border-dashed'}
                                    >
                                        <CardHeader>
                                            <div className="flex items-start justify-between gap-2">
                                                <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                                                <PermissionBadge
                                                    isOwner={course.is_owner}
                                                    canEdit={course.can_edit}
                                                    canDelete={course.can_delete}
                                                />
                                            </div>
                                            {course.category_name && (
                                                <Badge variant="outline" className="w-fit">
                                                    {course.category_name}
                                                </Badge>
                                            )}
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-muted-foreground line-clamp-3">
                                                {course.description || 'No description available'}
                                            </p>
                                            <div className="mt-4 flex items-center justify-between text-sm">
                                                <div className="flex items-center gap-2">
                                                    <Badge variant={getStatusColor(course.status) as any}>
                                                        {course.status}
                                                    </Badge>
                                                    {course.level && (
                                                        <Badge variant="secondary">{course.level}</Badge>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                                                <span>{course.module_count || 0} modules</span>
                                                <span>{course.lesson_count || 0} lessons</span>
                                                <span>{course.enrollment_count || 0} students</span>
                                            </div>
                                        </CardContent>
                                        <CardFooter className="flex gap-2">
                                            <Button variant="outline" asChild className="flex-1">
                                                <Link href={`/courses/${course.id}`}>
                                                    View Course
                                                </Link>
                                            </Button>
                                            {(course.is_owner || course.can_edit) && (
                                                <Button asChild className="flex-1">
                                                    <Link href={`/courses/${course.id}/edit`}>
                                                        Edit Course
                                                    </Link>
                                                </Button>
                                            )}
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </AuthGuard>
    );
}
