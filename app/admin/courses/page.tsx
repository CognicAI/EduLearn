'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Users, Loader2, Search, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ManageTeachersDialog } from '@/components/admin/ManageTeachersDialog';
import { getAllCourses, type Course } from '@/lib/services/courseAssignments';
import { useToast } from '@/hooks/use-toast';
import { AuthGuard } from '@/lib/auth/auth-guard';
import { DashboardSidebar } from '@/components/layout/dashboard-sidebar';

export default function AdminCoursesPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const { toast } = useToast();

    const loadCourses = useCallback(async () => {
        setLoading(true);
        try {
            const filters: any = {};
            if (statusFilter !== 'all') filters.status = statusFilter;
            if (searchTerm) filters.search = searchTerm;

            const { data } = await getAllCourses(filters);
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

    const handleManageTeachers = (course: Course) => {
        setSelectedCourse(course);
        setDialogOpen(true);
    };

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
        <AuthGuard allowedRoles={['admin']}>
            <div className="flex h-screen bg-background">
                <DashboardSidebar />

                <main className="flex-1 overflow-y-auto">
                    <div className="container mx-auto py-8 px-6 space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold">Course Management</h1>
                                <p className="text-muted-foreground">
                                    Manage courses and assign teachers
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
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search courses..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
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

                        {/* Courses Table */}
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin" />
                            </div>
                        ) : courses.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-muted-foreground">No courses found</p>
                            </div>
                        ) : (
                            <div className="border rounded-lg">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Course</TableHead>
                                            <TableHead>Instructor</TableHead>
                                            <TableHead>Category</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Enrollments</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {courses.map((course) => (
                                            <TableRow key={course.id}>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium">{course.title}</div>
                                                        {course.description && (
                                                            <div className="text-sm text-muted-foreground line-clamp-1">
                                                                {course.description}
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm">
                                                        Instructor
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {course.category_name && (
                                                        <Badge variant="outline">{course.category_name}</Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={getStatusColor(course.status) as any}>
                                                        {course.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{course.enrollment_count || 0}</TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex gap-2 justify-end">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            asChild
                                                        >
                                                            <Link href={`/courses/${course.id}/edit`}>
                                                                Edit
                                                            </Link>
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleManageTeachers(course)}
                                                        >
                                                            <Users className="mr-2 h-4 w-4" />
                                                            Manage Teachers
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            asChild
                                                        >
                                                            <Link href={`/courses/${course.id}`}>
                                                                View
                                                            </Link>
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}

                        {/* Manage Teachers Dialog */}
                        {selectedCourse && (
                            <ManageTeachersDialog
                                courseId={selectedCourse.id}
                                courseTitle={selectedCourse.title}
                                open={dialogOpen}
                                onOpenChange={setDialogOpen}
                                onSuccess={() => loadCourses()}
                            />
                        )}
                    </div>
                </main>
            </div>
        </AuthGuard>
    );
}
