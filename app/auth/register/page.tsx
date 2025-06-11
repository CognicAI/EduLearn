import { RegisterForm } from '@/components/auth/register-form';
import { BookOpenIcon } from 'lucide-react';
import Link from 'next/link';

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center">
            <BookOpenIcon className="h-10 w-10 text-primary" />
            <span className="ml-2 text-2xl font-bold text-gray-900">EduLearn</span>
          </Link>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
}