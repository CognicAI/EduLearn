import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/lib/auth/auth-context';
import { QueryProvider } from '@/lib/query-provider';
import { ThemeProvider } from '@/lib/theme/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { ChatbotWidget } from '@/components/chatbot/chatbot-widget';
import { ErrorBoundary } from '@/components/error-boundary';
import { ErrorSuppression } from '@/components/error-suppression';


const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
});
console.log(
  'NEXT_PUBLIC_API_URL from layout:',
  process.env.NEXT_PUBLIC_API_URL
);

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
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
      </head>
      <body className={`${inter.className} flex flex-col min-h-screen`} suppressHydrationWarning>
        <ErrorSuppression />
        <ErrorBoundary>
          <QueryProvider>
            <AuthProvider>
              <ThemeProvider
                defaultTheme="light"
                enableSystem={true}
                disableTransitionOnChange={false}
              >
                <main className="flex-grow">{children}</main>
                <ChatbotWidget />
                <Toaster position="top-right" />
              </ThemeProvider>
            </AuthProvider>
          </QueryProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}