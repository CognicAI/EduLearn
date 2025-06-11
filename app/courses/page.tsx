'use client';

import { useAuth } from '@/lib/auth/auth-context';
import { AuthGuard } from '@/lib/auth/auth-guard';
import { DashboardSidebar } from '@/components/layout/dashboard-sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { BookOpenIcon, Search, Plus, Users, Clock, Star } from 'lucide-react';

const mockCourses = [
  {
    id: '1',
    title: 'Introduction to Computer Science',
    instructor: 'Prof. Johnson',
    description: 'Learn the fundamentals of computer science including algorithms, data structures, and programming concepts.',
    students: 45,
    duration: '12 weeks',
    rating: 4.8,
    progress: 75,
    status: 'enrolled',
    thumbnail: 'https://images.pexels.com/photos/574071/pexels-photo-574071.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: '2',
    title: 'Advanced Web Development',
    instructor: 'Dr. Smith',
    description: 'Master modern web development with React, Node.js, and advanced JavaScript concepts.',
    students: 32,
    duration: '10 weeks',
    rating: 4.9,
    progress: 60,
    status: 'enrolled',
    thumbnail: 'https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: '3',
    title: 'Database Design Fundamentals',
    instructor: 'Ms. Davis',
    description: 'Learn database design principles, SQL, and modern database management systems.',
    students: 28,
    duration: '8 weeks',
    rating: 4.7,
    progress: 90,
    status: 'nearly-complete',
    thumbnail: 'https://images.pexels.com/photos/1181677/pexels-photo-1181677.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: '4',
    title: 'Machine Learning Basics',
    instructor: 'Prof. Wilson',
    description: 'Introduction to machine learning algorithms, data analysis, and AI fundamentals.',
    students: 67,
    duration: '14 weeks',
    rating: 4.6,
    progress: 0,
    status: 'available',
    thumbnail: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: '5',
    title: 'Digital Marketing Strategy',
    instructor: 'Ms. Brown',
    description: 'Learn modern digital marketing techniques, social media strategy, and analytics.',
    students: 89,
    duration: '6 weeks',
    rating: 4.5,
    progress: 0,
    status: 'available',
    thumbnail: 'https://images.pexels.com/photos/265087/pexels-photo-265087.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: '6',
    title: 'Mobile App Development',
    instructor: 'Dr. Lee',
    description: 'Build native and cross-platform mobile applications using modern frameworks.',
    students: 41,
    duration: '16 weeks',
    rating: 4.8,
    progress: 0,
    status: 'available',
    thumbnail: 'https://images.pexels.com/photos/607812/pexels-photo-607812.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
];

export default function CoursesPage() {
  const { user } = useAuth();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'enrolled':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'nearly-complete':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'available':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'enrolled':
        return 'Enrolled';
      case 'nearly-complete':
        return 'Nearly Complete';
      case 'available':
        return 'Available';
      default:
        return 'Available';
    }
  };

  const getButtonText = (status: string) => {
    switch (status) {
      case 'enrolled':
        return 'Continue';
      case 'nearly-complete':
        return 'Finish';
      case 'available':
        return 'Enroll';
      default:
        return 'View';
    }
  };

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
                  {user?.role === 'teacher' ? 'My Courses' : 'Courses'}
                </h1>
                <p className="text-muted-foreground mt-2">
                  {user?.role === 'teacher' 
                    ? 'Manage and create your courses' 
                    : 'Discover and enroll in courses to advance your learning'
                  }
                </p>
              </div>
              {user?.role === 'teacher' && (
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Course
                </Button>
              )}
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search courses..."
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline">All Categories</Button>
                <Button variant="outline">My Courses</Button>
                <Button variant="outline">Available</Button>
              </div>
            </div>

            {/* Courses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockCourses.map((course) => (
                <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-video relative overflow-hidden">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 right-4">
                      <Badge className={getStatusColor(course.status)}>
                        {getStatusText(course.status)}
                      </Badge>
                    </div>
                  </div>
                  
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg line-clamp-2 mb-1">
                          {course.title}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {course.instructor}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{course.rating}</span>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <CardDescription className="line-clamp-2 mb-4">
                      {course.description}
                    </CardDescription>
                    
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{course.students} students</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{course.duration}</span>
                      </div>
                    </div>

                    {course.status !== 'available' && (
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progress</span>
                          <span>{course.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{ width: `${course.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                    
                    <Button className="w-full">
                      <BookOpenIcon className="h-4 w-4 mr-2" />
                      {getButtonText(course.status)}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Load More */}
            <div className="text-center mt-12">
              <Button variant="outline" size="lg">
                Load More Courses
              </Button>
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}