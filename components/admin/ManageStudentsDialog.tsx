'use client';

import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Upload, X, FileText, User, Trash2 } from 'lucide-react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { enrollStudents, getCourseEnrollments, deleteEnrollments, type EnrollmentResult } from '@/lib/services/enrollments';
import Papa from 'papaparse';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface ManageStudentsDialogProps {
    courseId: string;
    courseTitle: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export function ManageStudentsDialog({
    courseId,
    courseTitle,
    open,
    onOpenChange,
    onSuccess
}: ManageStudentsDialogProps) {
    const [activeTab, setActiveTab] = useState('manual');
    const [manualEmail, setManualEmail] = useState('');
    const [emailList, setEmailList] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<EnrollmentResult[] | null>(null);
    const [csvFile, setCsvFile] = useState<File | null>(null);
    const [csvPreview, setCsvPreview] = useState<string[]>([]);
    const [enrolledStudents, setEnrolledStudents] = useState<any[]>([]);
    const [loadingEnrollments, setLoadingEnrollments] = useState(false);
    const [selectedEnrollments, setSelectedEnrollments] = useState<string[]>([]);
    const [deletingEnrollments, setDeletingEnrollments] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const { toast } = useToast();

    const loadEnrollments = React.useCallback(async () => {
        setLoadingEnrollments(true);
        try {
            const data = await getCourseEnrollments(courseId);
            setEnrolledStudents(data);
        } catch (error: any) {
            console.error('Failed to load enrollments', error);
        } finally {
            setLoadingEnrollments(false);
        }
    }, [courseId]);

    useEffect(() => {
        if (open) {
            loadEnrollments();
            // Reset state on open
            setResults(null);
            setEmailList([]);
            setCsvFile(null);
            setCsvPreview([]);
            setManualEmail('');
            setActiveTab('manual');
            setSelectedEnrollments([]);
        }
    }, [open, loadEnrollments]);

    const handleAddEmail = () => {
        if (!manualEmail) return;
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(manualEmail)) {
            toast({
                title: 'Invalid email',
                description: 'Please enter a valid email address',
                variant: 'destructive'
            });
            return;
        }
        if (emailList.includes(manualEmail)) {
            toast({
                title: 'Duplicate email',
                description: 'This email is already in the list',
                variant: 'destructive'
            });
            return;
        }
        setEmailList([...emailList, manualEmail]);
        setManualEmail('');
    };

    const handleRemoveEmail = (email: string) => {
        setEmailList(emailList.filter(e => e !== email));
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
            toast({
                title: 'Invalid file',
                description: 'Please upload a CSV file',
                variant: 'destructive'
            });
            return;
        }

        setCsvFile(file);
        Papa.parse(file, {
            complete: (results) => {
                const emails = results.data
                    .flat()
                    .map((item: any) => item?.toString().trim())
                    .filter((item: string) => item && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(item));

                setCsvPreview(emails);
                if (emails.length === 0) {
                    toast({
                        title: 'No valid emails found',
                        description: 'The CSV file does not contain any valid email addresses',
                        variant: 'destructive'
                    });
                }
            },
            header: false
        });
    };

    const handleEnroll = async () => {
        const emailsToEnroll = activeTab === 'manual' ? emailList : csvPreview;

        if (emailsToEnroll.length === 0) {
            toast({
                title: 'No emails provided',
                description: 'Please add at least one email to enroll',
                variant: 'destructive'
            });
            return;
        }

        setLoading(true);
        setResults(null);

        try {
            const response = await enrollStudents(courseId, emailsToEnroll);
            setResults(response.data.results);

            const summary = response.data.summary;
            if (summary.success > 0) {
                toast({
                    title: 'Enrollment processed',
                    description: `Successfully enrolled ${summary.success} students.`,
                });
                loadEnrollments(); // Reload list
                onSuccess?.();
            } else {
                toast({
                    title: 'Enrollment processed',
                    description: 'No students were enrolled. Check the results for details.',
                    variant: 'destructive'
                });
            }

            // Clear inputs on success
            setEmailList([]);
            setCsvFile(null);
            setCsvPreview([]);

        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to enroll students',
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'success':
                return <Badge className="bg-green-500 hover:bg-green-600">Success</Badge>;
            case 'failed':
                return <Badge variant="destructive">Failed</Badge>;
            case 'skipped':
                return <Badge variant="secondary">Skipped</Badge>;
            case 'error':
                return <Badge variant="destructive">Error</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const handleToggleEnrollment = (enrollmentId: string) => {
        setSelectedEnrollments(prev =>
            prev.includes(enrollmentId)
                ? prev.filter(id => id !== enrollmentId)
                : [...prev, enrollmentId]
        );
    };

    const handleToggleAll = () => {
        if (selectedEnrollments.length === enrolledStudents.length) {
            setSelectedEnrollments([]);
        } else {
            setSelectedEnrollments(enrolledStudents.map(e => e.id));
        }
    };

    const handleDeleteEnrollments = async () => {
        if (selectedEnrollments.length === 0) return;

        setDeletingEnrollments(true);
        try {
            await deleteEnrollments(selectedEnrollments);
            toast({
                title: 'Success',
                description: `Successfully deleted ${selectedEnrollments.length} enrollment(s)`,
            });
            setSelectedEnrollments([]);
            setShowDeleteConfirm(false);
            await loadEnrollments();
            onSuccess?.();
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to delete enrollments',
                variant: 'destructive'
            });
        } finally {
            setDeletingEnrollments(false);
        }
    };

    const handleDeleteClick = () => {
        setShowDeleteConfirm(true);
    };

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
                    <DialogHeader className="px-6 py-4 border-b">
                        <DialogTitle className="text-xl">Manage Students</DialogTitle>
                        <DialogDescription>
                            Enroll students in <strong>{courseTitle}</strong>
                        </DialogDescription>
                    </DialogHeader>

                    <ScrollArea className="flex-1 px-6 py-4">
                        <div className="space-y-8">
                            {/* Enrollment Section */}
                            <div className="space-y-4">
                                {!results ? (
                                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                        <TabsList className="grid w-full grid-cols-2 mb-4 h-10 p-1 bg-muted rounded-lg">
                                            <TabsTrigger value="manual" className="rounded-md">Manual Entry</TabsTrigger>
                                            <TabsTrigger value="bulk" className="rounded-md">Bulk Upload (CSV)</TabsTrigger>
                                        </TabsList>

                                        <TabsContent value="manual" className="space-y-4 mt-0">
                                            <div className="flex gap-3">
                                                <Input
                                                    placeholder="Enter student email address"
                                                    value={manualEmail}
                                                    onChange={(e) => setManualEmail(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                            handleAddEmail();
                                                        }
                                                    }}
                                                    className="rounded-full bg-muted/30 border-muted-foreground/20 focus-visible:ring-primary/20"
                                                />
                                                <Button
                                                    onClick={handleAddEmail}
                                                    className="rounded-full px-6"
                                                    disabled={!manualEmail}
                                                >
                                                    Add
                                                </Button>
                                            </div>

                                            {emailList.length > 0 && (
                                                <div className="bg-muted/30 rounded-xl p-4 space-y-2">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                                            Staged for Enrollment ({emailList.length})
                                                        </span>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => setEmailList([])}
                                                            className="text-destructive hover:text-destructive h-auto p-0 text-xs"
                                                        >
                                                            Clear all
                                                        </Button>
                                                    </div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {emailList.map((email) => (
                                                            <Badge key={email} variant="secondary" className="pl-3 pr-1 py-1.5 rounded-full flex items-center gap-1.5 bg-background border shadow-sm">
                                                                {email}
                                                                <div
                                                                    className="cursor-pointer rounded-full p-0.5 hover:bg-muted-foreground/20 transition-colors"
                                                                    onClick={() => handleRemoveEmail(email)}
                                                                >
                                                                    <X className="h-3 w-3 text-muted-foreground" />
                                                                </div>
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </TabsContent>

                                        <TabsContent value="bulk" className="space-y-4 mt-0">
                                            <div className="border-2 border-dashed border-muted-foreground/20 rounded-xl p-8 text-center hover:bg-muted/30 transition-colors cursor-pointer group relative">
                                                <Input
                                                    type="file"
                                                    accept=".csv"
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                    onChange={handleFileUpload}
                                                />
                                                <div className="flex flex-col items-center gap-3">
                                                    <div className="p-3 rounded-full bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                                                        <Upload className="h-6 w-6" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium">Click to upload or drag and drop</p>
                                                        <p className="text-xs text-muted-foreground mt-1">CSV files only</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {csvFile && (
                                                <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30">
                                                    <FileText className="h-8 w-8 text-primary/60" />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium truncate">{csvFile.name}</p>
                                                        <p className="text-xs text-muted-foreground">{(csvFile.size / 1024).toFixed(1)} KB • {csvPreview.length} emails found</p>
                                                    </div>
                                                    <Button variant="ghost" size="icon" onClick={() => {
                                                        setCsvFile(null);
                                                        setCsvPreview([]);
                                                    }}>
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            )}
                                        </TabsContent>
                                    </Tabs>
                                ) : (
                                    <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-semibold text-lg">Enrollment Results</h3>
                                            <Button variant="outline" size="sm" onClick={() => setResults(null)}>Enroll More</Button>
                                        </div>
                                        <div className="border rounded-lg overflow-hidden">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow className="bg-muted/50">
                                                        <TableHead>Email</TableHead>
                                                        <TableHead>Status</TableHead>
                                                        <TableHead>Details</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {results.map((result, index) => (
                                                        <TableRow key={index}>
                                                            <TableCell className="font-medium">{result.email}</TableCell>
                                                            <TableCell>{getStatusBadge(result.status)}</TableCell>
                                                            <TableCell className="text-sm text-muted-foreground">
                                                                {result.reason || result.studentName || '-'}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <Separator />

                            {/* Current Students Section */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold flex items-center gap-2">
                                        Current Students
                                        <Badge variant="secondary" className="rounded-full px-2.5">
                                            {enrolledStudents.length}
                                        </Badge>
                                    </h3>
                                    {selectedEnrollments.length > 0 && (
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={handleDeleteClick}
                                            disabled={deletingEnrollments}
                                            className="rounded-full"
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Delete {selectedEnrollments.length} Student{selectedEnrollments.length !== 1 ? 's' : ''}
                                        </Button>
                                    )}
                                </div>

                                {loadingEnrollments ? (
                                    <div className="flex items-center justify-center py-12 border rounded-xl bg-muted/10">
                                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                    </div>
                                ) : enrolledStudents.length === 0 ? (
                                    <div className="text-center py-12 border rounded-xl bg-muted/10 border-dashed">
                                        <User className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                                        <p className="text-sm text-muted-foreground">No students enrolled yet</p>
                                    </div>
                                ) : (
                                    <div className="border rounded-xl overflow-hidden">
                                        <div className="max-h-[300px] overflow-y-auto">
                                            <Table>
                                                <TableHeader className="sticky top-0 bg-background z-10">
                                                    <TableRow className="bg-muted/50">
                                                        <TableHead className="w-12">
                                                            <Checkbox
                                                                checked={selectedEnrollments.length === enrolledStudents.length && enrolledStudents.length > 0}
                                                                onCheckedChange={handleToggleAll}
                                                            />
                                                        </TableHead>
                                                        <TableHead>Student</TableHead>
                                                        <TableHead>Email</TableHead>
                                                        <TableHead>Enrolled Date</TableHead>
                                                        <TableHead>Status</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {enrolledStudents.map((enrollment) => (
                                                        <TableRow key={enrollment.id}>
                                                            <TableCell>
                                                                <Checkbox
                                                                    checked={selectedEnrollments.includes(enrollment.id)}
                                                                    onCheckedChange={() => handleToggleEnrollment(enrollment.id)}
                                                                />
                                                            </TableCell>
                                                            <TableCell className="font-medium">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                                                                        {enrollment.student_name.charAt(0)}
                                                                    </div>
                                                                    {enrollment.student_name}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="text-muted-foreground">{enrollment.student_email}</TableCell>
                                                            <TableCell>
                                                                {new Date(enrollment.enrollment_date).toLocaleDateString()}
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge variant={enrollment.status === 'active' ? 'default' : 'secondary'} className="rounded-full">
                                                                    {enrollment.status}
                                                                </Badge>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </ScrollArea>

                    <DialogFooter className="px-6 py-4 border-t bg-muted/10">
                        <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-full px-6">
                            Cancel
                        </Button>
                        {!results && (
                            <Button
                                onClick={handleEnroll}
                                disabled={loading || (activeTab === 'manual' ? emailList.length === 0 : csvPreview.length === 0)}
                                className="rounded-full px-6 bg-primary hover:bg-primary/90"
                            >
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Enroll Students
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Students</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete {selectedEnrollments.length} student{selectedEnrollments.length !== 1 ? 's' : ''} from this course?
                            This action cannot be undone and will remove all their progress and enrollment data.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deletingEnrollments}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteEnrollments}
                            disabled={deletingEnrollments}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {deletingEnrollments && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
