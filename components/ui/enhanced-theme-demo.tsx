'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { 
  Heart, 
  Star, 
  Zap, 
  Award, 
  TrendingUp, 
  Users, 
  BookOpen,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target
} from 'lucide-react';

export function EnhancedThemeDemo() {
  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold gradient-text">Enhanced Dark Theme Showcase</h1>
        <p className="text-muted-foreground">Experience the vibrant new EduLearn dark theme</p>
      </div>

      {/* Enhanced Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="card-enhanced">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Heart className="h-5 w-5 text-red-500" />
              <CardTitle>Performance</CardTitle>
            </div>
            <CardDescription>System metrics and statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">CPU Usage</span>
                <Badge variant="success" className="badge-success">Good</Badge>
              </div>
              <Progress value={65} className="h-2" />
              <div className="flex justify-between items-center">
                <span className="text-sm">Memory</span>
                <Badge variant="warning" className="badge-warning">Medium</Badge>
              </div>
              <Progress value={80} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-enhanced">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <CardTitle>Analytics</CardTitle>
            </div>
            <CardDescription>User engagement metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Active Users</span>
                <span className="font-semibold text-primary">1,247</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Course Completion</span>
                <Badge variant="info" className="badge-enhanced">85%</Badge>
              </div>
              <Button className="w-full button-primary-enhanced">
                View Details
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="card-enhanced">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-blue-500" />
              <CardTitle>Security</CardTitle>
            </div>
            <CardDescription>System security status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">SSL Certificate</span>
                <Badge variant="success" className="status-online">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Active
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Firewall</span>
                <Switch checked className="toggle-enhanced" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Badges Showcase */}
      <Card className="card-enhanced">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Star className="h-5 w-5 text-yellow-500" />
            <span>Enhanced Badge Variants</span>
          </CardTitle>
          <CardDescription>Vibrant badges with better contrast and gradients</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Badge variant="default" className="badge-enhanced">
              <Zap className="h-3 w-3 mr-1" />
              Primary
            </Badge>
            <Badge variant="success" className="badge-success">
              <CheckCircle className="h-3 w-3 mr-1" />
              Success
            </Badge>
            <Badge variant="warning" className="badge-warning">
              <Clock className="h-3 w-3 mr-1" />
              Warning
            </Badge>
            <Badge variant="destructive" className="badge-destructive">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Error
            </Badge>
            <Badge variant="info">
              <Target className="h-3 w-3 mr-1" />
              Info
            </Badge>
            <Badge variant="outline">
              <Users className="h-3 w-3 mr-1" />
              Outline
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Buttons */}
      <Card className="card-enhanced">
        <CardHeader>
          <CardTitle>Enhanced Button Styles</CardTitle>
          <CardDescription>Buttons with improved hover effects and shadows</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button className="button-primary-enhanced">
              <Award className="h-4 w-4 mr-2" />
              Primary Enhanced
            </Button>
            <Button variant="secondary">
              <BookOpen className="h-4 w-4 mr-2" />
              Secondary
            </Button>
            <Button variant="outline">
              <Users className="h-4 w-4 mr-2" />
              Outline
            </Button>
            <Button variant="ghost" className="button-enhanced">
              <Heart className="h-4 w-4 mr-2" />
              Ghost Enhanced
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Form Elements */}
      <Card className="card-enhanced">
        <CardHeader>
          <CardTitle>Enhanced Form Elements</CardTitle>
          <CardDescription>Form inputs with better focus states and transitions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="enhanced-input">Enhanced Input</Label>
                <Input 
                  id="enhanced-input" 
                  placeholder="Type something..." 
                  className="input-enhanced"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="regular-input">Regular Input</Label>
                <Input 
                  id="regular-input" 
                  placeholder="Compare with this..." 
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch className="toggle-enhanced" />
                <Label>Enhanced Toggle</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch />
                <Label>Regular Toggle</Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Indicators */}
      <Card className="card-enhanced">
        <CardHeader>
          <CardTitle>Status Indicators</CardTitle>
          <CardDescription>Enhanced status badges with glow effects</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full status-online"></div>
              <span className="text-sm">Online</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full status-busy"></div>
              <span className="text-sm">Busy</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full status-away"></div>
              <span className="text-sm">Away</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
