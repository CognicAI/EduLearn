'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { AuthGuard } from '@/lib/auth/auth-guard';
import { DashboardSidebar } from '@/components/layout/dashboard-sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Megaphone, 
  Users, 
  GraduationCap, 
  BookOpenIcon,
  Calendar as CalendarIcon,
  Eye,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

// Mock announcements data
const mockAnnouncements = [
  {
    id: '1',
    title: 'System Maintenance Scheduled',
    content: 'We will be performing scheduled maintenance on Sunday, January 28th from 2:00 AM to 6:00 AM EST. During this time, the platform may be temporarily unavailable.',
    audience: 'all',
    priority: 'high',
    isActive: true,
    expiresAt: '2024-01-30',
    createdAt: '2024-01-20',
    views: 1247,
    author: 'System Admin'
  },
  {
    id: '2',
    title: 'New Course: Advanced Machine Learning',
    content: 'We are excited to announce a new course on Advanced Machine Learning starting February 1st. This course covers deep learning, neural networks, and practical AI applications.',
    audience: 'students',
    priority: 'medium',
    isActive: true,
    expiresAt: '2024-02-15',
    createdAt: '2024-01-18',
    views: 892,
    author: 'Academic Team'
  },
  {
    id: '3',
    title: 'Teacher Training Workshop',
    content: 'Join us for a comprehensive training workshop on using the new grading tools and analytics dashboard. Session will be held on January 25th at 3:00 PM.',
    audience: 'teachers',
    priority: 'medium',
    isActive: true,
    expiresAt: '2024-01-26',
    createdAt: '2024-01-15',
    views: 67,
    author: 'Training Team'
  },
  {
    id: '4',
    title: 'Holiday Schedule Update',
    content: 'Please note the updated holiday schedule for February. Classes will resume on February 19th after the Presidents Day holiday.',
    audience: 'all',
    priority: 'low',
    isActive: false,
    expiresAt: '2024-02-20',
    createdAt: '2024-01-10',
    views: 2156,
    author: 'Administration'
  }
];

