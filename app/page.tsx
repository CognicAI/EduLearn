'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpenIcon, Users, Award, TrendingUp, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const features = [
  {
    icon: BookOpenIcon,
    title: 'Course Management',
    description: 'Create, organize, and deliver engaging courses with our comprehensive course management tools.',
  },
  {
    icon: Users,
    title: 'Collaborative Learning',
    description: 'Foster collaboration between students and teachers with interactive discussions and group projects.',
  },
  {
    icon: Award,
    title: 'Assessment Tools',
    description: 'Create and grade assignments with our advanced assessment and feedback system.',
  },
  {
    icon: TrendingUp,
    title: 'Progress Tracking',
    description: 'Monitor learning progress with detailed analytics and performance insights.',
  },
];

const roles = [
  {
    title: 'Students',
    description: 'Access courses, submit assignments, and track your learning progress.',
    href: '/auth/register',
    color: 'bg-blue-50 hover:bg-blue-100 border-blue-200',
  },
  {
    title: 'Teachers',
    description: 'Create courses, manage students, and provide personalized feedback.',
    href: '/auth/register',
    color: 'bg-green-50 hover:bg-green-100 border-green-200',
  },
  {
    title: 'Administrators',
    description: 'Manage the platform, oversee users, and access comprehensive analytics.',
    href: '/auth/register',
    color: 'bg-purple-50 hover:bg-purple-100 border-purple-200',
  },
];

export default function HomePage() {
  const { isAuthenticated, user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only redirect if we're not loading and user is authenticated
    if (!isLoading && isAuthenticated && user) {
      const dashboardMap = {
        student: '/dashboard/student',
        teacher: '/dashboard/teacher',
        admin: '/dashboard/admin',
      };
      
      // Use setTimeout to ensure the redirect happens after the current render cycle
      setTimeout(() => {
        router.push(dashboardMap[user.role]);
      }, 100);
    }
  }, [isAuthenticated, user, isLoading, router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <BookOpenIcon className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading EduLearn...</p>
        </div>
      </div>
    );
  }

  // Don't render the homepage if user is authenticated (will redirect)
  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <BookOpenIcon className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <BookOpenIcon className="h-8 w-8 text-primary" />
              <span className="ml-2 text-xl font-bold text-gray-900">EduLearn</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" asChild>
                <Link href="/auth/login">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/auth/register">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Modern Learning
            <span className="text-primary block">Management System</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Empower education with our AI-integrated platform. Create, manage, and deliver 
            exceptional learning experiences for students, teachers, and administrators.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/auth/register" className="flex items-center">
                Start Learning Today
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/auth/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need for Modern Education
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our comprehensive platform provides all the tools needed for effective online learning and teaching.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Choose Your Role
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get started with EduLearn by selecting the role that best describes you.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {roles.map((role, index) => (
              <Card key={index} className={`text-center cursor-pointer transition-all hover:scale-105 ${role.color}`}>
                <CardHeader>
                  <CardTitle className="text-xl">{role.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4">{role.description}</CardDescription>
                  <Button asChild className="w-full">
                    <Link href={role.href}>Get Started</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <BookOpenIcon className="h-8 w-8 text-primary" />
            <span className="ml-2 text-xl font-bold">EduLearn</span>
          </div>
          <p className="text-gray-400">
            © 2024 EduLearn. Empowering education through technology.
          </p>
        </div>
      </footer>
    </div>
  );
}