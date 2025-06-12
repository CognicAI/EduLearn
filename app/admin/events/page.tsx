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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Users,
  Send,
  CheckCircle,
  AlertCircle,
  Settings
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

// Mock events data
const mockEvents = [
  {
    id: '1',
    title: 'System Maintenance Window',
    description: 'Scheduled maintenance for database optimization and security updates',
    type: 'maintenance',
    audience: 'all',
    date: '2024-01-28',
    time: '02:00',
    duration: '240',
    location: 'System-wide',
    status: 'scheduled',
    notificationSent: true,
    attendees: 0,
    createdBy: 'System Admin'
  },
  {
    id: '2',
    title: 'New Feature Training Session',
    description: 'Learn about the new analytics dashboard and reporting features',
    type: 'training',
    audience: 'teachers',
    date: '2024-01-25',
    time: '15:00',
    duration: '90',
    location: 'Virtual Meeting Room',
    status: 'scheduled',
    notificationSent: true,
    attendees: 23,
    createdBy: 'Training Team'
  },
  {
    id: '3',
    title: 'Student Orientation Webinar',
    description: 'Welcome session for new students joining the platform',
    type: 'orientation',
    audience: 'students',
    date: '2024-02-01',
    time: '14:00',
    duration: '60',
    location: 'Main Auditorium',
    status: 'scheduled',
    notificationSent: false,
    attendees: 156,
    createdBy: 'Student Services'
  },
  {
    id: '4',
    title: 'Platform Update Announcement',
    description: 'Important updates about new features and policy changes',
    type: 'announcement',
    audience: 'all',
    date: '2024-01-22',
    time: '10:00',
    duration: '30',
    location: 'Platform-wide',
    status: 'completed',
    notificationSent: true,
    attendees: 1247,
    createdBy: 'Product Team'
  }
];

const eventTypes = [
  { value: 'maintenance', label: 'System Maintenance' },
  { value: 'training', label: 'Training Session' },
  { value: 'orientation', label: 'Orientation' },
  { value: 'announcement', label: 'Announcement' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'webinar', label: 'Webinar' }
];

