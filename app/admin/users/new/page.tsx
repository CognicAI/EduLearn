'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { ChevronLeft, Upload, FileUp, Download, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { authService } from '@/lib/auth/auth-service';
import Papa from 'papaparse';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function NewUserPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('manual');

    // Manual Entry State
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        role: 'student',
        status: 'active'
    });

    // Bulk Upload State
    const [csvData, setCsvData] = useState<any[]>([]);
    const [parseError, setParseError] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);

    const handleManualSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/users`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authService.getAccessToken()}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to create user');
            }

            toast.success('User created successfully');
            router.push('/admin/users');
        } catch (error: any) {
            console.error('Error creating user:', error);
            toast.error(error.message || 'Failed to create user');
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setFileName(file.name);
        setParseError(null);
        setCsvData([]);

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                if (results.errors.length > 0) {
                    setParseError(`Error parsing CSV: ${results.errors[0].message}`);
                    return;
                }

                // Validate headers
                const headers = results.meta.fields || [];
                const requiredHeaders = ['email', 'firstName', 'lastName', 'role'];
                const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));

                if (missingHeaders.length > 0) {
                    setParseError(`Missing required columns: ${missingHeaders.join(', ')}`);
                    return;
                }

                setCsvData(results.data);
            },
            error: (error) => {
                setParseError(`Error reading file: ${error.message}`);
            }
        });
    };

    const handleBulkSubmit = async () => {
        if (csvData.length === 0) return;
        setLoading(true);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/users/bulk/import`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authService.getAccessToken()}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ users: csvData })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to import users');
            }

            const result = await response.json();
            toast.success(`Successfully imported ${result.data.imported} users`);
            if (result.data.failed > 0) {
                toast.warning(`${result.data.failed} users failed to import`);
            }
            router.push('/admin/users');
        } catch (error: any) {
            console.error('Error importing users:', error);
            toast.error(error.message || 'Failed to import users');
        } finally {
            setLoading(false);
        }
    };

    const downloadTemplate = () => {
        const headers = ['email', 'firstName', 'lastName', 'role'];
        const csvContent = headers.join(',') + '\nstudent@example.com,John,Doe,student';
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'user-import-template.csv';
        a.click();
    };

    return (
        <AuthGuard allowedRoles={['admin']}>
            <div className="flex h-screen bg-background">
                <DashboardSidebar />

                <main className="flex-1 overflow-y-auto">
                    <div className="p-6 max-w-4xl mx-auto space-y-6">
                        {/* Header */}
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="icon" onClick={() => router.back()}>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <div>
                                <h1 className="text-3xl font-bold">Add New User</h1>
                                <p className="text-muted-foreground mt-1">
                                    Create a new user manually or import from CSV
                                </p>
                            </div>
                        </div>

                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="manual">Manual Entry</TabsTrigger>
                                <TabsTrigger value="bulk">Bulk Upload</TabsTrigger>
                            </TabsList>

                            <TabsContent value="manual">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>User Details</CardTitle>
                                        <CardDescription>
                                            Enter the details for the new user. A default password will be assigned.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <form onSubmit={handleManualSubmit} className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="firstName">First Name</Label>
                                                    <Input
                                                        id="firstName"
                                                        required
                                                        value={formData.firstName}
                                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="lastName">Last Name</Label>
                                                    <Input
                                                        id="lastName"
                                                        required
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
                                                    required
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
                                                <Button type="submit" disabled={loading}>
                                                    {loading ? 'Creating...' : 'Create User'}
                                                </Button>
                                            </div>
                                        </form>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="bulk">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Bulk Import</CardTitle>
                                        <CardDescription>
                                            Upload a CSV file to create multiple users at once.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                                            <div className="flex items-center gap-4">
                                                <div className="p-2 bg-background rounded-full border">
                                                    <FileUp className="h-6 w-6 text-primary" />
                                                </div>
                                                <div>
                                                    <h3 className="font-medium">CSV Template</h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        Download the template to ensure correct formatting
                                                    </p>
                                                </div>
                                            </div>
                                            <Button variant="outline" size="sm" onClick={downloadTemplate}>
                                                <Download className="h-4 w-4 mr-2" />
                                                Download Template
                                            </Button>
                                        </div>

                                        <div className="grid w-full max-w-sm items-center gap-1.5">
                                            <Label htmlFor="csv">Upload CSV</Label>
                                            <Input
                                                id="csv"
                                                type="file"
                                                accept=".csv"
                                                onChange={handleFileUpload}
                                            />
                                        </div>

                                        {parseError && (
                                            <Alert variant="destructive">
                                                <AlertCircle className="h-4 w-4" />
                                                <AlertTitle>Error</AlertTitle>
                                                <AlertDescription>{parseError}</AlertDescription>
                                            </Alert>
                                        )}

                                        {csvData.length > 0 && (
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2 text-green-600">
                                                        <CheckCircle2 className="h-4 w-4" />
                                                        <span className="text-sm font-medium">
                                                            {csvData.length} users ready to import
                                                        </span>
                                                    </div>
                                                    <Button onClick={handleBulkSubmit} disabled={loading}>
                                                        {loading ? 'Importing...' : 'Import Users'}
                                                    </Button>
                                                </div>

                                                <div className="border rounded-md max-h-[300px] overflow-auto">
                                                    <Table>
                                                        <TableHeader>
                                                            <TableRow>
                                                                <TableHead>First Name</TableHead>
                                                                <TableHead>Last Name</TableHead>
                                                                <TableHead>Email</TableHead>
                                                                <TableHead>Role</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {csvData.slice(0, 5).map((row, i) => (
                                                                <TableRow key={i}>
                                                                    <TableCell>{row.firstName}</TableCell>
                                                                    <TableCell>{row.lastName}</TableCell>
                                                                    <TableCell>{row.email}</TableCell>
                                                                    <TableCell>{row.role}</TableCell>
                                                                </TableRow>
                                                            ))}
                                                            {csvData.length > 5 && (
                                                                <TableRow>
                                                                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                                                                        ...and {csvData.length - 5} more
                                                                    </TableCell>
                                                                </TableRow>
                                                            )}
                                                        </TableBody>
                                                    </Table>
                                                </div>
                                            </div>
                                        )}
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
