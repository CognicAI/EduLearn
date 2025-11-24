'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { AuthGuard } from '@/lib/auth/auth-guard';
import { DashboardSidebar } from '@/components/layout/dashboard-sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChevronLeft, Save, Trash2, Clock, BookOpen, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { authService } from '@/lib/auth/auth-service';
import { format } from 'date-fns';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from '@/components/ui/badge';

export default function EditUserPage() {
    const router = useRouter();
    const params = useParams();
    const userId = params.id as string;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');
    const [user, setUser] = useState<any>(null);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        role: '',
        status: ''
    });

    useEffect(() => {
        fetchUserDetails();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId]);

    const fetchUserDetails = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/users/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${authService.getAccessToken()}`
                }
            });

            if (!response.ok) throw new Error('Failed to fetch user details');

            const data = await response.json();
            setUser(data.data);
            setFormData({
                firstName: data.data.first_name || '',
                lastName: data.data.last_name || '',
                email: data.data.email || '',
                role: data.data.role || '',
                status: data.data.is_active ? 'active' : 'inactive'
            });
        } catch (error: any) {
            console.error('Error fetching user:', error);
            toast.error('Failed to load user details');
            router.push('/admin/users');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/users/${userId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${authService.getAccessToken()}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) throw new Error('Failed to update user');

            toast.success('User updated successfully');
            fetchUserDetails(); // Refresh data
        } catch (error: any) {
            console.error('Error updating user:', error);
            toast.error('Failed to update user');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${authService.getAccessToken()}`
                }
            });

            if (!response.ok) throw new Error('Failed to delete user');

            toast.success('User deleted successfully');
            router.push('/admin/users');
        } catch (error: any) {
            console.error('Error deleting user:', error);
            toast.error('Failed to delete user');
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <AuthGuard allowedRoles={['admin']}>
            <div className="flex h-screen bg-background">
                <DashboardSidebar />

                <main className="flex-1 overflow-y-auto">
                    <div className="p-6 max-w-5xl mx-auto space-y-6">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <div>
                                    <h1 className="text-3xl font-bold">Edit User</h1>
                                    <p className="text-muted-foreground mt-1">
                                        Manage user profile and view activity
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive">
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Delete User
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action cannot be undone. This will permanently delete the user account
                                                and remove their data from our servers.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                                Delete
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </div>

                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
                                <TabsTrigger value="profile">Profile</TabsTrigger>
                                <TabsTrigger value="activity">Activity Log</TabsTrigger>
                                <TabsTrigger value="enrollments">Enrollments</TabsTrigger>
                            </TabsList>

                            <TabsContent value="profile">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>User Details</CardTitle>
                                        <CardDescription>
                                            Update personal information and account status
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <form onSubmit={handleUpdate} className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="firstName">First Name</Label>
                                                    <Input
                                                        id="firstName"
                                                        value={formData.firstName}
                                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="lastName">Last Name</Label>
                                                    <Input
                                                        id="lastName"
                                                        value={formData.lastName}
                                                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="email">Email</Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="role">Role</Label>
                                                    <Select
                                                        value={formData.role}
                                                        onValueChange={(value) => setFormData({ ...formData, role: value })}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="student">Student</SelectItem>
                                                            <SelectItem value="teacher">Teacher</SelectItem>
                                                            <SelectItem value="admin">Admin</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="status">Status</Label>
                                                    <Select
                                                        value={formData.status}
                                                        onValueChange={(value) => setFormData({ ...formData, status: value })}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="active">Active</SelectItem>
                                                            <SelectItem value="inactive">Inactive</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>

                                            <div className="pt-4 flex justify-end">
                                                <Button type="submit" disabled={saving}>
                                                    <Save className="h-4 w-4 mr-2" />
                                                    {saving ? 'Saving...' : 'Save Changes'}
                                                </Button>
                                            </div>
                                        </form>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="activity">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Activity History</CardTitle>
                                        <CardDescription>
                                            Recent actions performed by this user
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="rounded-md border">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Action</TableHead>
                                                        <TableHead>Description</TableHead>
                                                        <TableHead>Date</TableHead>
                                                        <TableHead>IP Address</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {user?.activityLogs?.length > 0 ? (
                                                        user.activityLogs.map((log: any) => (
                                                            <TableRow key={log.id}>
                                                                <TableCell className="font-medium capitalize">
                                                                    {log.activity_type.replace('_', ' ')}
                                                                </TableCell>
                                                                <TableCell>{log.description}</TableCell>
                                                                <TableCell>
                                                                    {format(new Date(log.created_at), 'MMM d, yyyy HH:mm')}
                                                                </TableCell>
                                                                <TableCell className="font-mono text-xs">
                                                                    {log.ip_address || '-'}
                                                                </TableCell>
                                                            </TableRow>
                                                        ))
                                                    ) : (
                                                        <TableRow>
                                                            <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                                                                No activity recorded
                                                            </TableCell>
                                                        </TableRow>
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="enrollments">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Course Enrollments</CardTitle>
                                        <CardDescription>
                                            Courses this user is currently enrolled in
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="rounded-md border">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Course</TableHead>
                                                        <TableHead>Status</TableHead>
                                                        <TableHead>Progress</TableHead>
                                                        <TableHead>Enrolled Date</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {user?.enrollments?.length > 0 ? (
                                                        user.enrollments.map((enrollment: any) => (
                                                            <TableRow key={enrollment.id}>
                                                                <TableCell className="font-medium">
                                                                    {enrollment.course_title}
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Badge variant={enrollment.status === 'completed' ? 'default' : 'secondary'}>
                                                                        {enrollment.status}
                                                                    </Badge>
                                                                </TableCell>
                                                                <TableCell>{enrollment.progress}%</TableCell>
                                                                <TableCell>
                                                                    {format(new Date(enrollment.enrollment_date), 'MMM d, yyyy')}
                                                                </TableCell>
                                                            </TableRow>
                                                        ))
                                                    ) : (
                                                        <TableRow>
                                                            <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                                                                No enrollments found
                                                            </TableCell>
                                                        </TableRow>
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                </main>
            </div>
        </AuthGuard>
    );
}