export default function AdminEventsPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState(mockEvents);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<typeof mockEvents[0] | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'announcement',
    audience: 'all',
    date: undefined as Date | undefined,
    time: '',
    duration: '',
    location: ''
  });

  const handleCreateEvent = () => {
    setEditingEvent(null);
    setFormData({
      title: '',
      description: '',
      type: 'announcement',
      audience: 'all',
      date: undefined,
      time: '',
      duration: '',
      location: ''
    });
    setIsCreateDialogOpen(true);
  };

  const handleEditEvent = (event: typeof mockEvents[0]) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      type: event.type,
      audience: event.audience,
      date: new Date(event.date),
      time: event.time,
      duration: event.duration,
      location: event.location
    });
    setIsCreateDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.type || !formData.date || !formData.time) {
      toast.error('Please fill in all required fields');
      return;
    }

    const eventData = {
      ...formData,
      date: format(formData.date, 'yyyy-MM-dd'),
      duration: formData.duration || '60',
      status: 'scheduled',
      notificationSent: false,
      attendees: editingEvent?.attendees || 0,
      createdBy: user?.firstName + ' ' + user?.lastName || 'Admin'
    };

    if (editingEvent) {
      setEvents(prev => prev.map(event => 
        event.id === editingEvent.id 
          ? { ...event, ...eventData }
          : event
      ));
      toast.success('Event updated successfully!');
    } else {
      const newEvent = {
        id: Date.now().toString(),
        ...eventData
      };
      setEvents(prev => [newEvent, ...prev]);
      toast.success('Event created successfully!');
    }

    setIsCreateDialogOpen(false);
  };

  const handleSendNotification = (eventId: string) => {
    setEvents(prev => prev.map(event => 
      event.id === eventId 
        ? { ...event, notificationSent: true }
        : event
    ));
    toast.success('Notification sent to all participants!');
  };

  const handleDeleteEvent = (eventId: string) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      setEvents(prev => prev.filter(event => event.id !== eventId));
      toast.success('Event deleted successfully!');
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'maintenance':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'training':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'orientation':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'announcement':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'meeting':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'workshop':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'webinar':
        return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const upcomingEvents = events
    .filter(event => new Date(event.date) >= new Date() && event.status === 'scheduled')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  const eventStats = {
    total: events.length,
    scheduled: events.filter(e => e.status === 'scheduled').length,
    completed: events.filter(e => e.status === 'completed').length,
    totalAttendees: events.reduce((sum, e) => sum + e.attendees, 0)
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
                <h1 className="text-3xl font-bold text-foreground">System Events</h1>
                <p className="text-muted-foreground mt-2">
                  Manage platform-wide events and notifications
                </p>
              </div>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={handleCreateEvent}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Event
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>
                      {editingEvent ? 'Edit Event' : 'Create New Event'}
                    </DialogTitle>
                    <DialogDescription>
                      {editingEvent ? 'Update event details' : 'Schedule a new system event'}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Event Title *</Label>
                        <Input
                          id="title"
                          value={formData.title}
                          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="System Maintenance"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="type">Event Type *</Label>
                        <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            {eventTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Event description..."
                        rows={3}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="audience">Target Audience</Label>
                      <Select value={formData.audience} onValueChange={(value) => setFormData(prev => ({ ...prev, audience: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Users</SelectItem>
                          <SelectItem value="students">Students Only</SelectItem>
                          <SelectItem value="teachers">Teachers Only</SelectItem>
                          <SelectItem value="admins">Admins Only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Date *</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start text-left font-normal">
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {formData.date ? format(formData.date, 'PPP') : 'Pick a date'}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={formData.date}
                              onSelect={(date) => setFormData(prev => ({ ...prev, date }))}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="time">Time *</Label>
                        <Input
                          id="time"
                          type="time"
                          value={formData.time}
                          onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="duration">Duration (minutes)</Label>
                        <Input
                          id="duration"
                          type="number"
                          value={formData.duration}
                          onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                          placeholder="60"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                        placeholder="Virtual Meeting Room"
                      />
                    </div>
                    
                    <div className="flex justify-end space-x-2 pt-4">
                      <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">
                        {editingEvent ? 'Update Event' : 'Create Event'}
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
                  <CardTitle className="text-sm font-medium">Total Events</CardTitle>
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{eventStats.total}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{eventStats.scheduled}</div>
                  <p className="text-xs text-muted-foreground">Upcoming events</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completed</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{eventStats.completed}</div>
                  <p className="text-xs text-muted-foreground">Past events</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Attendees</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{eventStats.totalAttendees.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">All events combined</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Events List */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>All Events</CardTitle>
                    <CardDescription>
                      Manage system events and notifications
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {events.map((event) => (
                      <div key={event.id} className="p-4 border rounded-lg hover:shadow-sm transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-medium">{event.title}</h4>
                              <Badge className={getEventTypeColor(event.type)}>
                                {eventTypes.find(t => t.value === event.type)?.label || event.type}
                              </Badge>
                              <Badge className={getStatusColor(event.status)}>
                                {event.status}
                              </Badge>
                            </div>
                            {event.description && (
                              <p className="text-sm text-muted-foreground mb-2">{event.description}</p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            {!event.notificationSent && event.status === 'scheduled' && (
                              <Button size="sm" variant="outline" onClick={() => handleSendNotification(event.id)}>
                                <Send className="h-4 w-4 mr-1" />
                                Send Notification
                              </Button>
                            )}
                            <Button size="sm" variant="outline" onClick={() => handleEditEvent(event)}>
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleDeleteEvent(event.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <CalendarIcon className="h-3 w-3" />
                            {format(new Date(event.date), 'MMM dd, yyyy')}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTime(event.time)} ({event.duration} min)
                          </div>
                          {event.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {event.location}
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {event.attendees} attendees
                          </div>
                          {event.notificationSent && (
                            <div className="flex items-center gap-1 text-green-600">
                              <CheckCircle className="h-3 w-3" />
                              Notified
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {events.length === 0 && (
                      <div className="text-center py-8">
                        <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No events scheduled</h3>
                        <p className="text-muted-foreground mb-4">
                          Create your first system event to get started.
                        </p>
                        <Button onClick={handleCreateEvent}>
                          <Plus className="h-4 w-4 mr-2" />
                          Create Event
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Upcoming Events Sidebar */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Upcoming Events</CardTitle>
                    <CardDescription>
                      Next {upcomingEvents.length} scheduled events
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {upcomingEvents.map((event) => (
                      <div key={event.id} className="p-3 bg-muted/50 rounded-lg">
                        <h4 className="font-medium text-sm mb-1">{event.title}</h4>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <CalendarIcon className="h-3 w-3" />
                          {format(new Date(event.date), 'MMM dd')}
                          <Clock className="h-3 w-3" />
                          {formatTime(event.time)}
                        </div>
                        <Badge className={`${getEventTypeColor(event.type)} mt-2`} size="sm">
                          {eventTypes.find(t => t.value === event.type)?.label}
                        </Badge>
                      </div>
                    ))}
                    
                    {upcomingEvents.length === 0 && (
                      <div className="text-center py-4">
                        <p className="text-sm text-muted-foreground">No upcoming events</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button variant="outline" className="w-full justify-start" onClick={handleCreateEvent}>
                      <Plus className="h-4 w-4 mr-2" />
                      Schedule Event
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Settings className="h-4 w-4 mr-2" />
                      Event Settings
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      View Calendar
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}