export default function AdminAnnouncementsPage() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState(mockAnnouncements);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<typeof mockAnnouncements[0] | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    audience: 'all',
    priority: 'medium',
    expiresAt: undefined as Date | undefined
  });

  const handleCreateAnnouncement = () => {
    setEditingAnnouncement(null);
    setFormData({
      title: '',
      content: '',
      audience: 'all',
      priority: 'medium',
      expiresAt: undefined
    });
    setIsCreateDialogOpen(true);
  };

  const handleEditAnnouncement = (announcement: typeof mockAnnouncements[0]) => {
    setEditingAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      audience: announcement.audience,
      priority: announcement.priority,
      expiresAt: new Date(announcement.expiresAt)
    });
    setIsCreateDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    const announcementData = {
      ...formData,
      expiresAt: formData.expiresAt ? format(formData.expiresAt, 'yyyy-MM-dd') : '',
      isActive: true,
      views: editingAnnouncement?.views || 0,
      author: user?.firstName + ' ' + user?.lastName || 'Admin',
      createdAt: editingAnnouncement?.createdAt || new Date().toISOString().split('T')[0]
    };

    if (editingAnnouncement) {
      setAnnouncements(prev => prev.map(announcement => 
        announcement.id === editingAnnouncement.id 
          ? { ...announcement, ...announcementData }
          : announcement
      ));
      toast.success('Announcement updated successfully!');
    } else {
      const newAnnouncement = {
        id: Date.now().toString(),
        ...announcementData
      };
      setAnnouncements(prev => [newAnnouncement, ...prev]);
      toast.success('Announcement created successfully!');
    }

    setIsCreateDialogOpen(false);
  };

  const handleToggleActive = (announcementId: string) => {
    setAnnouncements(prev => prev.map(announcement => 
      announcement.id === announcementId 
        ? { ...announcement, isActive: !announcement.isActive }
        : announcement
    ));
    toast.success('Announcement status updated');
  };

  const handleDeleteAnnouncement = (announcementId: string) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      setAnnouncements(prev => prev.filter(announcement => announcement.id !== announcementId));
      toast.success('Announcement deleted successfully!');
    }
  };

  const getAudienceIcon = (audience: string) => {
    switch (audience) {
      case 'students':
        return <GraduationCap className="h-4 w-4" />;
      case 'teachers':
        return <BookOpenIcon className="h-4 w-4" />;
      case 'all':
        return <Users className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const getAudienceColor = (audience: string) => {
    switch (audience) {
      case 'students':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'teachers':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'all':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertCircle className="h-3 w-3" />;
      case 'medium':
        return <Clock className="h-3 w-3" />;
      case 'low':
        return <CheckCircle className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  const announcementStats = {
    total: announcements.length,
    active: announcements.filter(a => a.isActive).length,
    totalViews: announcements.reduce((sum, a) => sum + a.views, 0),
    highPriority: announcements.filter(a => a.priority === 'high' && a.isActive).length
  };

  return (
    <AuthGuard allowedRoles={['admin']}>
      <div className="flex h-screen bg-background">
        <DashboardSidebar />
        
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Announcements</h1>
                <p className="text-muted-foreground mt-2">
                  Create and manage platform-wide announcements
                </p>
              </div>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={handleCreateAnnouncement}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Announcement
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>
                      {editingAnnouncement ? 'Edit Announcement' : 'Create New Announcement'}
                    </DialogTitle>
                    <DialogDescription>
                      {editingAnnouncement ? 'Update announcement details' : 'Create a new announcement for the platform'}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Announcement title"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="content">Content *</Label>
                      <Textarea
                        id="content"
                        value={formData.content}
                        onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                        placeholder="Announcement content..."
                        rows={4}
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="audience">Audience</Label>
                        <Select value={formData.audience} onValueChange={(value) => setFormData(prev => ({ ...prev, audience: value }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Users</SelectItem>
                            <SelectItem value="students">Students Only</SelectItem>
                            <SelectItem value="teachers">Teachers Only</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="priority">Priority</Label>
                        <Select value={formData.priority} onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="low">Low</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Expiration Date (Optional)</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left font-normal">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.expiresAt ? format(formData.expiresAt, 'PPP') : 'No expiration'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={formData.expiresAt}
                            onSelect={(date) => setFormData(prev => ({ ...prev, expiresAt: date }))}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    
                    <div className="flex justify-end space-x-2 pt-4">
                      <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">
                        {editingAnnouncement ? 'Update Announcement' : 'Create Announcement'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Announcements</CardTitle>
                  <Megaphone className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{announcementStats.total}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{announcementStats.active}</div>
                  <p className="text-xs text-muted-foreground">
                    {Math.round((announcementStats.active / announcementStats.total) * 100)}% of total
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{announcementStats.totalViews.toLocaleString()}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">High Priority</CardTitle>
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{announcementStats.highPriority}</div>
                  <p className="text-xs text-muted-foreground">Active urgent items</p>
                </CardContent>
              </Card>
            </div>

            {/* Announcements List */}
            <div className="space-y-4">
              {announcements.map((announcement) => (
                <Card key={announcement.id} className={`hover:shadow-md transition-shadow ${!announcement.isActive ? 'opacity-60' : ''}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-lg">{announcement.title}</CardTitle>
                          <Badge className={getPriorityColor(announcement.priority)}>
                            {getPriorityIcon(announcement.priority)}
                            <span className="ml-1">{announcement.priority}</span>
                          </Badge>
                          <Badge className={getAudienceColor(announcement.audience)}>
                            {getAudienceIcon(announcement.audience)}
                            <span className="ml-1">{announcement.audience}</span>
                          </Badge>
                        </div>
                        <CardDescription className="mb-3">
                          {announcement.content}
                        </CardDescription>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>By {announcement.author}</span>
                          <span>Created: {new Date(announcement.createdAt).toLocaleDateString()}</span>
                          <span>Expires: {new Date(announcement.expiresAt).toLocaleDateString()}</span>
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {announcement.views} views
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center space-x-2">
                          <Label htmlFor={`active-${announcement.id}`} className="text-sm">
                            {announcement.isActive ? 'Active' : 'Inactive'}
                          </Label>
                          <Switch
                            id={`active-${announcement.id}`}
                            checked={announcement.isActive}
                            onCheckedChange={() => handleToggleActive(announcement.id)}
                          />
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEditAnnouncement(announcement)}>
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleDeleteAnnouncement(announcement.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {announcements.length === 0 && (
              <div className="text-center py-12">
                <Megaphone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No announcements yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first announcement to communicate with users.
                </p>
                <Button onClick={handleCreateAnnouncement}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Announcement
                </Button>
              </div>
            )}
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}