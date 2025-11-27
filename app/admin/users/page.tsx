'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthGuard } from '@/lib/auth/auth-guard';
import { DashboardSidebar } from '@/components/layout/dashboard-sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { authService } from '@/lib/auth/auth-service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCaption,
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
import { Checkbox } from '@/components/ui/checkbox';
import {
    Search,
    UserPlus,
    Download,
    Trash2,
    Edit,
    MoreHorizontal,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';

interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    status: string;
    createdAt: string;
    lastLogin?: string;
    coursesEnrolled: number;
    coursesCreated: number;
}

export default function AdminUsersPage() {
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
    const [filters, setFilters] = useState({
        search: '',
        role: '',
        status: ''
    });
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 50,
        total: 0,
        totalPages: 1
    });

    // Fetch users from API
    const fetchUsers = async (customFilters?: typeof filters, page = pagination.page) => {
        const currentFilters = customFilters || filters;
        try {
            const token = authService.getAccessToken();
            if (!token) {
                toast.error('Not authenticated. Please log in.');
                return;
            }
            setLoading(true);
            const params = new URLSearchParams({
                page: page.toString(),
                limit: pagination.limit.toString(),
                ...(currentFilters.role && currentFilters.role !== 'all' && { role: currentFilters.role }),
                ...(currentFilters.status && currentFilters.status !== 'all' && { status: currentFilters.status }),
                ...(currentFilters.search && { search: currentFilters.search })
            });

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/users?${params}`, {
                headers: {
                    'Authorization': `Bearer ${authService.getAccessToken()}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error('Failed to fetch users');

            const data = await response.json();
            setUsers(data.data);
            if (data.pagination) {
                setPagination(prev => ({ ...prev, ...data.pagination }));
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pagination.page, filters.role, filters.status]);

    const handleSearch = () => {
        setPagination(prev => ({ ...prev, page: 1 }));
        fetchUsers();
    };

    const handleClearFilters = () => {
        const clearedFilters = { search: '', role: 'all', status: 'all' };
        setFilters(clearedFilters);
        setPagination(prev => ({ ...prev, page: 1 }));
        fetchUsers(clearedFilters, 1);
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedUsers(new Set(users.map(u => u.id)));
        } else {
            setSelectedUsers(new Set());
        }
    };

    const handleSelectUser = (userId: string, checked: boolean) => {
        const newSelected = new Set(selectedUsers);
        if (checked) {
            newSelected.add(userId);
        } else {
            newSelected.delete(userId);
        }
        setSelectedUsers(newSelected);
    };

    const handleBulkDelete = async () => {
        if (selectedUsers.size === 0) {
            toast.error('No users selected');
            return;
        }

        if (!confirm(`Are you sure you want to delete ${selectedUsers.size} users?`)) {
            return;
        }

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/users/bulk/delete`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authService.getAccessToken()}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userIds: Array.from(selectedUsers) })
            });

            if (!response.ok) throw new Error('Failed to delete users');

            toast.success(`Successfully deleted ${selectedUsers.size} users`);
            setSelectedUsers(new Set());
            fetchUsers();
        } catch (error) {
            console.error('Error deleting users:', error);
            toast.error('Failed to delete users');
        }
    };

    const handleBulkUpdateStatus = async (isActive: boolean) => {
        if (selectedUsers.size === 0) {
            toast.error('No users selected');
            return;
        }

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/users/bulk/update-status`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authService.getAccessToken()}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userIds: Array.from(selectedUsers), isActive })
            });

            if (!response.ok) throw new Error('Failed to update users');

            toast.success(`Successfully updated ${selectedUsers.size} users`);
            setSelectedUsers(new Set());
            fetchUsers();
        } catch (error) {
            console.error('Error updating users:', error);
            toast.error('Failed to update users');
        }
    };

    const handleExport = async () => {
        try {
            const params = new URLSearchParams({
                ...(filters.role && filters.role !== 'all' && { role: filters.role }),
                ...(filters.status && filters.status !== 'all' && { status: filters.status }),
                ...(filters.search && { search: filters.search })
            });

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/users/export/csv?${params}`, {
                headers: {
                    'Authorization': `Bearer ${authService.getAccessToken()}`,
                }
            });

            if (!response.ok) throw new Error('Failed to export users');

            const data = await response.json();

            // Convert to CSV
            const csv = convertToCSV(data.data);
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `users-export-${new Date().toISOString()}.csv`;
            a.click();

            toast.success('Users exported successfully');
        } catch (error) {
            console.error('Error exporting users:', error);
            toast.error('Failed to export users');
        }
    };

    const convertToCSV = (data: any[]) => {
        if (data.length === 0) return '';
        const headers = Object.keys(data[0]).join(',');
        const rows = data.map(row => Object.values(row).join(',')).join('\n');
        return headers + '\n' + rows;
    };

    return (
        <AuthGuard allowedRoles={['admin']}>
            <div className="flex h-screen bg-background">
                <DashboardSidebar />

                <main className="flex-1 overflow-y-auto">
                    <div className="p-6 space-y-6">
                        {/* Header */}
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-3xl font-bold">User Management</h1>
                                <p className="text-muted-foreground mt-1">
                                    Manage all platform users with full access to all fields
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" onClick={handleExport}>
                                    <Download className="h-4 w-4 mr-2" />
                                    Export CSV
                                </Button>
                                <Button onClick={() => router.push('/admin/users/new')}>
                                    <UserPlus className="h-4 w-4 mr-2" />
                                    Add User
                                </Button>
                            </div>
                        </div>

                        {/* Filters */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Filters</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <Input
                                            placeholder="Search by name or email..."
                                            value={filters.search}
                                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                            onKeyDown={(e) => { if (e.key === 'Enter') handleSearch() }}
                                        />
                                    </div>
                                    <Select value={filters.role} onValueChange={(value) => setFilters({ ...filters, role: value })}>
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder="All Roles" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Roles</SelectItem>
                                            <SelectItem value="student">Student</SelectItem>
                                            <SelectItem value="teacher">Teacher</SelectItem>
                                            <SelectItem value="admin">Admin</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder="All Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Status</SelectItem>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="inactive">Inactive</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Button onClick={handleSearch}>
                                        <Search className="h-4 w-4 mr-2" />
                                        Search
                                    </Button>
                                    <Button variant="outline" onClick={handleClearFilters}>
                                        Clear
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Bulk Actions */}
                        {selectedUsers.size > 0 && (
                            <Card className="bg-accent">
                                <CardContent className="flex items-center justify-between p-4">
                                    <span className="font-medium">
                                        {selectedUsers.size} user(s) selected
                                    </span>
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="outline" onClick={() => handleBulkUpdateStatus(true)}>
                                            Activate
                                        </Button>
                                        <Button size="sm" variant="outline" onClick={() => handleBulkUpdateStatus(false)}>
                                            Deactivate
                                        </Button>
                                        <Button size="sm" variant="destructive" onClick={handleBulkDelete}>
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Delete Selected
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Users Table */}
                        <Card>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12">
                                            <Checkbox
                                                checked={selectedUsers.size === users.length && users.length > 0}
                                                onCheckedChange={handleSelectAll}
                                            />
                                        </TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Courses</TableHead>
                                        <TableHead>Last Login</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow key="loading">
                                            <TableCell colSpan={8} className="text-center py-8">
                                                Loading users...
                                            </TableCell>
                                        </TableRow>
                                    ) : users.length === 0 ? (
                                        <TableRow key="empty">
                                            <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                                No users found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        users.map((user) => (
                                            <TableRow key={user.id}>
                                                <TableCell>
                                                    <Checkbox
                                                        checked={selectedUsers.has(user.id)}
                                                        onCheckedChange={(checked) => handleSelectUser(user.id, checked as boolean)}
                                                    />
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    {user.firstName} {user.lastName}
                                                </TableCell>
                                                <TableCell>{user.email}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">{user.role}</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                                                        {user.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {user.role === 'student' ? user.coursesEnrolled : user.coursesCreated}
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => router.push(`/admin/users/${user.id}`)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>

                            {/* Pagination */}
                            {!loading && pagination.totalPages > 1 && (
                                <div className="flex items-center justify-between p-4 border-t">
                                    <div className="text-sm text-muted-foreground">
                                        Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                                        {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                                        {pagination.total} users
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                                            disabled={pagination.page === 1}
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                            Previous
                                        </Button>
                                        <div className="flex items-center gap-1">
                                            <span className="text-sm">
                                                Page {pagination.page} of {pagination.totalPages}
                                            </span>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                                            disabled={pagination.page === pagination.totalPages}
                                        >
                                            Next
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </Card>
                    </div>
                </main>
            </div>
        </AuthGuard>
    );
}
