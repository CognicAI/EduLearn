'use client';

import { EnhancedThemeDemo } from '@/components/ui/enhanced-theme-demo';
import { ProminentThemeToggle } from '@/components/ui/theme-toggle';

export default function ThemeShowcasePage() {
  return (
    <div className="min-h-screen bg-dashboard">
      {/* Fixed theme toggle for easy testing */}
      <div className="fixed top-4 right-4 z-50">
        <ProminentThemeToggle />
      </div>
      
      <div className="container mx-auto py-8">
        <EnhancedThemeDemo />
      </div>
    </div>
  );
}
