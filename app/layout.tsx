import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/lib/auth/auth-context';
import { QueryProvider } from '@/lib/query-provider';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
});

export const metadata: Metadata = {
  title: 'EduLearn - Learning Management System',
  description: 'Advanced AI-integrated Learning Management System for modern education',
  keywords: ['education', 'learning', 'management', 'system', 'AI', 'courses'],
  authors: [{ name: 'EduLearn Team' }],
  openGraph: {
    title: 'EduLearn - Learning Management System',
    description: 'Advanced AI-integrated Learning Management System for modern education',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={inter.className}>
        <QueryProvider>
          <AuthProvider>
            {children}
            <Toaster position="top-right" />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}