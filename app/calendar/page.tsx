'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { AuthGuard } from '@/lib/auth/auth-guard';
import { DashboardSidebar } from '@/components/layout/dashboard-sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, CalendarDays, Clock, Plus, Filter, ChevronLeft, ChevronRight } from 'lucide-react';

// Mock calendar events
const mockEvents = [
  {
    id: '1',
    title: 'JavaScript Functions Quiz',
    type: 'assignment',
    course: 'Web Development Fundamentals',
    date: '2024-01-15',
    time: '11:59 PM',
    status: 'upcoming',
  },
  {
    id: '2',
    title: 'Database Design Project Due',
    type: 'assignment',
    course: 'Database Design Fundamentals',
    date: '2024-01-20',
    time: '11:59 PM',
    status: 'upcoming',
  },
  {
    id: '3',
    title: 'Computer Science Lecture',
    type: 'class',
    course: 'Introduction to Computer Science',
    date: '2024-01-16',
    time: '10:00 AM',
    status: 'upcoming',
  },
  {
    id: '4',
    title: 'Web Development Workshop',
    type: 'workshop',
    course: 'Advanced Web Development',
    date: '2024-01-18',
    time: '2:00 PM',
    status: 'upcoming',
  },
  {
    id: '5',
    title: 'Algorithm Analysis Report',
    type: 'assignment',
    course: 'Introduction to Computer Science',
    date: '2024-01-25',
    time: '11:59 PM',
    status: 'upcoming',
  },
];

const teacherEvents = [
  {
    id: '1',
    title: 'Grade JavaScript Quiz',
    type: 'grading',
    course: 'Web Development Fundamentals',
    date: '2024-01-16',
    time: '9:00 AM',
    status: 'pending',
  },
  {
    id: '2',
    title: 'Computer Science Lecture',
    type: 'class',
    course: 'Introduction to Computer Science',
    date: '2024-01-16',
    time: '10:00 AM',
    status: 'upcoming',
  },
  {
    id: '3',
    title: 'Office Hours',
    type: 'office-hours',
    course: 'All Courses',
    date: '2024-01-17',
    time: '2:00 PM',
    status: 'upcoming',
  },
  {
    id: '4',
    title: 'Faculty Meeting',
    type: 'meeting',
    course: 'Administration',
    date: '2024-01-19',
    time: '3:00 PM',
    status: 'upcoming',
  },
];

export default function CalendarPage() {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedFilter, setSelectedFilter] = useState('all');

  const events = user?.role === 'teacher' ? teacherEvents : mockEvents;

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'assignment':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'class':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'workshop':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'grading':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'office-hours':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'meeting':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const isToday = (dateString: string) => {
    const today = new Date();
    const eventDate = new Date(dateString);
    return today.toDateString() === eventDate.toDateString();
  };

  const isThisWeek = (dateString: string) => {
    const today = new Date();
    const eventDate = new Date(dateString);
    const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
    const weekEnd = new Date(today.setDate(today.getDate() - today.getDay() + 6));
    return eventDate >= weekStart && eventDate <= weekEnd;
  };

  const filteredEvents = events.filter(event => {
    switch (selectedFilter) {
      case 'today':
        return isToday(event.date);
      case 'week':
        return isThisWeek(event.date);
      case 'assignments':
        return event.type === 'assignment';
      case 'classes':
        return event.type === 'class';
      default:
        return true;
    }
  });

  const upcomingEvents = filteredEvents
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 10);

  return (
    <AuthGuard>
      <div className="flex h-screen bg-background">
        <DashboardSidebar />
        
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Calendar
                </h1>
                <p className="text-muted-foreground mt-2">
                  {user?.role === 'teacher' 
                    ? 'Manage your schedule and important dates'
                    : 'Keep track of assignments, classes, and important dates'
                  }
                </p>
              </div>
              {user?.role === 'teacher' && (
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Event
                </Button>
              )}
            </div>

            {/* Calendar Navigation */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <Button variant="outline" size="icon">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <h2 className="text-xl font-semibold">
                  {currentDate.toLocaleDateString('en-US', { 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </h2>
                <Button variant="outline" size="icon">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant={selectedFilter === 'all' ? 'default' : 'outline'}
                  onClick={() => setSelectedFilter('all')}
                >
                  All
                </Button>
                <Button 
                  variant={selectedFilter === 'today' ? 'default' : 'outline'}
                  onClick={() => setSelectedFilter('today')}
                >
                  Today
                </Button>
                <Button 
                  variant={selectedFilter === 'week' ? 'default' : 'outline'}
                  onClick={() => setSelectedFilter('week')}
                >
                  This Week
                </Button>
                <Button 
                  variant={selectedFilter === 'assignments' ? 'default' : 'outline'}
                  onClick={() => setSelectedFilter('assignments')}
                >
                  Assignments
                </Button>
                <Button 
                  variant={selectedFilter === 'classes' ? 'default' : 'outline'}
                  onClick={() => setSelectedFilter('classes')}
                >
                  Classes
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Calendar View */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CalendarDays className="h-5 w-5" />
                      Calendar View
                    </CardTitle>
                    <CardDescription>
                      Visual calendar representation (simplified view)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-7 gap-2 mb-4">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
                          {day}
                        </div>
                      ))}
                    </div>
                    
                    <div className="grid grid-cols-7 gap-2">
                      {Array.from({ length: 35 }, (_, i) => {
                        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i - 6);
                        const isCurrentMonth = date.getMonth() === currentDate.getMonth();
                        const hasEvents = events.some(event => 
                          new Date(event.date).toDateString() === date.toDateString()
                        );
                        
                        return (
                          <div
                            key={i}
                            className={`
                              aspect-square p-2 text-sm border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors
                              ${isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'}
                              ${hasEvents ? 'bg-primary/10 border-primary/20' : 'border-border'}
                              ${isToday(date.toISOString()) ? 'bg-primary text-primary-foreground' : ''}
                            `}
                          >
                            <div className="font-medium">{date.getDate()}</div>
                            {hasEvents && (
                              <div className="w-1 h-1 bg-primary rounded-full mt-1"></div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Upcoming Events */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Upcoming Events
                    </CardTitle>
                    <CardDescription>
                      Your next {filteredEvents.length} events
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {upcomingEvents.length === 0 ? (
                      <div className="text-center py-8">
                        <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No upcoming events</p>
                      </div>
                    ) : (
                      upcomingEvents.map((event) => (
                        <div key={event.id} className="p-4 border rounded-lg hover:shadow-sm transition-shadow">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium line-clamp-2">{event.title}</h4>
                            <Badge className={getEventTypeColor(event.type)}>
                              {event.type}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{event.course}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>{formatDate(event.date)}</span>
                            <span>{event.time}</span>
                          </div>
                          {isToday(event.date) && (
                            <Badge variant="outline" className="mt-2 text-xs">
                              Today
                            </Badge>
                          )}
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>

                {/* Quick Stats */}
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>This Week</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Assignments Due</span>
                      <span className="font-medium">
                        {events.filter(e => e.type === 'assignment' && isThisWeek(e.date)).length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Classes</span>
                      <span className="font-medium">
                        {events.filter(e => e.type === 'class' && isThisWeek(e.date)).length}
                      </span>
                    </div>
                    {user?.role === 'teacher' && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Grading Tasks</span>
                        <span className="font-medium">
                          {events.filter(e => e.type === 'grading' && isThisWeek(e.date)).length}
                        </span>
                      </div>
                    )}
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