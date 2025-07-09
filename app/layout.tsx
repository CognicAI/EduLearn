import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/lib/auth/auth-context';
import { QueryProvider } from '@/lib/query-provider';
import { ThemeProvider } from '@/lib/theme/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { ChatbotWidget } from '@/components/chatbot/chatbot-widget';

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
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className={`${inter.className} flex flex-col min-h-screen`}>  {/* ensure full height layout */}
        <QueryProvider>
          <AuthProvider>
            <ThemeProvider
              defaultTheme="dark"
              enableSystem={false}  // force dark mode by default
              disableTransitionOnChange={false}
            >
              <main className="flex-grow">{children}</main>  {/* main content grows to fill */}
              <ChatbotWidget />
              <Toaster position="top-right" />
            </ThemeProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}