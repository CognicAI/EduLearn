'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpenIcon, Users, Award, TrendingUp, ArrowRight, Play, Star, CheckCircle, Globe, Zap, Shield, Heart, Clock } from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { ClientOnly } from '@/components/client-only';
import { AssessmentBuilder } from '@/components/demo/assessment-builder';
import { MobileAppSimulator } from '@/components/demo/mobile-app-simulator';

const features = [
  {
    icon: BookOpenIcon,
    title: 'Interactive Learning',
    description: 'Engage with dynamic content, quizzes, and hands-on projects designed to enhance your learning experience.',
    color: 'bg-blue-50 border-blue-200 text-blue-700',
  },
  {
    icon: Users,
    title: 'Expert Instructors',
    description: 'Learn from industry professionals and experienced educators who are passionate about teaching.',
    color: 'bg-green-50 border-green-200 text-green-700',
  },
  {
    icon: Award,
    title: 'Certified Courses',
    description: 'Earn recognized certificates upon completion to showcase your skills to employers and peers.',
    color: 'bg-purple-50 border-purple-200 text-purple-700',
  },
  {
    icon: TrendingUp,
    title: 'Progress Tracking',
    description: 'Monitor your learning journey with detailed analytics and personalized progress insights.',
    color: 'bg-orange-50 border-orange-200 text-orange-700',
  },
  {
    icon: Globe,
    title: 'Global Community',
    description: 'Connect with learners worldwide and participate in collaborative projects and discussions.',
    color: 'bg-cyan-50 border-cyan-200 text-cyan-700',
  },
  {
    icon: Zap,
    title: 'Adaptive Learning',
    description: 'AI-powered recommendations that adapt to your learning style and pace for optimal results.',
    color: 'bg-yellow-50 border-yellow-200 text-yellow-700',
  },
];

const stats = [
  { number: '50,000+', label: 'Active Students', icon: Users },
  { number: '1,200+', label: 'Expert Instructors', icon: Award },
  { number: '300+', label: 'Courses Available', icon: BookOpenIcon },
  { number: '95%', label: 'Success Rate', icon: TrendingUp },
];

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Software Developer',
    content: 'EduLearn transformed my career. The hands-on projects and expert guidance helped me land my dream job in tech.',
    avatar: 'SC',
    rating: 5,
  },
  {
    name: 'Marcus Johnson',
    role: 'Data Scientist',
    content: 'The quality of instruction is outstanding. I gained practical skills that I use every day in my work.',
    avatar: 'MJ',
    rating: 5,
  },
  {
    name: 'Elena Rodriguez',
    role: 'UX Designer',
    content: 'The community support and interactive learning approach made complex topics easy to understand.',
    avatar: 'ER',
    rating: 5,
  },
];

const popularCourses = [
  {
    title: 'Complete Web Development Bootcamp',
    instructor: 'Dr. Alex Thompson',
    students: 12500,
    rating: 4.9,
    price: '$89',
    image: 'https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?auto=compress&cs=tinysrgb&w=400',
    level: 'Beginner',
    duration: '12 weeks',
  },
  {
    title: 'Machine Learning Fundamentals',
    instructor: 'Prof. Maria Santos',
    students: 8900,
    rating: 4.8,
    price: '$129',
    image: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=400',
    level: 'Intermediate',
    duration: '16 weeks',
  },
  {
    title: 'Digital Marketing Mastery',
    instructor: 'Sarah Williams',
    students: 15200,
    rating: 4.7,
    price: '$69',
    image: 'https://images.pexels.com/photos/265087/pexels-photo-265087.jpeg?auto=compress&cs=tinysrgb&w=400',
    level: 'Beginner',
    duration: '8 weeks',
  },
];

