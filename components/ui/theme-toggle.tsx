'use client';

import React from 'react';
import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/lib/theme/theme-provider';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
  className?: string;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function ThemeToggle({ className, variant = 'ghost', size = 'icon' }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={cn(
            'transition-all duration-300 hover:scale-105 hover:bg-accent/80',
            'dark:border-border/50 dark:bg-card/50 dark:hover:bg-accent',
            'shadow-sm hover:shadow-md',
            className
          )}
        >
          {resolvedTheme === 'dark' ? (
            <Moon className="h-4 w-4 text-blue-400 transition-colors" />
          ) : (
            <Sun className="h-4 w-4 text-amber-500 transition-colors" />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="min-w-[8rem] dark:bg-card dark:border-border/50 shadow-lg"
      >
        <DropdownMenuItem
          onClick={() => setTheme('light')}
          className={cn(
            'cursor-pointer transition-colors hover:bg-accent/80',
            theme === 'light' && 'bg-accent text-accent-foreground font-medium'
          )}
        >
          <Sun className="mr-2 h-4 w-4 text-amber-500" />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme('dark')}
          className={cn(
            'cursor-pointer transition-colors hover:bg-accent/80',
            theme === 'dark' && 'bg-accent text-accent-foreground font-medium'
          )}
        >
          <Moon className="mr-2 h-4 w-4 text-blue-400" />
          <span>Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme('system')}
          className={cn(
            'cursor-pointer transition-colors hover:bg-accent/80',
            theme === 'system' && 'bg-accent text-accent-foreground font-medium'
          )}
        >
          <Monitor className="mr-2 h-4 w-4 text-emerald-500" />
          <span>System</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Simple toggle button without dropdown
export function SimpleThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className={cn(
        'transition-all duration-300 hover:scale-105 hover:bg-accent/80',
        'dark:border-border/50 dark:bg-card/50 dark:hover:bg-accent',
        'shadow-sm hover:shadow-md',
        className
      )}
    >
      {resolvedTheme === 'dark' ? (
        <Sun className="h-4 w-4 text-amber-500 transition-all duration-300 rotate-0 scale-100" />
      ) : (
        <Moon className="h-4 w-4 text-blue-400 transition-all duration-300 rotate-0 scale-100" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}

// Prominent theme toggle with text label
export function ProminentThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <Button
      variant="outline"
      onClick={toggleTheme}
      className={cn(
        'transition-all duration-300 hover:scale-105',
        'dark:border-border/50 dark:bg-card/50 dark:hover:bg-accent',
        'shadow-sm hover:shadow-md gap-2 font-medium',
        'bg-gradient-to-r from-background to-accent/10',
        'dark:from-card dark:to-accent/10',
        'border-2 hover:border-primary/30',
        className
      )}
      title="Click to toggle theme quickly, or visit Settings for permanent changes"
    >
      {resolvedTheme === 'dark' ? (
        <>
          <Sun className="h-4 w-4 text-amber-500 transition-all duration-300" />
          <span className="hidden sm:inline text-sm">Light Mode</span>
        </>
      ) : (
        <>
          <Moon className="h-4 w-4 text-blue-400 transition-all duration-300" />
          <span className="hidden sm:inline text-sm">Dark Mode</span>
        </>
      )}
    </Button>
  );
}
