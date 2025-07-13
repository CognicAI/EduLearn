'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Play, Star, BookOpen, Clock, Award, MessageCircle, Bell, Search, Home, User, Settings } from 'lucide-react';

export function MobileAppSimulator() {
  const [activeTab, setActiveTab] = useState('home');
  const [currentScreen, setCurrentScreen] = useState<'dashboard' | 'courses' | 'chat' | 'profile'>('dashboard');

  const screens = {
    dashboard: {
      title: 'Dashboard',
      content: (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-4 text-white">
            <h3 className="font-semibold mb-2">Welcome back, Sarah!</h3>
            <p className="text-sm opacity-90">Continue your learning journey</p>
            <div className="mt-3 bg-white/20 rounded-full h-2">
              <div className="bg-white rounded-full h-2 w-3/4"></div>
            </div>
            <p className="text-xs mt-1">Overall Progress: 75%</p>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-medium text-gray-800 dark:text-gray-200">Recent Courses</h4>
            {[
              { title: 'React Advanced Patterns', progress: 68, time: '2h left' },
              { title: 'Node.js Backend Development', progress: 45, time: '4h left' },
              { title: 'UI/UX Design Principles', progress: 89, time: '30m left' }
            ].map((course, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium text-sm text-gray-800 dark:text-gray-200">{course.title}</h5>
                  <Play className="h-4 w-4 text-blue-500" />
                </div>
                <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                  <span>{course.progress}% complete</span>
                  <span>{course.time}</span>
                </div>
                <div className="mt-2 bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                  <div 
                    className="bg-blue-500 rounded-full h-1 transition-all duration-500"
                    style={{ width: `${course.progress}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    },
    courses: {
      title: 'Courses',
      content: (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-2 flex items-center gap-2">
              <Search className="h-4 w-4 text-gray-500" />
              <input 
                type="text" 
                placeholder="Search courses..." 
                className="bg-transparent text-sm flex-1 outline-none text-gray-800 dark:text-gray-200"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {[
              { title: 'Python for Beginners', rating: 4.9, students: '12k', image: '🐍' },
              { title: 'Web Development', rating: 4.8, students: '8k', image: '🌐' },
              { title: 'Data Science', rating: 4.7, students: '6k', image: '📊' },
              { title: 'Mobile Development', rating: 4.9, students: '4k', image: '📱' }
            ].map((course, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm">
                <div className="text-2xl mb-2 text-center">{course.image}</div>
                <h5 className="font-medium text-xs text-gray-800 dark:text-gray-200 mb-1">{course.title}</h5>
                <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span>{course.rating}</span>
                  </div>
                  <span>{course.students}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    },
    chat: {
      title: 'AI Assistant',
      content: (
        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">AI</div>
              <span className="text-sm font-medium text-gray-800 dark:text-gray-200">EduLearn Assistant</span>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Hi! I can help you with your studies. Upload a document or ask me any question!
            </p>
          </div>
          
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 ml-8">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Can you explain React hooks in simple terms?
            </p>
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">AI</div>
              <span className="text-sm font-medium text-gray-800 dark:text-gray-200">EduLearn Assistant</span>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              React hooks are special functions that let you "hook into" React features. Think of them as tools that help you manage state and side effects in functional components!
            </p>
          </div>
          
          <div className="flex items-center gap-2 p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <input 
              type="text" 
              placeholder="Ask me anything..." 
              className="flex-1 bg-transparent text-sm outline-none text-gray-800 dark:text-gray-200"
            />
            <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1">
              Send
            </Button>
          </div>
        </div>
      )
    },
    profile: {
      title: 'Profile',
      content: (
        <div className="space-y-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-white text-xl">👩‍💻</span>
            </div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-200">Sarah Chen</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Computer Science Student</p>
          </div>
          
          <div className="space-y-3">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
              <h4 className="font-medium text-sm text-gray-800 dark:text-gray-200 mb-2">Achievements</h4>
              <div className="flex items-center gap-2">
                {['🎯', '🏆', '⭐', '🔥'].map((emoji, index) => (
                  <div key={index} className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center">
                    <span className="text-sm">{emoji}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
              <h4 className="font-medium text-sm text-gray-800 dark:text-gray-200 mb-2">Learning Stats</h4>
              <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
                <div className="flex justify-between">
                  <span>Courses Completed</span>
                  <span className="font-medium">12</span>
                </div>
                <div className="flex justify-between">
                  <span>Study Streak</span>
                  <span className="font-medium">15 days</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Study Time</span>
                  <span className="font-medium">127 hours</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }
  };

  const bottomNavItems = [
    { id: 'home', icon: Home, label: 'Home', screen: 'dashboard' as const },
    { id: 'courses', icon: BookOpen, label: 'Courses', screen: 'courses' as const },
    { id: 'chat', icon: MessageCircle, label: 'AI Chat', screen: 'chat' as const },
    { id: 'profile', icon: User, label: 'Profile', screen: 'profile' as const }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16 animate-slide-up">
        <Badge className="mb-4 bg-pink-100/80 dark:bg-pink-900/50 text-pink-700 dark:text-pink-300 border-pink-200/50 dark:border-pink-700/50 backdrop-blur-sm hover:scale-105 transition-transform duration-300">
          📱 Mobile Learning Experience
        </Badge>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Learn Anywhere, Anytime
        </h2>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          Experience our fully responsive mobile app with AI chat, offline learning, and seamless synchronization.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-12 items-center">
        {/* Mobile Simulator */}
        <div className="flex justify-center animate-slide-up">
          <div className="relative">
            {/* Phone Frame */}
            <div className="w-72 h-[600px] bg-black rounded-[3rem] p-2 shadow-2xl">
              <div className="w-full h-full bg-white dark:bg-gray-900 rounded-[2.5rem] overflow-hidden flex flex-col">
                {/* Status Bar */}
                <div className="flex items-center justify-between px-6 py-3 bg-gray-50 dark:bg-gray-800">
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-200">9:41</span>
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-2 bg-green-500 rounded-sm"></div>
                    <div className="w-2 h-2 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                    <div className="w-6 h-3 border border-gray-400 dark:border-gray-500 rounded-sm">
                      <div className="w-4 h-1 bg-green-500 rounded-sm mt-0.5 ml-0.5"></div>
                    </div>
                  </div>
                </div>

                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                    {screens[currentScreen]?.title}
                  </h3>
                  <div className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    <Settings className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 p-4 overflow-y-auto bg-gray-50 dark:bg-gray-900">
                  {screens[currentScreen]?.content}
                </div>

                {/* Bottom Navigation */}
                <div className="flex items-center justify-around py-2 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                  {bottomNavItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id);
                          setCurrentScreen(item.screen);
                        }}
                        className={`flex flex-col items-center py-1 px-3 rounded-lg transition-all duration-200 ${
                          isActive 
                            ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' 
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                        }`}
                      >
                        <Icon className="h-5 w-5 mb-1" />
                        <span className="text-xs">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm animate-bounce">
              📚
            </div>
            <div className="absolute -bottom-4 -left-4 w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white animate-pulse">
              🤖
            </div>
          </div>
        </div>

        {/* Features List */}
        <div className="space-y-6 animate-slide-up-delayed">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Mobile-First Learning
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Our mobile app brings the full EduLearn experience to your fingertips with optimized touch interfaces and offline capabilities.
            </p>
          </div>

          {[
            {
              icon: '📱',
              title: 'Touch-Optimized Interface',
              description: 'Intuitive gestures and responsive design for seamless mobile learning.'
            },
            {
              icon: '🔄',
              title: 'Offline Synchronization',
              description: 'Download courses and continue learning without internet connection.'
            },
            {
              icon: '🤖',
              title: 'AI Chat Assistant',
              description: 'Get instant help from our AI tutor directly in the mobile app.'
            },
            {
              icon: '📊',
              title: 'Progress Tracking',
              description: 'Monitor your learning journey with detailed mobile analytics.'
            },
            {
              icon: '🔔',
              title: 'Smart Notifications',
              description: 'Personalized reminders and study streak notifications.'
            },
            {
              icon: '🎯',
              title: 'Gamification',
              description: 'Earn badges, maintain streaks, and compete with classmates.'
            }
          ].map((feature, index) => (
            <Card key={index} className="glass-card p-4 hover:shadow-lg transition-all duration-300 hover:scale-105 group" style={{animationDelay: `${index * 0.1}s`}}>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white text-xl group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                    {feature.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-200 transition-colors duration-300">
                    {feature.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}

          <div className="pt-4">
            <Button className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 cta-button">
              Download Mobile App
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
