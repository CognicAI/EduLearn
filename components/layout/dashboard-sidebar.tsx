'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import {
  BookOpenIcon,
  LayoutDashboard,
  Users,
  FileText,
  Calendar,
  BarChart3,
  Settings,
  GraduationCap,
  UserCheck,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  Megaphone,
  CalendarDays,
  Shield
} from 'lucide-react';

const sidebarItems = {
  student: [
    { name: 'Dashboard', href: '/dashboard/student', icon: LayoutDashboard },
    { name: 'My Courses', href: '/dashboard/student/courses', icon: BookOpenIcon },
    { name: 'Assignments', href: '/assignments', icon: FileText },
    { name: 'Calendar', href: '/calendar', icon: Calendar },
    { name: 'Progress', href: '/progress', icon: BarChart3 },
    { name: 'Settings', href: '/settings', icon: Settings },
  ],
  teacher: [
    { name: 'Dashboard', href: '/dashboard/teacher', icon: LayoutDashboard },
    { name: 'My Courses', href: '/dashboard/teacher/courses', icon: BookOpenIcon },
    { name: 'Assignments', href: '/assignments', icon: FileText },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Calendar', href: '/calendar', icon: Calendar },
    { name: 'Settings', href: '/settings', icon: Settings },
  ],
  admin: [
    { name: 'Dashboard', href: '/dashboard/admin', icon: LayoutDashboard },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Courses', href: '/admin/courses', icon: BookOpenIcon },
    { name: 'Announcements', href: '/admin/announcements', icon: Megaphone },
    { name: 'Events', href: '/admin/events', icon: CalendarDays },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { name: 'Settings', href: '/settings', icon: Settings },
  ],
};

interface DashboardSidebarProps {
  className?: string;
}

export function DashboardSidebar({ className }: DashboardSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  const items = sidebarItems[user.role] || [];

  const handleLogout = () => {
    logout();
  };

  return (
    <div className={cn(
      'flex flex-col border-r bg-background transition-all duration-300',
      isCollapsed ? 'w-16' : 'w-64',
      className
    )}>
      <div className="flex h-16 items-center justify-between px-4 border-b">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <BookOpenIcon className="h-6 w-6 text-primary" />
            <span className="font-semibold">EduLearn</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-8 w-8"
        >
          {isCollapsed ? (
            <PanelLeftOpen className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </Button>
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-2">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? 'secondary' : 'ghost'}
                  className={cn(
                    'w-full justify-start h-10',
                    isCollapsed && 'px-2',
                    isActive && 'bg-secondary text-secondary-foreground'
                  )}
                >
                  <Icon className={cn('h-4 w-4', isCollapsed ? 'mx-auto' : 'mr-2')} />
                  {!isCollapsed && <span>{item.name}</span>}
                </Button>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      {/* User Info and Logout */}
      <div className="p-4 border-t space-y-3">
        {!isCollapsed && (
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <UserCheck className="h-4 w-4" />
            <div>
              <p className="font-medium text-foreground">
                {user.firstName} {user.lastName}
              </p>
              <p className="capitalize flex items-center gap-1">
                {user.role === 'admin' && <Shield className="h-3 w-3" />}
                {user.role === 'teacher' && <BookOpenIcon className="h-3 w-3" />}
                {user.role === 'student' && <GraduationCap className="h-3 w-3" />}
                {user.role}
              </p>
            </div>
          </div>
        )}

        {/* Logout Button */}
        <Button
          variant="outline"
          size={isCollapsed ? "icon" : "sm"}
          onClick={handleLogout}
          className={cn(
            "w-full",
            isCollapsed ? "h-8 w-8" : "justify-start",
            "text-destructive hover:text-destructive hover:bg-destructive/10"
          )}
        >
          <LogOut className={cn("h-4 w-4", !isCollapsed && "mr-2")} />
          {!isCollapsed && <span>Logout</span>}
        </Button>
      </div>
    </div>
  );
}