export default function HomePage() {
  const { isAuthenticated, user, isLoading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // Fix hydration issues by ensuring component is mounted
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      const dashboardMap = {
        student: '/dashboard/student',
        teacher: '/dashboard/teacher',
        admin: '/dashboard/admin',
      };
      
      setTimeout(() => {
        router.push(dashboardMap[user.role]);
      }, 100);
    }
  }, [isAuthenticated, user, isLoading, router]);

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
        <div className="text-center">
          <BookOpenIcon className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
        <div className="text-center">
          <BookOpenIcon className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading EduLearn...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
        <div className="text-center">
          <BookOpenIcon className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
      <div className="relative overflow-hidden min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
        {/* Animated Grid Background */}
        <div className="absolute inset-0 opacity-10 dark:opacity-20">
          <div className="grid-background animate-grid-move"></div>
        </div>
        
        {/* Floating Particles - Only render on client */}
        {mounted && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: 20 }, (_, i) => (
              <div
                key={i}
                className="floating-particle"
                style={{
                  left: `${(i * 5.26) % 100}%`, // Deterministic positioning
                  animationDelay: `${i * 1}s`,
                  animationDuration: `${15 + (i % 10)}s`
                }}
              />
            ))}
          </div>
        )}

        {/* Futuristic moving lines */}
        {[15, 35, 55, 75, 95].map((pos) => (
          <div
            key={pos}
            className="cyber-line"
            style={{ top: `${pos}%`, animationDelay: `${pos/30}s` }}
          />
        ))}
        
        {/* Glowing orbs */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-40 right-20 w-48 h-48 bg-purple-500/20 rounded-full blur-2xl animate-bounce-slow"></div>
        
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-white/20 bg-white/10 dark:bg-gray-900/10 backdrop-blur-xl shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center group">
              <div className="relative">
                <BookOpenIcon className="h-8 w-8 text-primary transition-all duration-300 group-hover:scale-110 group-hover:rotate-12" />
                <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <span className="ml-2 text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent animate-gradient-x">
                EduLearn
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <ClientOnly fallback={<div className="w-9 h-9" />}>
                <ThemeToggle />
              </ClientOnly>
              <Button variant="ghost" asChild className="hover:bg-white/20 dark:hover:bg-gray-800/20 transition-all duration-300 hover:scale-105">
                <Link href="/auth/login">Sign In</Link>
              </Button>
              <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25">
                <Link href="/auth/register">Start Learning</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 min-h-screen flex items-center">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/30 to-purple-400/30 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-purple-400/30 to-pink-400/30 rounded-full blur-3xl animate-float-delayed"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left space-y-8 animate-slide-up">
              <Badge className="mb-4 bg-blue-100/80 text-blue-700 border-blue-200/50 backdrop-blur-sm hover:scale-105 transition-transform duration-300 animate-bounce-in">
                🚀 Join 50,000+ learners worldwide
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                <span className="animate-text-shimmer">Transform Your Future with</span>
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent block animate-gradient-x bg-300% mt-2">
                  World-Class Education
                </span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl animate-fade-in-delayed">
                Master in-demand skills with our AI-powered learning platform. Get personalized courses, 
                expert mentorship, and industry-recognized certificates.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-slide-up-delayed">
                <Button size="lg" asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform transition-all duration-300 hover:scale-110 hover:shadow-2xl hover:shadow-blue-500/50 group">
                  <Link href="/auth/register" className="flex items-center">
                    Start Your Journey
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-300 hover:scale-105 hover:shadow-lg group">
                  <Play className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                  Watch Demo
                </Button>
              </div>
              <div className="mt-8 flex items-center gap-6 justify-center lg:justify-start text-sm text-gray-600 dark:text-gray-400 animate-fade-in-delayed">
                {[
                  { icon: CheckCircle, text: "Free trial available" },
                  { icon: CheckCircle, text: "No credit card required" },
                  { icon: CheckCircle, text: "Cancel anytime" }
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-1 group hover:scale-105 transition-transform duration-300">
                    <item.icon className="h-4 w-4 text-green-500 group-hover:text-green-400 transition-colors duration-300" />
                    <span className="group-hover:text-gray-800 dark:group-hover:text-gray-200 transition-colors duration-300">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative animate-slide-up-delayed">
              <div className="relative z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/20 dark:border-gray-700/20 hover:shadow-3xl transition-all duration-500 hover:scale-105 group">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <BookOpenIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold dark:text-white">Live Learning Session</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Advanced React Patterns</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Progress</span>
                    <span className="text-sm font-medium dark:text-white">78%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full animate-progress-fill" style={{width: '78%'}}></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {[1,2,3,4].map(i => (
                        <div key={i} className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center text-white text-xs font-medium hover:scale-110 transition-transform duration-300 animate-bounce-in" style={{animationDelay: `${i * 0.1}s`}}>
                          {i}
                        </div>
                      ))}
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">+127 students online</span>
                  </div>
                </div>
              </div>
              
              {/* Animated background shapes */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full opacity-20 animate-pulse-slow"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-r from-green-400 to-blue-400 rounded-full opacity-20 animate-spin-slow"></div>
              <div className="absolute top-1/2 -right-8 w-16 h-16 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full opacity-30 animate-bounce-slow"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Courses - Enhanced */}
      <section className="py-20 bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/10 dark:to-purple-900/10 relative overflow-hidden">
        {/* Subtle animated background */}
        <div className="absolute inset-0 opacity-5 dark:opacity-10">
          <div className="grid-background animate-grid-move"></div>
        </div>
        
        {/* Floating design elements */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-2xl animate-float"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full blur-3xl animate-float-delayed"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-slide-up">
            <Badge className="mb-4 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/50 dark:to-emerald-900/50 text-green-700 dark:text-green-300 border-green-200/50 dark:border-green-700/50 backdrop-blur-sm hover:scale-105 transition-transform duration-300 shadow-sm">
              🔥 Most Popular Courses
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              <span className="bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent">
                Trending Courses
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Join thousands of students in our most popular courses designed by industry experts.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {popularCourses.map((course, index) => (
              <Card key={index} className="group overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-0 shadow-lg hover:shadow-2xl transition-all duration-700 hover:-translate-y-4 hover:scale-[1.02] animate-slide-up relative" style={{animationDelay: `${index * 0.15}s`}}>
                {/* Enhanced gradient border effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-sm"></div>
                <div className="absolute inset-[1px] bg-white dark:bg-gray-800 rounded-lg"></div>
                
                <div className="relative z-10">
                  <div className="aspect-video relative overflow-hidden rounded-t-lg">
                    <img
                      src={course.image}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                    />
                    {/* Enhanced overlay with smooth gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent group-hover:from-black/50 transition-all duration-500"></div>
                    
                    {/* Badges with better positioning */}
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-white/95 dark:bg-gray-800/95 text-gray-700 dark:text-gray-300 backdrop-blur-sm hover:scale-105 transition-transform duration-300 shadow-sm">
                        {course.level}
                      </Badge>
                    </div>
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg hover:scale-105 transition-transform duration-300">
                        {course.price}
                      </Badge>
                    </div>
                    
                    {/* Enhanced play button */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                      <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30 hover:scale-110 transition-transform duration-300 group-hover:bg-white/30">
                        <Play className="h-6 w-6 text-white ml-1" />
                      </div>
                    </div>
                  </div>
                  
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300 dark:text-white">
                      {course.title}
                    </CardTitle>
                    <p className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-200 transition-colors duration-300">
                      by {course.instructor}
                    </p>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-4">
                      <div className="flex items-center gap-1 group-hover:scale-105 transition-transform duration-300">
                        <Users className="h-4 w-4" />
                        <span>{course.students.toLocaleString()} students</span>
                      </div>
                      <div className="flex items-center gap-1 group-hover:scale-105 transition-transform duration-300">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{course.rating}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {course.duration}
                      </span>
                      <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform transition-all duration-300 hover:scale-105 hover:shadow-lg shadow-blue-500/25">
                        Enroll Now
                      </Button>
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - NEW */}
      <section className="py-20 bg-gradient-to-br from-emerald-50/30 via-teal-50/20 to-cyan-50/30 dark:from-emerald-900/20 dark:via-teal-900/10 dark:to-cyan-900/10 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-slide-up">
            <Badge className="mb-4 bg-emerald-100/80 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border-emerald-200/50 dark:border-emerald-700/50 backdrop-blur-sm hover:scale-105 transition-transform duration-300">
              📚 Simple Process
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Get started in minutes with our streamlined learning process designed for maximum efficiency.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Choose Your Path",
                description: "Browse our curated courses or let AI recommend the perfect learning path based on your goals.",
                icon: "🎯",
                color: "from-blue-500 to-cyan-500"
              },
              {
                step: "02", 
                title: "Learn Interactively",
                description: "Engage with AI-powered lessons, upload materials, and get instant feedback on your progress.",
                icon: "🧠",
                color: "from-purple-500 to-pink-500"
              },
              {
                step: "03",
                title: "Apply & Succeed",
                description: "Complete assessments, earn certificates, and showcase your new skills to advance your career.",
                icon: "🏆",
                color: "from-emerald-500 to-teal-500"
              }
            ].map((step, index) => (
              <Card key={index} className="relative group overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-0 shadow-lg hover:shadow-2xl transition-all duration-700 hover:-translate-y-4 animate-slide-up p-8" style={{animationDelay: `${index * 0.2}s`}}>
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-bl-3xl flex items-start justify-end pr-4 pt-4">
                  <span className="text-2xl font-bold text-gray-400 dark:text-gray-500">{step.step}</span>
                </div>
                
                <div className={`w-16 h-16 bg-gradient-to-r ${step.color} rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  {step.icon}
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                  {step.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-200 transition-colors duration-300">
                  {step.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Learn Anywhere, Anytime - Mobile Learning Experience */}
      <section className="py-20 bg-gradient-to-br from-pink-50/30 via-rose-50/20 to-orange-50/30 dark:from-pink-900/20 dark:via-rose-900/10 dark:to-orange-900/10 relative overflow-hidden">
        {/* Enhanced floating particles */}
        <div className="absolute inset-0 overflow-hidden">
          {mounted && Array.from({ length: 15 }, (_, i) => (
            <div
              key={i}
              className="absolute w-3 h-3 bg-gradient-to-r from-pink-400/30 to-orange-400/30 rounded-full animate-float blur-sm"
              style={{
                left: `${(i * 6.67) % 100}%`,
                top: `${(i * 8.33) % 100}%`,
                animationDelay: `${i * 0.3}s`,
                animationDuration: `${4 + (i % 8)}s`
              }}
            />
          ))}
        </div>

        {/* Glowing orbs for enhanced visual appeal */}
        <div className="absolute top-20 left-10 w-40 h-40 bg-pink-400/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-20 right-10 w-60 h-60 bg-orange-400/10 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-rose-400/5 rounded-full blur-3xl animate-spin-slow"></div>
        
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Centered Mobile App Simulator with enhanced animations */}
          <div className="flex justify-center items-center animate-slide-up">
            <div className="relative">
              {/* Animated rings around the mobile simulator */}
              <div className="absolute inset-0 -m-8">
                <div className="absolute inset-0 border-2 border-pink-300/20 rounded-full animate-ping" style={{animationDuration: '3s'}}></div>
                <div className="absolute inset-0 border-2 border-orange-300/20 rounded-full animate-ping" style={{animationDuration: '4s', animationDelay: '1s'}}></div>
                <div className="absolute inset-0 border-2 border-rose-300/20 rounded-full animate-ping" style={{animationDuration: '5s', animationDelay: '2s'}}></div>
              </div>
              
              {/* Enhanced glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 via-rose-500/20 to-orange-500/20 rounded-3xl blur-2xl animate-pulse"></div>
              
              {/* Main simulator with enhanced styling */}
              <div className="relative transform hover:scale-105 transition-all duration-700 hover:rotate-1">
                <MobileAppSimulator />
              </div>
              
              {/* Floating tags/badges around the simulator */}
              <div className="absolute -top-8 -left-8 animate-bounce-in" style={{animationDelay: '0.5s'}}>
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg hover:scale-110 transition-transform duration-300">
                  📱 Mobile First
                </div>
              </div>
              
              <div className="absolute -top-8 -right-8 animate-bounce-in" style={{animationDelay: '1s'}}>
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg hover:scale-110 transition-transform duration-300">
                  🤖 AI Powered
                </div>
              </div>
              
              <div className="absolute -bottom-8 -right-8 animate-bounce-in" style={{animationDelay: '2s'}}>
                <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg hover:scale-110 transition-transform duration-300">
                  🔄 Real-time Sync
                </div>
              </div>
              
              <div className="absolute top-1/2 -left-16 transform -translate-y-1/2 animate-bounce-in" style={{animationDelay: '2.5s'}}>
                <div className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg hover:scale-110 transition-transform duration-300">
                  🎯 Smart Learning
                </div>
              </div>
              
              <div className="absolute top-1/2 -right-16 transform -translate-y-1/2 animate-bounce-in" style={{animationDelay: '3s'}}>
                <div className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg hover:scale-110 transition-transform duration-300">
                  📊 Progress Tracking
                </div>
              </div>
            </div>
          </div>

          {/* Coming Soon notification at the bottom */}
          <div className="mt-16 text-center animate-slide-up-delayed">
            <div className="inline-flex items-center gap-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-full px-8 py-4 border border-white/20 dark:border-gray-700/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
              <span className="text-lg font-semibold text-gray-900 dark:text-white">Mobile App Coming Soon</span>
              <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Assistant Showcase */}
      <section className="py-20 bg-gradient-to-br from-indigo-50/30 via-cyan-50/20 to-blue-50/30 dark:from-indigo-900/20 dark:via-cyan-900/10 dark:to-blue-900/10 relative overflow-hidden">
        {/* Animated AI particles */}
        <div className="absolute inset-0 overflow-hidden">
          {mounted && Array.from({ length: 15 }, (_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-cyan-400/30 rounded-full animate-float"
              style={{
                left: `${(i * 6.67) % 100}%`,
                top: `${(i * 8.33) % 100}%`,
                animationDelay: `${i * 0.3}s`,
                animationDuration: `${4 + (i % 6)}s`
              }}
            />
          ))}
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-slide-up">
            <Badge className="mb-4 bg-cyan-100/80 dark:bg-cyan-900/50 text-cyan-700 dark:text-cyan-300 border-cyan-200/50 dark:border-cyan-700/50 backdrop-blur-sm hover:scale-105 transition-transform duration-300">
              🤖 AI-Powered Learning Assistant
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Meet Your AI Study Companion
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Experience intelligent tutoring with our AI assistant that uploads files, answers questions, and adapts to your learning style.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* AI Chat Simulator */}
            <div className="animate-slide-up">
              <Card className="glass-card backdrop-blur-xl border border-white/20 dark:border-gray-700/20 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105 p-6">
                <div className="bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-3 text-white">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <span className="text-sm">🤖</span>
                    </div>
                    <span className="font-medium">EduLearn AI Assistant</span>
                    <div className="ml-auto flex gap-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-xs">Online</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4 max-h-80 overflow-y-auto">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white text-xs">AI</div>
                    <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-3 flex-1">
                      <p className="text-sm">Hi! I'm your AI learning assistant. Upload any document and I'll help you understand it better. What would you like to learn today?</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 flex-row-reverse">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs">You</div>
                    <div className="bg-purple-50 dark:bg-purple-900/30 rounded-lg p-3 flex-1">
                      <p className="text-sm">Can you help me understand this research paper about machine learning?</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white text-xs">AI</div>
                    <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-3 flex-1">
                      <p className="text-sm">Absolutely! Upload your PDF and I'll analyze it, create a summary, generate questions, and explain complex concepts in simple terms. I can even create interactive quizzes based on the content!</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">📎 Drag & drop files here or click to upload</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Supports PDF, DOCX, TXT, and more</p>
                </div>
              </Card>
            </div>

            {/* AI Features */}
            <div className="space-y-6 animate-slide-up-delayed">
              {[
                {
                  icon: '🧠',
                  title: 'Intelligent Document Analysis',
                  description: 'Upload any document and get instant summaries, key points, and explanations.',
                  color: 'from-purple-500 to-pink-500'
                },
                {
                  icon: '💬',
                  title: 'Interactive Q&A',
                  description: 'Ask questions about your content and get detailed, contextual answers.',
                  color: 'from-blue-500 to-cyan-500'
                },
                {
                  icon: '🎯',
                  title: 'Personalized Learning',
                  description: 'AI adapts to your learning style and suggests optimal study paths.',
                  color: 'from-green-500 to-teal-500'
                },
                {
                  icon: '⚡',
                  title: 'Instant Assessment',
                  description: 'Generate quizzes and practice tests from any uploaded material.',
                  color: 'from-orange-500 to-red-500'
                }
              ].map((feature, index) => (
                <Card key={index} className="glass-card p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 group" style={{animationDelay: `${index * 0.1}s`}}>
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center text-white text-xl group-hover:scale-110 transition-transform duration-300`}>
                      {feature.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">{feature.title}</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm group-hover:text-gray-800 dark:group-hover:text-gray-200 transition-colors duration-300">{feature.description}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Analytics Dashboard Preview */}
      <section className="py-20 bg-gradient-to-br from-white via-emerald-50/20 to-teal-50/20 dark:from-gray-900 dark:via-emerald-900/10 dark:to-teal-900/10 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 dark:opacity-10">
          <div className="grid-background animate-grid-move"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-slide-up">
            <Badge className="mb-4 bg-emerald-100/80 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border-emerald-200/50 dark:border-emerald-700/50 backdrop-blur-sm hover:scale-105 transition-transform duration-300">
              📊 Real-Time Analytics
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Powerful Dashboard Insights
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Track learning progress, engagement metrics, and performance analytics with our comprehensive dashboard.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 mb-12">
            {/* Key Metrics Cards */}
            {[
              { title: 'Active Learners', value: '2,847', change: '+12%', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/30' },
              { title: 'Course Completion', value: '89.3%', change: '+5.2%', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/30' },
              { title: 'Avg. Study Time', value: '4.2h', change: '+0.8h', color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/30' }
            ].map((metric, index) => (
              <Card key={index} className="glass-card p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 animate-bounce-in" style={{animationDelay: `${index * 0.1}s`}}>
                <div className={`w-12 h-12 ${metric.bg} rounded-lg flex items-center justify-center mb-4`}>
                  <TrendingUp className={`h-6 w-6 ${metric.color}`} />
                </div>
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{metric.title}</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">{metric.value}</span>
                  <span className="text-sm font-medium text-green-600">{metric.change}</span>
                </div>
              </Card>
            ))}
          </div>

          {/* Dashboard Preview */}
          <Card className="glass-card backdrop-blur-xl p-8 animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Learning Analytics Dashboard</h3>
              <div className="flex gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Progress Chart */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-6">
                <h4 className="font-medium text-gray-900 dark:text-white mb-4">Learning Progress</h4>
                <div className="space-y-3">
                  {['JavaScript', 'Python', 'React', 'Node.js'].map((skill, index) => (
                    <div key={skill} className="flex items-center gap-3">
                      <span className="text-sm text-gray-600 dark:text-gray-400 w-20">{skill}</span>
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-1000 ease-out"
                          style={{width: `${85 - index * 15}%`, animationDelay: `${index * 0.2}s`}}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{85 - index * 15}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Activity Heatmap */}
              <div className="bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 rounded-lg p-6">
                <h4 className="font-medium text-gray-900 dark:text-white mb-4">Weekly Activity</h4>
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: 49 }, (_, i) => (
                    <div
                      key={i}
                      className={`w-6 h-6 rounded-sm ${
                        Math.random() > 0.3 
                          ? 'bg-green-400 hover:bg-green-500' 
                          : 'bg-gray-200 dark:bg-gray-700'
                      } transition-colors duration-200 cursor-pointer`}
                      style={{animationDelay: `${i * 0.01}s`}}
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Pricing Plans - NEW */}
      <section className="py-20 bg-gradient-to-br from-indigo-50/30 via-purple-50/20 to-pink-50/30 dark:from-indigo-900/20 dark:via-purple-900/10 dark:to-pink-900/10 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-slide-up">
            <Badge className="mb-4 bg-purple-100/80 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 border-purple-200/50 dark:border-purple-700/50 backdrop-blur-sm hover:scale-105 transition-transform duration-300">
              💰 Flexible Plans
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Choose Your Learning Path
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Start free and scale as you grow. All plans include our core features with increasing levels of access.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: "Starter",
                price: "Free",
                period: "Forever",
                popular: false,
                features: [
                  "5 courses per month",
                  "Basic AI assistant",
                  "Community support",
                  "Mobile app access",
                  "Basic analytics"
                ],
                buttonText: "Get Started",
                color: "from-gray-500 to-gray-700"
              },
              {
                name: "Pro",
                price: "$29",
                period: "per month",
                popular: true,
                features: [
                  "Unlimited courses",
                  "Advanced AI assistant",
                  "Priority support",
                  "Offline downloads",
                  "Advanced analytics",
                  "Custom assessments",
                  "Certificates"
                ],
                buttonText: "Start Pro Trial",
                color: "from-blue-500 to-purple-600"
              },
              {
                name: "Enterprise",
                price: "$99",
                period: "per month",
                popular: false,
                features: [
                  "Everything in Pro",
                  "Team management",
                  "Custom branding",
                  "API access",
                  "SSO integration",
                  "Dedicated support",
                  "Custom training"
                ],
                buttonText: "Contact Sales",
                color: "from-purple-600 to-pink-600"
              }
            ].map((plan, index) => (
              <Card key={index} className={`relative overflow-hidden ${plan.popular ? 'ring-2 ring-blue-500 scale-105' : ''} bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-0 shadow-lg hover:shadow-2xl transition-all duration-700 hover:-translate-y-2 animate-slide-up group`} style={{animationDelay: `${index * 0.2}s`}}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-1 text-sm font-medium">
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <div className="p-8">
                  <div className="text-center mb-8">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{plan.name}</h3>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-4xl font-bold text-gray-900 dark:text-white">{plan.price}</span>
                      {plan.price !== "Free" && <span className="text-gray-600 dark:text-gray-400">/{plan.period}</span>}
                    </div>
                  </div>
                  
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-600 dark:text-gray-400">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button className={`w-full bg-gradient-to-r ${plan.color} hover:scale-105 transition-all duration-300 hover:shadow-lg text-white`}>
                    {plan.buttonText}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-12 animate-fade-in-delayed">
            <p className="text-gray-600 dark:text-gray-400 mb-4">All plans include 14-day free trial • No credit card required</p>
            <div className="flex items-center justify-center gap-6 text-sm text-gray-500 dark:text-gray-500">
              <div className="flex items-center gap-1">
                <Shield className="h-4 w-4" />
                <span>Secure payments</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4" />
                <span>Cancel anytime</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart className="h-4 w-4" />
                <span>24/7 support</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Role-Based Solutions */}
      <section className="py-20 bg-gradient-to-br from-slate-50/30 via-blue-50/20 to-indigo-50/20 dark:from-slate-900/20 dark:via-blue-900/10 dark:to-indigo-900/10 relative overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-slide-up">
            <Badge className="mb-4 bg-indigo-100/80 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border-indigo-200/50 dark:border-indigo-700/50 backdrop-blur-sm hover:scale-105 transition-transform duration-300">
              🎯 Tailored Solutions
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Built for Every Role
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Discover how EduLearn empowers students, teachers, and administrators with role-specific features.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                role: 'Students',
                icon: '🎓',
                color: 'from-blue-500 to-cyan-500',
                features: [
                  'AI-powered study assistant',
                  'Personalized learning paths',
                  'Interactive assignments',
                  'Progress tracking',
                  'Peer collaboration tools'
                ]
              },
              {
                role: 'Teachers',
                icon: '👨‍🏫',
                color: 'from-green-500 to-teal-500',
                features: [
                  'Course creation tools',
                  'Automated grading',
                  'Student analytics',
                  'Assignment management',
                  'Real-time feedback'
                ]
              },
              {
                role: 'Administrators',
                icon: '👩‍💼',
                color: 'from-purple-500 to-pink-500',
                features: [
                  'Institution dashboard',
                  'User management',
                  'Performance reports',
                  'System integration',
                  'Compliance tracking'
                ]
              }
            ].map((solution, index) => (
              <Card key={index} className="glass-card backdrop-blur-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 animate-slide-up group overflow-hidden" style={{animationDelay: `${index * 0.2}s`}}>
                <div className={`h-2 bg-gradient-to-r ${solution.color}`}></div>
                <CardHeader className="text-center pb-4">
                  <div className={`w-16 h-16 bg-gradient-to-r ${solution.color} rounded-full flex items-center justify-center text-white text-2xl mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    {solution.icon}
                  </div>
                  <CardTitle className="text-xl group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">{solution.role}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {solution.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-2 text-gray-600 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-200 transition-colors duration-300">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className={`w-full mt-6 bg-gradient-to-r ${solution.color} hover:opacity-90 transition-all duration-300`}>
                    Explore {solution.role} Features
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gradient-to-br from-blue-50/30 via-purple-50/20 to-pink-50/20 dark:from-blue-900/20 dark:via-purple-900/10 dark:to-pink-900/10 relative overflow-hidden">
        {/* Floating elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-blue-400/20 rounded-full blur-xl animate-float"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-purple-400/20 rounded-full blur-2xl animate-float-delayed"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-300/10 to-purple-300/10 rounded-full blur-3xl animate-pulse-slow"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-slide-up">
            <Badge className="mb-4 bg-blue-100/80 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border-blue-200/50 dark:border-blue-700/50 backdrop-blur-sm hover:scale-105 transition-transform duration-300">
              💬 Student Success Stories
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              What Our Students Say
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Real stories from real students who transformed their careers with EduLearn.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="glass-card backdrop-blur-xl border border-white/20 dark:border-gray-700/20 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:scale-105 animate-slide-up group" style={{animationDelay: `${index * 0.2}s`}}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400 group-hover:scale-110 transition-transform duration-300" style={{animationDelay: `${i * 0.1}s`}} />
                    ))}
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mb-6 italic group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors duration-300">"{testimonial.content}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">{testimonial.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-200 transition-colors duration-300">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
                
                {/* Glowing border effect */}
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none blur-sm"></div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Social Proof */}
      <section className="py-20 bg-gradient-to-br from-emerald-50/30 via-teal-50/20 to-cyan-50/20 dark:from-emerald-900/20 dark:via-teal-900/10 dark:to-cyan-900/10 relative overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-slide-up">
            <Badge className="mb-4 bg-emerald-100/80 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border-emerald-200/50 dark:border-emerald-700/50 backdrop-blur-sm hover:scale-105 transition-transform duration-300">
              🏆 Trusted Worldwide
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Industry Recognition & Success Stories
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Join thousands of institutions worldwide who trust EduLearn for their educational technology needs.
            </p>
          </div>

          {/* Awards & Recognition */}
          <div className="grid md:grid-cols-4 gap-6 mb-12">
            {[
              { title: 'EdTech Innovation Award', year: '2024', org: 'Global Education Summit' },
              { title: 'Best Learning Platform', year: '2024', org: 'TechEd Awards' },
              { title: 'AI Excellence Award', year: '2023', org: 'Education Technology Review' },
              { title: 'Top 50 EdTech Companies', year: '2023', org: 'EdTech Digest' }
            ].map((award, index) => (
              <Card key={index} className="glass-card p-6 text-center hover:shadow-xl transition-all duration-300 hover:scale-105 animate-bounce-in group" style={{animationDelay: `${index * 0.1}s`}}>
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Award className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1 group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors duration-300">{award.title}</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">{award.year} - {award.org}</p>
              </Card>
            ))}
          </div>

          {/* Security & Compliance */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <Card className="glass-card p-8 hover:shadow-xl transition-all duration-300 hover:scale-105 animate-slide-up">
              <div className="flex items-center gap-4 mb-6">
                <Shield className="h-12 w-12 text-green-500" />
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Security & Compliance</h3>
                  <p className="text-gray-600 dark:text-gray-400">Enterprise-grade security you can trust</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {['GDPR Compliant', 'FERPA Certified', 'SOC 2 Type II', 'ISO 27001'].map((cert, index) => (
                  <div key={index} className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{cert}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="glass-card p-8 hover:shadow-xl transition-all duration-300 hover:scale-105 animate-slide-up-delayed">
              <div className="flex items-center gap-4 mb-6">
                <Globe className="h-12 w-12 text-blue-500" />
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Global Accessibility</h3>
                  <p className="text-gray-600 dark:text-gray-400">Inclusive learning for everyone</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {['25+ Languages', 'WCAG 2.1 AA', 'Screen Reader', 'Mobile First'].map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{feature}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Success Stories */}
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                institution: 'Stanford University',
                result: '40% improvement in student engagement',
                quote: 'EduLearn transformed our online learning experience with AI-powered personalization.',
                person: 'Dr. Sarah Chen, Dean of Education'
              },
              {
                institution: 'Tokyo International School',
                result: '60% reduction in grading time',
                quote: 'The automated assessment feature saved our teachers countless hours every week.',
                person: 'Hiroshi Tanaka, Principal'
              },
              {
                institution: 'Cambridge Institute',
                result: '85% student completion rate',
                quote: 'Our completion rates skyrocketed thanks to EduLearn\'s adaptive learning paths.',
                person: 'Prof. Emma Williams, Head of Digital Learning'
              }
            ].map((story, index) => (
              <Card key={index} className="glass-card p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 animate-slide-up group" style={{animationDelay: `${index * 0.2}s`}}>
                <div className="text-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-white text-xl">🎓</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">{story.institution}</h3>
                  <p className="text-2xl font-bold text-green-600 mt-2">{story.result}</p>
                </div>
                <blockquote className="text-gray-600 dark:text-gray-400 italic text-center mb-4 group-hover:text-gray-800 dark:group-hover:text-gray-200 transition-colors duration-300">
                  "{story.quote}"
                </blockquote>
                <p className="text-sm text-gray-500 dark:text-gray-500 text-center">— {story.person}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive ROI Calculator */}
      <section className="py-20 bg-gradient-to-br from-white via-orange-50/20 to-amber-50/20 dark:from-gray-900 dark:via-orange-900/10 dark:to-amber-900/10 relative overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-slide-up">
            <Badge className="mb-4 bg-orange-100/80 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300 border-orange-200/50 dark:border-orange-700/50 backdrop-blur-sm hover:scale-105 transition-transform duration-300">
              💰 Calculate Your Savings
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              ROI Calculator
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              See how much time and money your institution can save with EduLearn's automated solutions.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <Card className="glass-card p-8 animate-slide-up">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Calculate Your Potential Savings</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Number of Students</label>
                  <div className="relative">
                    <input 
                      type="range" 
                      min="100" 
                      max="10000" 
                      defaultValue="1000"
                      className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-2 py-1 rounded text-xs">1,000</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Number of Teachers</label>
                  <div className="relative">
                    <input 
                      type="range" 
                      min="10" 
                      max="500" 
                      defaultValue="50"
                      className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-2 py-1 rounded text-xs">50</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Manual Grading Hours/Week</label>
                  <div className="relative">
                    <input 
                      type="range" 
                      min="5" 
                      max="40" 
                      defaultValue="20"
                      className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-purple-500 text-white px-2 py-1 rounded text-xs">20 hrs</span>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="glass-card p-8 animate-slide-up-delayed">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Your Potential Savings</h3>
              <div className="space-y-6">
                <div className="flex justify-between items-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <span className="text-gray-700 dark:text-gray-300">Time Saved Per Year</span>
                  <span className="text-2xl font-bold text-green-600">520 hours</span>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <span className="text-gray-700 dark:text-gray-300">Cost Savings Per Year</span>
                  <span className="text-2xl font-bold text-blue-600">$26,000</span>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <span className="text-gray-700 dark:text-gray-300">ROI in First Year</span>
                  <span className="text-2xl font-bold text-purple-600">340%</span>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    With EduLearn's AI-powered automation, your institution could save significant time and money while improving educational outcomes.
                  </p>
                  <Button className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
                    Get Detailed ROI Report
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Application Form - NEW */}
      <section className="py-20 bg-gradient-to-br from-blue-50/30 via-indigo-50/20 to-purple-50/30 dark:from-blue-900/20 dark:via-indigo-900/10 dark:to-purple-900/10 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-slide-up">
            <Badge className="mb-4 bg-blue-100/80 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border-blue-200/50 dark:border-blue-700/50 backdrop-blur-sm hover:scale-105 transition-transform duration-300">
              🚀 Start Your Journey
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Ready to Transform Your Learning?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Join thousands of learners who have already started their journey. Fill out this quick form to get personalized course recommendations.
            </p>
          </div>

          <Card className="glass-card backdrop-blur-xl border border-white/20 dark:border-gray-700/20 shadow-2xl hover:shadow-3xl transition-all duration-500 p-8 animate-slide-up">
            <form className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    placeholder="Enter your first name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    placeholder="Enter your last name"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    placeholder="Enter your email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Learning Goal
                  </label>
                  <select className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300">
                    <option>Career Advancement</option>
                    <option>Skill Development</option>
                    <option>Academic Support</option>
                    <option>Personal Interest</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  What subject interests you most?
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {['Programming', 'Design', 'Business', 'Marketing', 'Data Science', 'AI/ML', 'Finance', 'Other'].map((subject) => (
                    <label key={subject} className="flex items-center space-x-2 cursor-pointer group">
                      <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500" />
                      <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">{subject}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tell us about your learning preferences (optional)
                </label>
                <textarea
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  placeholder="e.g., I prefer video lessons, hands-on projects, evening study sessions..."
                />
              </div>

              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  className="mt-1 rounded text-blue-600 focus:ring-blue-500"
                />
                <label className="text-sm text-gray-600 dark:text-gray-400">
                  I agree to receive personalized course recommendations and updates via email. You can unsubscribe at any time.
                </label>
              </div>

              <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg py-4 transform transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25">
                Get My Personalized Learning Path
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-500">
                🔒 Your information is secure and will never be shared with third parties
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* Interactive Assessment Builder Demo */}
      <section className="py-20 bg-gradient-to-br from-purple-50/80 via-pink-50/50 to-indigo-50/80 dark:from-purple-900/30 dark:via-pink-900/20 dark:to-indigo-900/30 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          {mounted && Array.from({ length: 12 }, (_, i) => (
            <div
              key={i}
              className="absolute w-3 h-3 bg-purple-400/20 rounded-full animate-float"
              style={{
                left: `${(i * 8.33) % 100}%`,
                top: `${(i * 11.11) % 100}%`,
                animationDelay: `${i * 0.4}s`,
                animationDuration: `${6 + (i % 8)}s`
              }}
            />
          ))}
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AssessmentBuilder />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 relative overflow-hidden bg-300% animate-gradient-x">
        {/* Animated elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-black/10"></div>
          {mounted && Array.from({ length: 10 }, (_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white/20 rounded-full animate-float"
              style={{
                left: `${(i * 10) % 100}%`,
                top: `${(i * 13) % 100}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${3 + (i % 4)}s`
              }}
            />
          ))}
        </div>
        
        <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 animate-slide-up">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 animate-text-shimmer">
            Ready to Start Your Learning Journey?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto animate-fade-in-delayed">
            Join thousands of students who are already transforming their careers with EduLearn. 
            Start your free trial today!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up-delayed">
            <Button size="lg" asChild className="bg-white text-blue-600 hover:bg-gray-100 transform transition-all duration-300 hover:scale-110 hover:shadow-2xl group">
              <Link href="/auth/register" className="flex items-center">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:shadow-lg group">
              <Heart className="mr-2 h-4 w-4 group-hover:scale-110 group-hover:text-red-400 transition-all duration-300" />
              Learn More
            </Button>
          </div>
          <div className="mt-8 flex items-center justify-center gap-8 text-blue-100 text-sm animate-fade-in-delayed">
            {[
              { icon: Shield, text: "Secure & Private" },
              { icon: CheckCircle, text: "Money-back Guarantee" },
              { icon: Users, text: "24/7 Support" }
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-2 group hover:scale-105 transition-transform duration-300">
                <item.icon className="h-4 w-4 group-hover:text-white transition-colors duration-300" />
                <span className="group-hover:text-white transition-colors duration-300">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-black text-white py-12 relative overflow-hidden">
        {/* Subtle animated background */}
        <div className="absolute inset-0 opacity-10">
          <div className="grid-background animate-grid-move"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="animate-slide-up">
              <div className="flex items-center mb-4 group">
                <BookOpenIcon className="h-8 w-8 text-blue-400 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300" />
                <span className="ml-2 text-xl font-bold group-hover:text-blue-400 transition-colors duration-300">EduLearn</span>
              </div>
              <p className="text-gray-400 mb-4 hover:text-gray-300 transition-colors duration-300">
                Empowering learners worldwide with cutting-edge education technology and expert instruction.
              </p>
              <div className="flex space-x-4">
                {[
                  { name: 'f', bg: 'bg-blue-600' },
                  { name: 't', bg: 'bg-blue-400' },
                  { name: 'in', bg: 'bg-blue-700' }
                ].map((social, index) => (
                  <div key={index} className={`w-8 h-8 ${social.bg} rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-300 cursor-pointer hover:shadow-lg`}>
                    <span className="text-xs">{social.name}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {[
              {
                title: "Platform",
                links: ["Browse Courses", "For Business", "Become Instructor", "Mobile App"]
              },
              {
                title: "Support", 
                links: ["Help Center", "Contact Us", "System Status", "Bug Reports"]
              },
              {
                title: "Company",
                links: ["About Us", "Careers", "Privacy Policy", "Terms of Service"]
              }
            ].map((section, index) => (
              <div key={index} className="animate-slide-up" style={{animationDelay: `${(index + 1) * 0.1}s`}}>
                <h3 className="font-semibold mb-4 hover:text-blue-400 transition-colors duration-300">{section.title}</h3>
                <ul className="space-y-2 text-gray-400">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <a href="#" className="hover:text-white transition-all duration-300 hover:translate-x-1 block">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 animate-fade-in-delayed">
            <p className="hover:text-gray-300 transition-colors duration-300">© 2024 EduLearn. Empowering education through technology.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}