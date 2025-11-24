'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { TeacherSelector } from './TeacherSelector';
import {
    getCourseTeachers,
    assignTeachersToCourse,
    removeTeacherFromCourse,
    type AssignedTeacher
} from '@/lib/services/courseAssignments';
import { Loader2, Trash2, UserMinus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface ManageTeachersDialogProps {
    courseId: string;
    courseTitle: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export function ManageTeachersDialog({
    courseId,
    courseTitle,
    open,
    onOpenChange,
    onSuccess
}: ManageTeachersDialogProps) {
    const [selectedTeacherIds, setSelectedTeacherIds] = useState<string[]>([]);
    const [canEdit, setCanEdit] = useState(true);
    const [canDelete, setCanDelete] = useState(false);
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [assignedTeachers, setAssignedTeachers] = useState<AssignedTeacher[]>([]);
    const [instructorId, setInstructorId] = useState<string>('');
    const [loadingTeachers, setLoadingTeachers] = useState(false);
    const { toast } = useToast();

    const loadCourseTeachers = useCallback(async () => {
        setLoadingTeachers(true);
        try {
            const data = await getCourseTeachers(courseId);
            setAssignedTeachers(data.assignedTeachers);
            setInstructorId(data.course.instructor.id);
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to load teachers',
                variant: 'destructive'
            });
        } finally {
            setLoadingTeachers(false);
        }
    }, [courseId, toast]);

    useEffect(() => {
        if (open) {
            loadCourseTeachers();
        }
    }, [open, loadCourseTeachers]);

    const handleAssign = async () => {
        if (selectedTeacherIds.length === 0) {
            toast({
                title: 'No teachers selected',
                description: 'Please select at least one teacher to assign',
                variant: 'destructive'
            });
            return;
        }

        setLoading(true);
        try {
            await assignTeachersToCourse(courseId, {
                teacherIds: selectedTeacherIds,
                canEdit,
                canDelete,
                notes: notes.trim() || undefined
            });

            toast({
                title: 'Success',
                description: `Assigned ${selectedTeacherIds.length} teacher(s) to the course`
            });

            // Reset form
            setSelectedTeacherIds([]);
            setNotes('');
            setCanEdit(true);
            setCanDelete(false);

            // Reload teachers list
            await loadCourseTeachers();
            onSuccess?.();
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to assign teachers',
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (teacherId: string) => {
        if (!confirm('Are you sure you want to remove this teacher assignment?')) {
            return;
        }

        try {
            await removeTeacherFromCourse(courseId, teacherId);
            toast({
                title: 'Success',
                description: 'Teacher removed from course'
            });
            await loadCourseTeachers();
            onSuccess?.();
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to remove teacher',
                variant: 'destructive'
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Manage Teachers</DialogTitle>
                    <DialogDescription>
                        Assign teachers to <strong>{courseTitle}</strong> with custom permissions
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Assign New Teachers Form */}
                    <div className="space-y-4 border-b pb-6">
                        <h3 className="text-sm font-semibold">Assign New Teachers</h3>

                        <div className="space-y-2">
                            <Label>Select Teachers</Label>
                            <TeacherSelector
                                selectedTeacherIds={selectedTeacherIds}
                                onSelectionChange={setSelectedTeacherIds}
                                excludeTeacherIds={[instructorId, ...assignedTeachers.map(t => t.teacher_id)]}
                            />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <Label htmlFor="can-edit">Can Edit</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Allow editing course content
                                    </p>
                                </div>
                                <Switch
                                    id="can-edit"
                                    checked={canEdit}
                                    onCheckedChange={setCanEdit}
                                />
                            </div>

                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <Label htmlFor="can-delete">Can Delete</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Allow deleting the course
                                    </p>
                                </div>
                                <Switch
                                    id="can-delete"
                                    checked={canDelete}
                                    onCheckedChange={setCanDelete}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="notes">Notes (Optional)</Label>
                            <Textarea
                                id="notes"
                                placeholder="Add notes about this assignment..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows={3}
                            />
                        </div>

                        <Button onClick={handleAssign} disabled={loading || selectedTeacherIds.length === 0}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Assign Teachers
                        </Button>
                    </div>

                    {/* Currently Assigned Teachers */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold">Currently Assigned Teachers</h3>

                        {loadingTeachers ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin" />
                            </div>
                        ) : assignedTeachers.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-8">
                                No teachers assigned yet
                            </p>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Teacher</TableHead>
                                        <TableHead>Permissions</TableHead>
                                        <TableHead>Assigned</TableHead>
                                        <TableHead className="w-20">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {assignedTeachers.map((teacher) => (
                                        <TableRow key={teacher.id}>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{teacher.teacher_name}</div>
                                                    <div className="text-sm text-muted-foreground">{teacher.teacher_email}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-2">
                                                    <div className="flex items-center gap-2">
                                                        <Switch
                                                            checked={teacher.can_edit}
                                                            onCheckedChange={async (checked) => {
                                                                try {
                                                                    await assignTeachersToCourse(courseId, {
                                                                        teacherIds: [teacher.teacher_id],
                                                                        canEdit: checked,
                                                                        canDelete: teacher.can_delete,
                                                                    });
                                                                    toast({
                                                                        title: 'Success',
                                                                        description: 'Permissions updated'
                                                                    });
                                                                    await loadCourseTeachers();
                                                                } catch (error: any) {
                                                                    toast({
                                                                        title: 'Error',
                                                                        description: 'Failed to update permissions',
                                                                        variant: 'destructive'
                                                                    });
                                                                }
                                                            }}
                                                        />
                                                        <span className="text-sm">Can Edit</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Switch
                                                            checked={teacher.can_delete}
                                                            onCheckedChange={async (checked) => {
                                                                try {
                                                                    await assignTeachersToCourse(courseId, {
                                                                        teacherIds: [teacher.teacher_id],
                                                                        canEdit: teacher.can_edit,
                                                                        canDelete: checked,
                                                                    });
                                                                    toast({
                                                                        title: 'Success',
                                                                        description: 'Permissions updated'
                                                                    });
                                                                    await loadCourseTeachers();
                                                                } catch (error: any) {
                                                                    toast({
                                                                        title: 'Error',
                                                                        description: 'Failed to update permissions',
                                                                        variant: 'destructive'
                                                                    });
                                                                }
                                                            }}
                                                        />
                                                        <span className="text-sm">Can Delete</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm text-muted-foreground">
                                                    {new Date(teacher.assigned_at).toLocaleDateString()}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleRemove(teacher.teacher_id)}
                                                >
                                                    <UserMinus className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
