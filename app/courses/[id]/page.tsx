'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
    BookOpen,
    Clock,
    Users,
    Star,
    FileText,
    Download,
    Megaphone,
    CheckCircle,
    PlayCircle,
    Lock,
    Calendar,
    AlertCircle,
    ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { createModule, createAssignment, createFile, createAnnouncement } from '@/lib/services/courseAssignments';
import { useToast } from '@/hooks/use-toast';
import { DashboardSidebar } from '@/components/layout/dashboard-sidebar';
import { AuthGuard } from '@/lib/auth/auth-guard';

export default function CourseDetailsPage() {
    const params = useParams();
    const courseId = params.id as string;
    const { toast } = useToast();
    const [course, setCourse] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    const [modules, setModules] = useState<any[]>([]);
    const [assignments, setAssignments] = useState<any[]>([]);
    const [files, setFiles] = useState<any[]>([]);
    const [announcements, setAnnouncements] = useState<any[]>([]);

    // Edit Mode State
    const [isEditing, setIsEditing] = useState(false);
    const [canEdit, setCanEdit] = useState(false);
    const [userRole, setUserRole] = useState<string>('');

    // Dialog States
    const [isModuleDialogOpen, setIsModuleDialogOpen] = useState(false);
    const [isAssignmentDialogOpen, setIsAssignmentDialogOpen] = useState(false);
    const [isFileDialogOpen, setIsFileDialogOpen] = useState(false);
    const [isAnnouncementDialogOpen, setIsAnnouncementDialogOpen] = useState(false);

    // Form States
    const [newModule, setNewModule] = useState({ title: '', description: '' });
    const [newAssignment, setNewAssignment] = useState({ title: '', description: '', due_date: '', max_points: 100, assignment_type: 'essay' });
    const [newFile, setNewFile] = useState({ filename: '', file_size: 1024 * 1024, mime_type: 'application/pdf', file_path: '/tmp/placeholder.pdf' });
    const [newAnnouncement, setNewAnnouncement] = useState({ title: '', content: '', priority: 'medium' });

    useEffect(() => {
        if (courseId) {
            fetchCourseDetails();
            fetchCourseContent();
        }
    }, [courseId]);

    const fetchCourseDetails = async () => {
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
                // Check if user has edit permissions (admin or instructor/assigned teacher)
                // Check if user has edit permissions (admin or instructor/assigned teacher)
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
    };

    const fetchCourseContent = async () => {
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
    };

    const handleCreateModule = async () => {
        try {
            await createModule(courseId, newModule);
            toast({ title: 'Success', description: 'Module created successfully' });
            setIsModuleDialogOpen(false);
            setNewModule({ title: '', description: '' });
            fetchCourseContent();
        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        }
    };

    const handleCreateAssignment = async () => {
        try {
            await createAssignment(courseId, newAssignment);
            toast({ title: 'Success', description: 'Assignment created successfully' });
            setIsAssignmentDialogOpen(false);
            setNewAssignment({ title: '', description: '', due_date: '', max_points: 100, assignment_type: 'essay' });
            fetchCourseContent();
        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        }
    };

    const handleCreateFile = async () => {
        try {
            await createFile(courseId, newFile);
            toast({ title: 'Success', description: 'File added successfully' });
            setIsFileDialogOpen(false);
            setNewFile({ filename: '', file_size: 1024 * 1024, mime_type: 'application/pdf', file_path: '/tmp/placeholder.pdf' });
            fetchCourseContent();
        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        }
    };

    const handleCreateAnnouncement = async () => {
        try {
            await createAnnouncement(courseId, newAnnouncement);
            toast({ title: 'Success', description: 'Announcement posted successfully' });
            setIsAnnouncementDialogOpen(false);
            setNewAnnouncement({ title: '', content: '', priority: 'medium' });
            fetchCourseContent();
        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
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
                    <div className="container mx-auto py-8 space-y-8">
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

                        {/* Course Hero Card */}
                        <Card className="overflow-hidden">
                            <div className="flex flex-col md:flex-row">
                                <div className="w-full md:w-1/3 h-48 md:h-auto relative bg-muted">
                                    {course.thumbnail ? (
                                        <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                                            <BookOpen className="h-12 w-12" />
                                        </div>
                                    )}
                                </div>
                                <div className="p-6 flex-1 space-y-4">
                                    <div className="flex flex-wrap gap-4 text-sm">
                                        <Badge variant="secondary" className="capitalize">{course.level}</Badge>
                                        <div className="flex items-center text-yellow-500">
                                            <Star className="h-4 w-4 fill-current mr-1" />
                                            <span className="font-medium">{course.rating_average || '0.0'}</span>
                                        </div>
                                        <div className="flex items-center text-muted-foreground">
                                            <Users className="h-4 w-4 mr-1" />
                                            <span>{course.enrollment_count || 0} students</span>
                                        </div>
                                        <div className="flex items-center text-muted-foreground">
                                            <Clock className="h-4 w-4 mr-1" />
                                            <span>{course.duration_weeks} weeks</span>
                                        </div>
                                    </div>

                                    <p className="text-muted-foreground">
                                        {course.short_description || course.description}
                                    </p>

                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="font-medium">Progress</span>
                                            <span className="text-muted-foreground">0% completed</span>
                                        </div>
                                        <Progress value={0} className="h-2" />
                                        <div className="flex justify-between text-xs text-muted-foreground">
                                            <span>Current Grade: N/A</span>
                                            <span>0% complete</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Tabs Navigation */}
                        <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
                            <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent space-x-6">
                                {['Overview', 'Modules', 'Assignments', 'Files', 'Announcements'].map((tab) => (
                                    <TabsTrigger
                                        key={tab}
                                        value={tab.toLowerCase()}
                                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
                                    >
                                        {tab}
                                    </TabsTrigger>
                                ))}
                            </TabsList>

                            {/* Overview Tab */}
                            <TabsContent value="overview" className="mt-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="md:col-span-2 space-y-6">
                                        <section>
                                            <h3 className="text-xl font-semibold mb-3">Course Description</h3>
                                            <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                                                {course.description}
                                            </p>
                                        </section>

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

                                    <div className="space-y-6">
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Course Stats</CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Total Modules</span>
                                                    <span className="font-medium">{modules.length}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Assignments</span>
                                                    <span className="font-medium">{assignments.length}</span>
                                                </div>
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
                                    </div>
                                </div>
                            </TabsContent>

                            {/* Modules Tab */}
                            <TabsContent value="modules" className="mt-6 space-y-6">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h3 className="text-xl font-semibold">Course Modules</h3>
                                            <p className="text-muted-foreground">Track your progress through each module</p>
                                        </div>
                                        {isEditing && (
                                            <Button onClick={() => setIsModuleDialogOpen(true)}>Add Module</Button>
                                        )}
                                    </div>
                                </div>

                                {modules.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        No modules available yet.
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {modules.map((module) => (
                                            <Card key={module.id}>
                                                <CardContent className="p-6 flex items-center justify-between">
                                                    <div className="flex items-start gap-4">
                                                        <div className="mt-1">
                                                            <PlayCircle className="h-5 w-5 text-blue-500" />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-medium text-lg">{module.title}</h4>
                                                            <p className="text-sm text-muted-foreground">
                                                                {module.lessons?.length || 0} lessons
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <Button>
                                                        Continue
                                                    </Button>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </TabsContent>

                            {/* Assignments Tab */}
                            <TabsContent value="assignments" className="mt-6 space-y-6">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h3 className="text-xl font-semibold">Assignments</h3>
                                            <p className="text-muted-foreground">View and submit your assignments</p>
                                        </div>
                                        {isEditing && (
                                            <Button onClick={() => setIsAssignmentDialogOpen(true)}>Add Assignment</Button>
                                        )}
                                    </div>
                                </div>

                                {assignments.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        No assignments due.
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {assignments.map((assignment) => (
                                            <Card key={assignment.id}>
                                                <CardContent className="p-6 space-y-4">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h4 className="font-medium text-lg">{assignment.title}</h4>
                                                            <p className="text-sm text-muted-foreground">
                                                                Due: {assignment.due_date ? new Date(assignment.due_date).toLocaleDateString() : 'No due date'}
                                                            </p>
                                                        </div>
                                                        {assignment.submission_status === 'submitted' ? (
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-bold">{assignment.points_earned}/{assignment.max_points}</span>
                                                                <Badge className="bg-blue-600">submitted</Badge>
                                                            </div>
                                                        ) : (
                                                            <Badge variant="secondary">pending</Badge>
                                                        )}
                                                    </div>

                                                    {assignment.description && (
                                                        <p className="text-sm text-muted-foreground">{assignment.description}</p>
                                                    )}

                                                    {assignment.feedback && (
                                                        <div className="bg-muted p-4 rounded-lg text-sm">
                                                            <p className="font-medium mb-1">Teacher Feedback:</p>
                                                            <p className="text-muted-foreground">{assignment.feedback}</p>
                                                        </div>
                                                    )}

                                                    <div className="flex gap-3">
                                                        <Button variant="outline" size="sm">View Details</Button>
                                                        {assignment.submission_status !== 'submitted' && userRole === 'student' && (
                                                            <Button size="sm">Submit Assignment</Button>
                                                        )}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </TabsContent>

                            {/* Files Tab */}
                            <TabsContent value="files" className="mt-6 space-y-6">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h3 className="text-xl font-semibold">Course Files</h3>
                                            <p className="text-muted-foreground">Download course materials and resources</p>
                                        </div>
                                        {isEditing && (
                                            <Button onClick={() => setIsFileDialogOpen(true)}>Upload File</Button>
                                        )}
                                    </div>
                                </div>

                                {files.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        No files available.
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {files.map((file) => (
                                            <Card key={file.id}>
                                                <CardContent className="p-4 flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className="p-2 bg-muted rounded">
                                                            <FileText className="h-6 w-6 text-blue-500" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium">{file.filename}</p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {(file.file_size / 1024 / 1024).toFixed(2)} MB • Uploaded {new Date(file.created_at).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <Button variant="outline" size="sm">
                                                        <Download className="h-4 w-4 mr-2" />
                                                        Download
                                                    </Button>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </TabsContent>

                            {/* Announcements Tab */}
                            <TabsContent value="announcements" className="mt-6 space-y-6">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h3 className="text-xl font-semibold">Announcements</h3>
                                            <p className="text-muted-foreground">Important updates from your instructor</p>
                                        </div>
                                        {isEditing && (
                                            <Button onClick={() => setIsAnnouncementDialogOpen(true)}>Post Announcement</Button>
                                        )}
                                    </div>
                                </div>

                                {announcements.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        No announcements yet.
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {announcements.map((announcement) => (
                                            <Card key={announcement.id}>
                                                <CardContent className="p-6 space-y-2">
                                                    <div className="flex justify-between items-start">
                                                        <h4 className="font-medium text-lg">{announcement.title}</h4>
                                                        <div className="flex items-center gap-2">
                                                            {announcement.priority === 'high' && (
                                                                <Badge variant="destructive">Important</Badge>
                                                            )}
                                                            <span className="text-sm text-muted-foreground">{new Date(announcement.created_at).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                    <p className="text-muted-foreground">{announcement.content}</p>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </TabsContent>
                        </Tabs>
                    </div>
                </main>
            </div>

            {/* Dialogs */}
            <Dialog open={isModuleDialogOpen} onOpenChange={setIsModuleDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Module</DialogTitle>
                        <DialogDescription>Create a new module for this course.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Title</Label>
                            <Input
                                value={newModule.title}
                                onChange={(e) => setNewModule({ ...newModule, title: e.target.value })}
                                placeholder="Module Title"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea
                                value={newModule.description}
                                onChange={(e) => setNewModule({ ...newModule, description: e.target.value })}
                                placeholder="Module Description"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsModuleDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreateModule}>Create Module</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isAssignmentDialogOpen} onOpenChange={setIsAssignmentDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Assignment</DialogTitle>
                        <DialogDescription>Create a new assignment for students.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Title</Label>
                            <Input
                                value={newAssignment.title}
                                onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                                placeholder="Assignment Title"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea
                                value={newAssignment.description}
                                onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
                                placeholder="Assignment Instructions"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Due Date</Label>
                                <Input
                                    type="date"
                                    value={newAssignment.due_date}
                                    onChange={(e) => setNewAssignment({ ...newAssignment, due_date: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Max Points</Label>
                                <Input
                                    type="number"
                                    value={newAssignment.max_points}
                                    onChange={(e) => setNewAssignment({ ...newAssignment, max_points: parseInt(e.target.value) })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Type</Label>
                            <Select
                                value={newAssignment.assignment_type}
                                onValueChange={(val) => setNewAssignment({ ...newAssignment, assignment_type: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="essay">Essay</SelectItem>
                                    <SelectItem value="quiz">Quiz</SelectItem>
                                    <SelectItem value="project">Project</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAssignmentDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreateAssignment}>Create Assignment</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isFileDialogOpen} onOpenChange={setIsFileDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Upload File</DialogTitle>
                        <DialogDescription>Add a resource file to this course.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Filename</Label>
                            <Input
                                value={newFile.filename}
                                onChange={(e) => setNewFile({ ...newFile, filename: e.target.value })}
                                placeholder="e.g. Course Syllabus.pdf"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>File Path (Simulation)</Label>
                            <Input
                                value={newFile.file_path}
                                onChange={(e) => setNewFile({ ...newFile, file_path: e.target.value })}
                                placeholder="/path/to/file"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsFileDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreateFile}>Add File</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isAnnouncementDialogOpen} onOpenChange={setIsAnnouncementDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Post Announcement</DialogTitle>
                        <DialogDescription>Share an update with your students.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Title</Label>
                            <Input
                                value={newAnnouncement.title}
                                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                                placeholder="Announcement Title"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Content</Label>
                            <Textarea
                                value={newAnnouncement.content}
                                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                                placeholder="Write your announcement here..."
                                className="min-h-[100px]"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Priority</Label>
                            <Select
                                value={newAnnouncement.priority}
                                onValueChange={(val) => setNewAnnouncement({ ...newAnnouncement, priority: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select priority" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAnnouncementDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreateAnnouncement}>Post Announcement</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AuthGuard>
    );
}
