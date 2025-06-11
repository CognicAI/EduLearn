'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { loginSchema, LoginFormData } from '@/lib/utils/validation';
import { useAuth } from '@/lib/auth/auth-context';
import { getDemoCredentials } from '@/lib/auth/auth-service';
import { Loader2, Eye, EyeOff, User, GraduationCap, Shield } from 'lucide-react';
import Link from 'next/link';

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'student' | 'teacher' | 'admin'>('student');
  const { login, isLoading } = useAuth();
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // Auto-fill with student credentials by default
  useEffect(() => {
    const credentials = getDemoCredentials()[selectedRole];
    setValue('email', credentials.email);
    setValue('password', credentials.password);
  }, [selectedRole, setValue]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data);
    } catch (error) {
      // Error handling is done in the auth context
    }
  };

  const switchRole = (role: 'student' | 'teacher' | 'admin') => {
    setSelectedRole(role);
    const credentials = getDemoCredentials()[role];
    setValue('email', credentials.email);
    setValue('password', credentials.password);
  };

  const currentEmail = watch('email');
  const currentPassword = watch('password');

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Welcome Back</CardTitle>
        <CardDescription className="text-center">
          Choose your role to login with demo credentials
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Role Selection */}
        <div className="mb-6 p-4 bg-muted/50 rounded-lg">
          <p className="text-sm font-medium mb-3 text-center">Select Demo Role</p>
          <div className="grid grid-cols-3 gap-2">
            <Button
              type="button"
              variant={selectedRole === 'student' ? 'default' : 'outline'}
              size="sm"
              onClick={() => switchRole('student')}
              className="flex flex-col items-center gap-1 h-auto py-3"
            >
              <GraduationCap className="h-4 w-4" />
              <span className="text-xs">Student</span>
            </Button>
            <Button
              type="button"
              variant={selectedRole === 'teacher' ? 'default' : 'outline'}
              size="sm"
              onClick={() => switchRole('teacher')}
              className="flex flex-col items-center gap-1 h-auto py-3"
            >
              <User className="h-4 w-4" />
              <span className="text-xs">Teacher</span>
            </Button>
            <Button
              type="button"
              variant={selectedRole === 'admin' ? 'default' : 'outline'}
              size="sm"
              onClick={() => switchRole('admin')}
              className="flex flex-col items-center gap-1 h-auto py-3"
            >
              <Shield className="h-4 w-4" />
              <span className="text-xs">Admin</span>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2">
            Credentials are automatically filled for the selected role
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              {...register('email')}
              className={errors.email ? 'border-destructive' : ''}
              value={currentEmail || ''}
              readOnly
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                {...register('password')}
                className={errors.password ? 'border-destructive pr-10' : 'pr-10'}
                value={currentPassword || ''}
                readOnly
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing In as {selectedRole}...
              </>
            ) : (
              `Sign In as ${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}`
            )}
          </Button>
        </form>

        <div className="mt-4 text-center text-sm">
          Don't have an account?{' '}
          <Link href="/auth/register" className="text-primary hover:underline">
            Sign up
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}