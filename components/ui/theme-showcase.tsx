'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useTheme } from '@/lib/theme/theme-provider';
import { Palette, Sun, Moon, Monitor } from 'lucide-react';

export function ThemeShowcase() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  return (
    <Card className="w-full max-w-2xl mx-auto glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 gradient-text">
          <Palette className="h-5 w-5" />
          EduLearn Dark Theme Showcase
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Theme Controls */}
        <div className="space-y-3">
          <Label>Theme Selection</Label>
          <div className="flex gap-2">
            <Button
              variant={theme === 'light' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTheme('light')}
              className="button-enhanced"
            >
              <Sun className="h-4 w-4 mr-2" />
              Light
            </Button>
            <Button
              variant={theme === 'dark' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTheme('dark')}
              className="button-enhanced"
            >
              <Moon className="h-4 w-4 mr-2" />
              Dark
            </Button>
            <Button
              variant={theme === 'system' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTheme('system')}
              className="button-enhanced"
            >
              <Monitor className="h-4 w-4 mr-2" />
              System
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Current theme: <Badge variant="outline">{theme}</Badge> 
            {' '} (Resolved: <Badge variant="secondary">{resolvedTheme}</Badge>)
          </p>
        </div>

        {/* Color Palette */}
        <div className="space-y-3">
          <Label>Color Palette</Label>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="h-8 bg-background border rounded flex items-center justify-center text-xs">
                Background
              </div>
              <div className="h-8 bg-card border rounded flex items-center justify-center text-xs">
                Card
              </div>
              <div className="h-8 bg-primary text-primary-foreground rounded flex items-center justify-center text-xs">
                Primary
              </div>
              <div className="h-8 bg-secondary text-secondary-foreground rounded flex items-center justify-center text-xs">
                Secondary
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-8 bg-muted rounded flex items-center justify-center text-xs">
                Muted
              </div>
              <div className="h-8 bg-accent text-accent-foreground rounded flex items-center justify-center text-xs">
                Accent
              </div>
              <div className="h-8 bg-destructive text-destructive-foreground rounded flex items-center justify-center text-xs">
                Destructive
              </div>
              <div className="h-8 bg-success text-success-foreground rounded flex items-center justify-center text-xs">
                Success
              </div>
            </div>
          </div>
        </div>

        {/* Form Elements */}
        <div className="space-y-3">
          <Label>Form Elements</Label>
          <div className="space-y-3">
            <Input placeholder="Sample input field" className="focus-enhanced" />
            <div className="flex gap-2">
              <Button variant="default" className="button-enhanced">Default</Button>
              <Button variant="secondary" className="button-enhanced">Secondary</Button>
              <Button variant="outline" className="button-enhanced">Outline</Button>
              <Button variant="ghost" className="button-enhanced">Ghost</Button>
            </div>
          </div>
        </div>

        {/* Progress and Badges */}
        <div className="space-y-3">
          <Label>Progress & Badges</Label>
          <Progress value={66} className="w-full" />
          <div className="flex gap-2 flex-wrap">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="destructive">Destructive</Badge>
          </div>
        </div>

        {/* Typography */}
        <div className="space-y-3">
          <Label>Typography</Label>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold gradient-text">Heading 1</h1>
            <h2 className="text-xl font-semibold text-foreground">Heading 2</h2>
            <p className="text-foreground">Regular paragraph text with proper contrast.</p>
            <p className="text-muted-foreground">Muted text for secondary information.</p>
            <code className="code-block px-2 py-1 text-sm">console.log('Code sample')</code>
          </div>
        </div>

        {/* Feature Indicators */}
        <div className="pt-4 border-t border-border">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Theme transitions</span>
            <Badge variant="outline" className="text-green-600">✓ Enabled</Badge>
          </div>
          <div className="flex items-center justify-between text-sm mt-2">
            <span className="text-muted-foreground">System preference detection</span>
            <Badge variant="outline" className="text-green-600">✓ Enabled</Badge>
          </div>
          <div className="flex items-center justify-between text-sm mt-2">
            <span className="text-muted-foreground">Persistent theme storage</span>
            <Badge variant="outline" className="text-green-600">✓ Enabled</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
