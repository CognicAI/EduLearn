'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
import { authService } from '@/lib/auth/auth-service';

interface CourseFormData {
    title: string;
    description: string;
    categoryId: string;
    level: string;
    price: string;
    durationWeeks: string;
    durationHours: string;
}

export default function CreateCoursePage() {
    const router = useRouter();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
    const [formData, setFormData] = useState<CourseFormData>({
        title: '',
        description: '',
        categoryId: '',
        level: 'beginner',
        price: '0',
        durationWeeks: '',
        durationHours: '',
    });

    useEffect(() => {
        // Fetch categories
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await authService.request<any>('/courses/categories', { method: 'GET' });
            console.log('Categories API response:', response);
            if (response.success) {
                setCategories(response.data || []);
                console.log('Categories set:', response.data);
            } else {
                console.error('Failed to fetch categories:', response.message);
                // Set some default categories if API fails
                setCategories([
                    { id: '1', name: 'Programming' },
                    { id: '2', name: 'Business' },
                    { id: '3', name: 'Design' },
                    { id: '4', name: 'Marketing' },
                ]);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            // Set some default categories if fetch fails
            setCategories([
                { id: '1', name: 'Programming' },
                { id: '2', name: 'Business' },
                { id: '3', name: 'Design' },
                { id: '4', name: 'Marketing' },
            ]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.title.trim()) {
            toast({
                title: 'Validation Error',
                description: 'Course title is required',
                variant: 'destructive'
            });
            return;
        }

        if (!formData.categoryId) {
            toast({
                title: 'Validation Error',
                description: 'Please select a category',
                variant: 'destructive'
            });
            return;
        }

        setLoading(true);

        try {
            const response = await authService.request<any>('/courses', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: formData.title,
                    description: formData.description,
                    categoryId: formData.categoryId,
                    level: formData.level,
                    price: parseFloat(formData.price) || 0,
                    durationWeeks: parseInt(formData.durationWeeks) || null,
                    durationHours: parseInt(formData.durationHours) || null,
                })
            });

            toast({
                title: "Success",
                description: "Course created successfully",
            });

            router.push(`/courses/${response.data.id}/edit`);
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to create course",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field: keyof CourseFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <AuthGuard allowedRoles={['teacher', 'admin']}>
            <div className="flex h-screen bg-background">
                <DashboardSidebar />

                <main className="flex-1 overflow-y-auto">
                    <div className="container max-w-4xl mx-auto py-8 space-y-6">
                        {/* Header */}
                        <div className="flex items-center gap-4">
                            <Button variant="outline" size="icon" asChild>
                                <Link href="/dashboard/teacher/courses">
                                    <ArrowLeft className="h-4 w-4" />
                                </Link>
                            </Button>
                            <div>
                                <h1 className="text-3xl font-bold">Create New Course</h1>
                                <p className="text-muted-foreground">
                                    Fill in the details below to create your course
                                </p>
                            </div>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit}>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Course Information</CardTitle>
                                    <CardDescription>
                                        Provide the basic information about your course
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
                                                    {categories.length === 0 ? (
                                                        <SelectItem value="loading" disabled>
                                                            No categories available
                                                        </SelectItem>
                                                    ) : (
                                                        categories.map((category) => (
                                                            <SelectItem key={category.id} value={String(category.id)}>
                                                                {category.name}
                                                            </SelectItem>
                                                        ))
                                                    )}
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
                                            Create Course
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
