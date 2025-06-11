'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreateCourseData, UpdateCourseData, Course } from '@/lib/types/course';
import { useCreateCourse, useUpdateCourse } from '@/lib/hooks/use-courses';
import { Loader2 } from 'lucide-react';

const courseSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  durationWeeks: z.number().min(1, 'Duration must be at least 1 week').max(52, 'Duration cannot exceed 52 weeks'),
  maxStudents: z.number().min(1, 'Must allow at least 1 student').max(1000, 'Cannot exceed 1000 students'),
  thumbnail: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  status: z.enum(['draft', 'published', 'archived']).optional(),
});

type CourseFormData = z.infer<typeof courseSchema>;

interface CourseFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course?: Course;
  mode: 'create' | 'edit';
}

export function CourseForm({ open, onOpenChange, course, mode }: CourseFormProps) {
  const createMutation = useCreateCourse();
  const updateMutation = useUpdateCourse();
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
    defaultValues: course ? {
      title: course.title,
      description: course.description,
      durationWeeks: course.durationWeeks,
      maxStudents: course.maxStudents,
      thumbnail: course.thumbnail || '',
      status: course.status,
    } : {
      title: '',
      description: '',
      durationWeeks: 8,
      maxStudents: 30,
      thumbnail: '',
      status: 'draft',
    },
  });

  const isLoading = createMutation.isPending || updateMutation.isPending;

  const onSubmit = async (data: CourseFormData) => {
    try {
      const courseData = {
        ...data,
        thumbnail: data.thumbnail || undefined,
      };

      if (mode === 'create') {
        await createMutation.mutateAsync(courseData as CreateCourseData);
      } else if (course) {
        await updateMutation.mutateAsync({
          id: course.id,
          data: courseData as UpdateCourseData,
        });
      }

      reset();
      onOpenChange(false);
    } catch (error) {
      // Error handling is done in the mutation hooks
    }
  };

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Create New Course' : 'Edit Course'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Fill in the details to create a new course.'
              : 'Update the course information below.'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Course Title</Label>
              <Input
                id="title"
                placeholder="Introduction to Computer Science"
                {...register('title')}
                className={errors.title ? 'border-destructive' : ''}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={watch('status')}
                onValueChange={(value: 'draft' | 'published' | 'archived') => setValue('status', value)}
              >
                <SelectTrigger className={errors.status ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="text-sm text-destructive">{errors.status.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe what students will learn in this course..."
              rows={4}
              {...register('description')}
              className={errors.description ? 'border-destructive' : ''}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="durationWeeks">Duration (weeks)</Label>
              <Input
                id="durationWeeks"
                type="number"
                min="1"
                max="52"
                {...register('durationWeeks', { valueAsNumber: true })}
                className={errors.durationWeeks ? 'border-destructive' : ''}
              />
              {errors.durationWeeks && (
                <p className="text-sm text-destructive">{errors.durationWeeks.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxStudents">Max Students</Label>
              <Input
                id="maxStudents"
                type="number"
                min="1"
                max="1000"
                {...register('maxStudents', { valueAsNumber: true })}
                className={errors.maxStudents ? 'border-destructive' : ''}
              />
              {errors.maxStudents && (
                <p className="text-sm text-destructive">{errors.maxStudents.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="thumbnail">Thumbnail URL (optional)</Label>
            <Input
              id="thumbnail"
              type="url"
              placeholder="https://example.com/image.jpg"
              {...register('thumbnail')}
              className={errors.thumbnail ? 'border-destructive' : ''}
            />
            {errors.thumbnail && (
              <p className="text-sm text-destructive">{errors.thumbnail.message}</p>
            )}
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {mode === 'create' ? 'Creating...' : 'Updating...'}
                </>
              ) : (
                mode === 'create' ? 'Create Course' : 'Update Course'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}