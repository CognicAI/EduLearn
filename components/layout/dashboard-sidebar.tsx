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
  PanelLeftOpen
} from 'lucide-react';

const sidebarItems = {
  student: [
    { name: 'Dashboard', href: '/dashboard/student', icon: LayoutDashboard },
    { name: 'My Courses', href: '/courses', icon: BookOpenIcon },
    { name: 'Assignments', href: '/assignments', icon: FileText },
    { name: 'Calendar', href: '/calendar', icon: Calendar },
    { name: 'Progress', href: '/progress', icon: BarChart3 },
  ],
  teacher: [
    { name: 'Dashboard', href: '/dashboard/teacher', icon: LayoutDashboard },
    { name: 'My Courses', href: '/courses', icon: BookOpenIcon },
    { name: 'Students', href: '/students', icon: GraduationCap },
    { name: 'Assignments', href: '/assignments', icon: FileText },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Calendar', href: '/calendar', icon: Calendar },
  ],
  admin: [
    { name: 'Dashboard', href: '/dashboard/admin', icon: LayoutDashboard },
    { name: 'Users', href: '/users', icon: Users },
    { name: 'Courses', href: '/courses', icon: BookOpenIcon },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Calendar', href: '/calendar', icon: Calendar },
    { name: 'Settings', href: '/settings', icon: Settings },
  ],
};

interface DashboardSidebarProps {
  className?: string;
}

export function DashboardSidebar({ className }: DashboardSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  const items = sidebarItems[user.role] || [];

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

      {!isCollapsed && (
        <div className="p-4 border-t">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <UserCheck className="h-4 w-4" />
            <div>
              <p className="font-medium text-foreground">
                {user.firstName} {user.lastName}
              </p>
              <p className="capitalize">{user.role}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}