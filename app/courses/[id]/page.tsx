'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
    BookOpen,
    Clock,
    Users,
    Star,
    PlayCircle,
    CheckCircle,
    Megaphone,
    FileText,
    Upload,
    Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { DashboardSidebar } from '@/components/layout/dashboard-sidebar';
import { AuthGuard } from '@/lib/auth/auth-guard';
import {
    createModule,
    createAssignment,
    createAnnouncement,
    updateModule,
    deleteModule,
    deleteAssignment,
    updateModuleOrder,
    createLesson,
    deleteLesson,
    uploadFile
} from '@/lib/services/courseAssignments';
import { getCourseParticipants } from '@/lib/services/enrollments';
import { CourseStructure, Module } from '@/components/courses/CourseStructure';
import { CourseItem } from '@/components/courses/CourseSection';
import { Loader2 } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

import { getCourseImageUrl } from '@/lib/utils/image-utils';
import { OptimizedImage } from '@/components/ui/optimized-image';

export default function CourseDetailsPage() {
    const params = useParams();
    const courseId = params.id as string;
    const { toast } = useToast();
    const [course, setCourse] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('modules');

    const [modules, setModules] = useState<any[]>([]);
    const [assignments, setAssignments] = useState<any[]>([]);
    const [files, setFiles] = useState<any[]>([]);
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [participants, setParticipants] = useState<any[]>([]);
    const [loadingParticipants, setLoadingParticipants] = useState(false);

    // Edit Mode State
    const [isEditing, setIsEditing] = useState(false);
    const [canEdit, setCanEdit] = useState(false);
    const [userRole, setUserRole] = useState<string>('');

    // File Upload State
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [activeModuleId, setActiveModuleId] = useState<string | null>(null);

    const fetchCourseDetails = React.useCallback(async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/${courseId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();

            if (data.success) {
                setCourse(data.data);
                const role = JSON.parse(atob(token?.split('.')[1] || '{}')).role;
                setUserRole(role);
                setCanEdit(role === 'admin' || data.data.can_edit || data.data.is_owner);
            } else {
                throw new Error(data.message || 'Failed to load course');
            }
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to load course details',
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    }, [courseId, toast]);

    const fetchCourseContent = React.useCallback(async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const headers = { 'Authorization': `Bearer ${token}` };
            const baseUrl = process.env.NEXT_PUBLIC_API_URL;

            const [modulesRes, assignmentsRes, filesRes, announcementsRes] = await Promise.all([
                fetch(`${baseUrl}/courses/${courseId}/modules`, { headers }),
                fetch(`${baseUrl}/courses/${courseId}/assignments`, { headers }),
                fetch(`${baseUrl}/courses/${courseId}/files`, { headers }),
                fetch(`${baseUrl}/courses/${courseId}/announcements`, { headers })
            ]);

            const [modulesData, assignmentsData, filesData, announcementsData] = await Promise.all([
                modulesRes.json(),
                assignmentsRes.json(),
                filesRes.json(),
                announcementsRes.json()
            ]);

            if (modulesData.success) setModules(modulesData.data);
            if (assignmentsData.success) setAssignments(assignmentsData.data);
            if (filesData.success) setFiles(filesData.data);
            if (announcementsData.success) setAnnouncements(announcementsData.data);

        } catch (error) {
            console.error('Error fetching course content:', error);
        }
    }, [courseId]);

    const fetchParticipants = React.useCallback(async () => {
        if (userRole !== 'teacher' && userRole !== 'admin') return;

        setLoadingParticipants(true);
        try {
            console.log('Fetching participants for course:', courseId);
            const data = await getCourseParticipants(courseId);
            console.log('Participants data:', data);
            setParticipants(data);
        } catch (error: any) {
            console.error('Failed to fetch participants', error);
            toast({
                title: 'Error',
                description: error.message || 'Failed to load participants',
                variant: 'destructive'
            });
        } finally {
            setLoadingParticipants(false);
        }
    }, [courseId, canEdit, userRole, toast]);

    useEffect(() => {
        if (courseId) {
            fetchCourseDetails();
            fetchCourseContent();
        }
    }, [courseId, fetchCourseDetails, fetchCourseContent]);

    useEffect(() => {
        if (activeTab === 'participants') {
            fetchParticipants();
        }
    }, [activeTab, fetchParticipants]);

    // Transform data for CourseStructure
    const mapModuleToStructure = (mod: any): Module => {
        const modAssignments = assignments.filter(a => a.module_id === mod.id).map(a => ({
            id: a.id,
            type: 'assignment' as const,
            title: a.title,
            dueDate: a.due_date,
            completed: a.submission_status === 'submitted',
            sortOrder: a.sort_order || 0
        }));

        const modLessons = (mod.lessons || []).map((l: any) => {
            let itemType: 'lesson' | 'file' | 'page' = 'lesson';
            if (l.type === 'file') itemType = 'file';
            else if (l.type === 'text') itemType = 'page';

            return {
                id: l.id,
                type: itemType,
                title: l.title,
                duration: l.duration_minutes,
                completed: l.completed,
                sortOrder: l.sort_order || 0,
                isFree: l.is_free,
                video_url: l.video_url,
                url: l.video_url
            };
        });

        // Merge and sort items
        const items = [...modLessons, ...modAssignments].sort((a, b) => a.sortOrder - b.sortOrder);

        // Recursively map subsections
        const subsections = (mod.subsections || []).map(mapModuleToStructure);

        return {
            id: mod.id,
            title: mod.title,
            items: items,
            subsections: subsections,
            sortOrder: mod.sort_order
        };
    };

    const getStructuredModules = (): Module[] => {
        return modules.map(mapModuleToStructure);
    };

    // Handlers
    const handleAddModule = async (title: string) => {
        try {
            await createModule(courseId, { title, sort_order: modules.length + 1 });
            toast({ title: 'Success', description: 'Section added' });
            fetchCourseContent();
        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        }
    };

    const handleAddSubsection = async (parentId: string, title: string) => {
        try {
            // Find parent module to determine sort order (append to end)
            // This is a bit complex with nested structure, so we'll just use 0 or logic in backend
            // For now, let's just create it.
            await createModule(courseId, { title, parentId, sort_order: 999 }); // Backend or DB should handle order or we fetch and calc
            toast({ title: 'Success', description: 'Subsection added' });
            fetchCourseContent();
        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        }
    };

    const handleBulkAddModules = async (count: number) => {
        try {
            const promises = [];
            for (let i = 0; i < count; i++) {
                promises.push(createModule(courseId, { title: 'New Section', sort_order: modules.length + i + 1 }));
            }
            await Promise.all(promises);
            toast({ title: 'Success', description: `${count} sections added` });
            fetchCourseContent();
        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        }
    };

    const handleRenameModule = async (moduleId: string, newTitle: string) => {
        try {
            await updateModule(courseId, moduleId, { title: newTitle });
            toast({ title: 'Success', description: 'Section renamed' });
            fetchCourseContent();
        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        }
    };

    const handleDeleteModule = async (moduleId: string) => {
        if (!confirm('Are you sure you want to delete this section?')) return;
        try {
            await deleteModule(courseId, moduleId);
            toast({ title: 'Success', description: 'Section deleted' });
            fetchCourseContent();
        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !activeModuleId) return;

        try {
            toast({ title: 'Uploading...', description: 'Please wait while the file uploads.' });

            // 1. Upload file
            const uploadResult = await uploadFile(courseId, file);
            const fileUrl = uploadResult.url;
            const fileName = file.name;

            // 2. Create lesson of type 'file'
            // Find max sort order
            // We need to find the module in the nested structure. 
            // For simplicity, we'll just use a default sort order or fetch fresh data.
            // Let's rely on backend or just use a safe high number/default.

            await createLesson(courseId, activeModuleId, {
                title: fileName,
                type: 'file',
                video_url: fileUrl,
                sort_order: 999 // Append to end
            });

            toast({ title: 'Success', description: 'File uploaded and added to section' });
            fetchCourseContent();
        } catch (error: any) {
            console.error('Upload error:', error);
            toast({ title: 'Error', description: error.message || 'Failed to upload file', variant: 'destructive' });
        } finally {
            // Reset input
            if (fileInputRef.current) fileInputRef.current.value = '';
            setActiveModuleId(null);
        }
    };

    const handleAddItem = async (moduleId: string, type: string) => {
        if (!canEdit) return;

        try {
            if (type === 'assignment') {
                const title = prompt('Enter assignment title:');
                if (!title) return;

                const newAssignment = await createAssignment(courseId as string, {
                    title,
                    description: '',
                    due_date: new Date().toISOString(),
                    max_points: 100,
                    assignment_type: 'essay'
                });

                await updateAssignment(courseId as string, newAssignment.data.id, {
                    module_id: moduleId,
                    sort_order: 999
                });

                fetchCourseContent();
                toast({ title: 'Success', description: 'Assignment created successfully' });
            } else if (type === 'quiz') {
                toast({ title: 'Info', description: 'Quiz creation not fully implemented yet' });
            } else if (type === 'file') {
                // Trigger file input
                setActiveModuleId(moduleId);
                fileInputRef.current?.click();
            }
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to add item',
                variant: 'destructive'
            });
        }
    };

    const handleDeleteItem = async (moduleId: string, itemId: string, type: string) => {
        if (!confirm('Are you sure?')) return;
        try {
            if (type === 'assignment') {
                await deleteAssignment(courseId, itemId);
            } else if (type === 'lesson' || type === 'file' || type === 'page') {
                await deleteLesson(courseId, moduleId, itemId);
            } else {
                toast({ title: 'Error', description: 'Cannot delete this item type' });
                return;
            }
            toast({ title: 'Success', description: 'Item deleted' });
            fetchCourseContent();
        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        }
    };



    const handleModulesChange = async (newModules: Module[]) => {
        // Optimistic update
        const orderUpdates = newModules.map((m, index) => ({ id: m.id, sort_order: index + 1 }));

        setModules(prevModules => {
            const updated = [...prevModules];
            const reordered = updated.map(m => {
                const update = orderUpdates.find(u => u.id === m.id);
                return update ? { ...m, sort_order: update.sort_order } : m;
            });
            return reordered.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
        });

        try {
            await updateModuleOrder(courseId, orderUpdates);
            fetchCourseContent();
        } catch (error) {
            console.error('Failed to update order', error);
            toast({ title: 'Error', description: 'Failed to save order', variant: 'destructive' });
            fetchCourseContent();
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="flex h-screen items-center justify-center">
                <p className="text-muted-foreground">Course not found</p>
            </div>
        );
    }

    return (
        <AuthGuard allowedRoles={['student', 'teacher', 'admin']}>
            <div className="flex h-screen bg-background">
                <DashboardSidebar />

                <main className="flex-1 overflow-y-auto">
                    <div className="container mx-auto py-8 px-6 space-y-8">
                        {/* Hidden File Input */}
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            onChange={handleFileUpload}
                        />

                        {/* Header Section */}
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
                                <div className="flex items-center text-muted-foreground">
                                    <span>Instructor: {course.instructor_name || 'Unknown Instructor'}</span>
                                </div>
                            </div>
                            {canEdit ? (
                                <Button
                                    size="lg"
                                    className={isEditing ? "bg-destructive hover:bg-destructive/90" : "bg-primary hover:bg-primary/90"}
                                    onClick={() => setIsEditing(!isEditing)}
                                >
                                    {isEditing ? 'Exit Edit Mode' : 'Edit Course'}
                                </Button>
                            ) : (
                                <Button size="lg" className="bg-primary hover:bg-primary/90">
                                    <PlayCircle className="mr-2 h-5 w-5" />
                                    Continue Learning
                                </Button>
                            )}
                        </div>

                        {/* Tabs Navigation */}
                        <Tabs defaultValue="modules" className="w-full" onValueChange={setActiveTab}>
                            <TabsList className="w-full grid grid-cols-6 bg-muted p-1 rounded-lg">
                                {['Overview', 'Modules', 'Participants', 'Assignments', 'Announcements', 'Resources'].map((tab) => (
                                    <TabsTrigger
                                        key={tab}
                                        value={tab.toLowerCase()}
                                        className="rounded-md"
                                    >
                                        {tab}
                                    </TabsTrigger>
                                ))}
                            </TabsList>



                            {/* Overview Tab */}
                            <TabsContent value="overview" className="mt-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="md:col-span-2 space-y-6">
                                        {/* Course Image */}
                                        <div className="relative w-full h-[300px] rounded-lg overflow-hidden border">
                                            <OptimizedImage
                                                src={getCourseImageUrl(course.image_url || course.thumbnail)}
                                                alt={course.title}
                                                fill
                                                className="object-cover"
                                                priority
                                            />
                                        </div>

                                        <section>
                                            <h3 className="text-xl font-semibold mb-3">Course Description</h3>
                                            <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                                                {course.description}
                                            </p>
                                        </section>
                                    </div>
                                    <div className="space-y-6">
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Course Stats</CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Duration</span>
                                                    <span className="font-medium">{course.duration_weeks} weeks</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Difficulty</span>
                                                    <span className="font-medium capitalize">{course.level}</span>
                                                </div>
                                            </CardContent>
                                        </Card>
                                        <section>
                                            <h3 className="text-xl font-semibold mb-3">About the Instructor</h3>
                                            <div className="flex items-start gap-4">
                                                <Avatar className="h-12 w-12">
                                                    <AvatarFallback>{course.instructor_name?.charAt(0) || 'I'}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium">{course.instructor_name}</p>
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        Instructor for this course.
                                                    </p>
                                                </div>
                                            </div>
                                        </section>


                                    </div>
                                </div>
                            </TabsContent>

                            {/* Modules Tab (Course Structure) */}
                            <TabsContent value="modules" className="mt-6">
                                <CourseStructure
                                    modules={getStructuredModules()}
                                    isEditing={isEditing}
                                    onModulesChange={handleModulesChange}
                                    onAddModule={handleAddModule}
                                    onDeleteModule={handleDeleteModule}
                                    onRenameModule={handleRenameModule}
                                    onAddItem={handleAddItem}
                                    onDeleteItem={handleDeleteItem}
                                    onEditItem={() => { }}
                                    onBulkAddModules={handleBulkAddModules}
                                    onAddSubsection={handleAddSubsection}
                                />
                            </TabsContent>

                            {/* Participants Tab */}
                            <TabsContent value="participants" className="mt-6">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-semibold flex items-center gap-2">
                                            Participants
                                            <Badge variant="secondary" className="rounded-full px-2.5">
                                                {participants.length}
                                            </Badge>
                                        </h3>
                                    </div>

                                    {loadingParticipants ? (
                                        <div className="flex items-center justify-center py-12 border rounded-xl bg-muted/10">
                                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                        </div>
                                    ) : participants.length === 0 ? (
                                        <div className="text-center py-12 border rounded-xl bg-muted/10 border-dashed">
                                            <Users className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                                            <p className="text-sm text-muted-foreground">No participants found.</p>
                                        </div>
                                    ) : (
                                        <div className="border rounded-xl overflow-hidden">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow className="bg-muted/50">
                                                        <TableHead>Student</TableHead>
                                                        <TableHead>Email</TableHead>
                                                        <TableHead>Enrolled Date</TableHead>
                                                        <TableHead>Progress</TableHead>
                                                        <TableHead>Status</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {participants.map((participant) => (
                                                        <TableRow key={participant.id}>
                                                            <TableCell className="font-medium">
                                                                <div className="flex items-center gap-2">
                                                                    <Avatar className="h-8 w-8">
                                                                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                                                                            {participant.student_name?.charAt(0) || '?'}
                                                                        </AvatarFallback>
                                                                    </Avatar>
                                                                    {participant.student_name}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="text-muted-foreground">{participant.student_email}</TableCell>
                                                            <TableCell>
                                                                {new Date(participant.enrollment_date).toLocaleDateString()}
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="flex items-center gap-2">
                                                                    <Progress value={participant.progress_percentage || 0} className="w-20 h-2" />
                                                                    <span className="text-xs text-muted-foreground">{participant.progress_percentage || 0}%</span>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge variant={participant.status === 'active' ? 'default' : 'secondary'} className="rounded-full capitalize">
                                                                    {participant.status}
                                                                </Badge>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    )}
                                </div>
                            </TabsContent>

                            {/* Assignments Tab */}
                            <TabsContent value="assignments" className="mt-6">
                                <div className="space-y-4">
                                    {assignments.map((assignment) => (
                                        <Card key={assignment.id}>
                                            <CardContent className="p-6 flex justify-between items-center">
                                                <div>
                                                    <h4 className="font-medium text-lg">{assignment.title}</h4>
                                                    <p className="text-sm text-muted-foreground">
                                                        Due: {assignment.due_date ? new Date(assignment.due_date).toLocaleDateString() : 'No due date'}
                                                    </p>
                                                </div>
                                                <Button variant="outline">View</Button>
                                            </CardContent>
                                        </Card>
                                    ))}
                                    {assignments.length === 0 && (
                                        <div className="text-center py-8 text-muted-foreground">No assignments found.</div>
                                    )}
                                </div>
                            </TabsContent>

                            {/* Announcements Tab */}
                            <TabsContent value="announcements" className="mt-6">
                                <div className="space-y-4">
                                    {announcements.map((announcement) => (
                                        <Card key={announcement.id}>
                                            <CardContent className="p-6 space-y-2">
                                                <div className="flex justify-between items-start">
                                                    <h4 className="font-medium text-lg">{announcement.title}</h4>
                                                    <span className="text-sm text-muted-foreground">{new Date(announcement.created_at).toLocaleDateString()}</span>
                                                </div>
                                                <p className="text-muted-foreground">{announcement.content}</p>
                                            </CardContent>
                                        </Card>
                                    ))}
                                    {announcements.length === 0 && (
                                        <div className="text-center py-8 text-muted-foreground">No announcements yet.</div>
                                    )}
                                </div>
                            </TabsContent>

                            {/* Resources Tab */}
                            <TabsContent value="resources" className="mt-6">
                                {files.length > 0 ? (
                                    <div className="grid grid-cols-1 gap-3">
                                        {files.map((file) => (
                                            <Card key={file.id}>
                                                <CardContent className="p-4 flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className="p-2 bg-muted rounded">
                                                            <FileText className="h-6 w-6 text-blue-500" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium">{file.original_filename || file.filename}</p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {(file.file_size / 1024 / 1024).toFixed(2)} MB • Uploaded {new Date(file.created_at).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <Button variant="outline" size="sm" asChild>
                                                        <a href={`${(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api').replace('/api', '')}/uploads/${file.filename}`} target="_blank" rel="noopener noreferrer">
                                                            <Download className="h-4 w-4 mr-2" />
                                                            Download
                                                        </a>
                                                    </Button>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">No resources available.</div>
                                )}
                            </TabsContent>
                        </Tabs>
                    </div>
                </main>
            </div>
        </AuthGuard>
    );
}
