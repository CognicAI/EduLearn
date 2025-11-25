'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { AuthGuard } from '@/lib/auth/auth-guard';
import { DashboardSidebar } from '@/components/layout/dashboard-sidebar';
import Link from 'next/link';

interface CourseFormData {
    title: string;
    description: string;
    categoryId: string;
    level: string;
    price: string;
    durationWeeks: string;
    durationHours: string;
    status: string;
}

export default function EditCoursePage() {
    const router = useRouter();
    const params = useParams();
    const courseId = params.id as string;
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [categories, setCategories] = useState<any[]>([]);
    const [formData, setFormData] = useState<CourseFormData>({
        title: '',
        description: '',
        categoryId: '',
        level: 'beginner',
        price: '0',
        durationWeeks: '',
        durationHours: '',
        status: 'draft',
    });

    const fetchCategories = React.useCallback(async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/categories`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setCategories(data.data || []);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    }, []);

    const fetchCourse = React.useCallback(async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/${courseId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();

            if (data.success) {
                const course = data.data;
                setFormData({
                    title: course.title || '',
                    description: course.description || '',
                    categoryId: String(course.category_id || ''),
                    level: course.level || 'beginner',
                    price: String(course.price || 0),
                    durationWeeks: String(course.duration_weeks || ''),
                    durationHours: String(course.duration_hours || ''),
                    status: course.status || 'draft',
                });
            } else {
                throw new Error(data.message || 'Failed to load course');
            }
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to load course',
                variant: 'destructive'
            });
        } finally {
            setPageLoading(false);
        }
    }, [courseId, toast]);

    useEffect(() => {
        fetchCategories();
        fetchCourse();
    }, [fetchCategories, fetchCourse]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title.trim()) {
            toast({
                title: 'Validation Error',
                description: 'Course title is required',
                variant: 'destructive'
            });
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/${courseId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                },
                body: JSON.stringify({
                    title: formData.title,
                    description: formData.description,
                    categoryId: formData.categoryId,
                    level: formData.level,
                    price: parseFloat(formData.price) || 0,
                    durationWeeks: parseInt(formData.durationWeeks) || null,
                    durationHours: parseInt(formData.durationHours) || null,
                    status: formData.status,
                })
            });

            const data = await response.json();

            if (data.success) {
                toast({
                    title: 'Success!',
                    description: 'Course updated successfully',
                });

                // Redirect based on user role
                const userStr = localStorage.getItem('user');
                const user = userStr ? JSON.parse(userStr) : null;
                const userRole = user?.role;

                if (userRole === 'admin') {
                    router.push('/admin/courses');
                } else {
                    router.push('/dashboard/teacher/courses');
                }
            } else {
                throw new Error(data.message || 'Failed to update course');
            }
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to update course',
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field: keyof CourseFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    if (pageLoading) {
        return (
            <AuthGuard allowedRoles={['teacher', 'admin']}>
                <div className="flex h-screen bg-background">
                    <DashboardSidebar />
                    <main className="flex-1 overflow-y-auto flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin" />
                    </main>
                </div>
            </AuthGuard>
        );
    }

    return (
        <AuthGuard allowedRoles={['teacher', 'admin']}>
            <div className="flex h-screen bg-background">
                <DashboardSidebar />

                <main className="flex-1 overflow-y-auto">
                    <div className="container max-w-4xl mx-auto py-8 space-y-6">
                        {/* Header */}
                        <div className="flex items-center gap-4">
                            <Button variant="outline" size="icon" asChild>
                                <Link href="/admin/courses">
                                    <ArrowLeft className="h-4 w-4" />
                                </Link>
                            </Button>
                            <div>
                                <h1 className="text-3xl font-bold">Edit Course</h1>
                                <p className="text-muted-foreground">
                                    Update the course details below
                                </p>
                            </div>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit}>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Course Information</CardTitle>
                                    <CardDescription>
                                        Edit the course information
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Title */}
                                    <div className="space-y-2">
                                        <Label htmlFor="title">Course Title *</Label>
                                        <Input
                                            id="title"
                                            placeholder="e.g., Introduction to Web Development"
                                            value={formData.title}
                                            onChange={(e) => handleChange('title', e.target.value)}
                                            required
                                        />
                                    </div>

                                    {/* Description */}
                                    <div className="space-y-2">
                                        <Label htmlFor="description">Description</Label>
                                        <Textarea
                                            id="description"
                                            placeholder="Describe what students will learn in this course..."
                                            rows={5}
                                            value={formData.description}
                                            onChange={(e) => handleChange('description', e.target.value)}
                                        />
                                    </div>

                                    {/* Category and Level */}
                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="category">Category *</Label>
                                            <Select
                                                value={formData.categoryId}
                                                onValueChange={(value) => handleChange('categoryId', value)}
                                                required
                                            >
                                                <SelectTrigger id="category">
                                                    <SelectValue placeholder="Select a category" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {categories.map((category) => (
                                                        <SelectItem key={category.id} value={String(category.id)}>
                                                            {category.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="level">Level</Label>
                                            <Select
                                                value={formData.level}
                                                onValueChange={(value) => handleChange('level', value)}
                                            >
                                                <SelectTrigger id="level">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="beginner">Beginner</SelectItem>
                                                    <SelectItem value="intermediate">Intermediate</SelectItem>
                                                    <SelectItem value="advanced">Advanced</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    {/* Duration and Price */}
                                    <div className="grid gap-6 md:grid-cols-3">
                                        <div className="space-y-2">
                                            <Label htmlFor="durationWeeks">Duration (Weeks)</Label>
                                            <Input
                                                id="durationWeeks"
                                                type="number"
                                                min="0"
                                                placeholder="e.g., 8"
                                                value={formData.durationWeeks}
                                                onChange={(e) => handleChange('durationWeeks', e.target.value)}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="durationHours">Duration (Hours)</Label>
                                            <Input
                                                id="durationHours"
                                                type="number"
                                                min="0"
                                                placeholder="e.g., 40"
                                                value={formData.durationHours}
                                                onChange={(e) => handleChange('durationHours', e.target.value)}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="price">Price ($)</Label>
                                            <Input
                                                id="price"
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                placeholder="0.00"
                                                value={formData.price}
                                                onChange={(e) => handleChange('price', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    {/* Status */}
                                    <div className="space-y-2">
                                        <Label htmlFor="status">Status</Label>
                                        <Select
                                            value={formData.status}
                                            onValueChange={(value) => handleChange('status', value)}
                                        >
                                            <SelectTrigger id="status">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="draft">Draft</SelectItem>
                                                <SelectItem value="published">Published</SelectItem>
                                                <SelectItem value="archived">Archived</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-4 justify-end pt-4">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => router.back()}
                                            disabled={loading}
                                        >
                                            Cancel
                                        </Button>
                                        <Button type="submit" disabled={loading}>
                                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Update Course
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </form>
                    </div>
                </main>
            </div>
        </AuthGuard>
    );
}
