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
  description: 'Advanced AI-integrated Learning Management System for modern education with intelligent features, interactive courses, and comprehensive analytics.',
  keywords: ['education', 'learning', 'management', 'system', 'AI', 'courses', 'online learning', 'e-learning'],
  authors: [{ name: 'EduLearn Team' }],
  creator: 'EduLearn Team',
  publisher: 'EduLearn',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://edulearn.studio'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'EduLearn - Learning Management System',
    description: 'Advanced AI-integrated Learning Management System for modern education with intelligent features, interactive courses, and comprehensive analytics.',
    type: 'website',
    locale: 'en_US',
    url: 'https://edulearn.studio',
    siteName: 'EduLearn',
    images: [
      {
        url: 'https://edulearn.studio/images/og/og-default.svg',
        width: 1200,
        height: 630,
        alt: 'EduLearn - Learning Management System',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EduLearn - Learning Management System',
    description: 'Advanced AI-integrated Learning Management System for modern education',
    images: ['https://edulearn.studio/images/og/og-default.svg'],
    creator: '@edulearn', // Replace with your actual Twitter handle
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/images/logos/icon-16.png', sizes: '16x16', type: 'image/png' },
      { url: '/images/logos/icon-32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/images/logos/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/manifest.json',
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
        
        {/* Additional Open Graph meta tags */}
        <meta property="og:title" content="EduLearn - Learning Management System" />
        <meta property="og:description" content="Advanced AI-integrated Learning Management System for modern education with intelligent features, interactive courses, and comprehensive analytics." />
        <meta property="og:image" content="https://edulearn.studio/images/og/og-default.svg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:url" content="https://edulearn.studio" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="EduLearn" />
        
        {/* Twitter Card meta tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="EduLearn - Learning Management System" />
        <meta name="twitter:description" content="Advanced AI-integrated Learning Management System for modern education" />
        <meta name="twitter:image" content="https://edulearn.studio/images/og/og-default.svg" />
        
        {/* Additional meta tags */}
        <meta name="theme-color" content="#2563eb" />
        <link rel="canonical" href="https://edulearn.studio" />
      </head>
      <body className={`${inter.className} flex flex-col min-h-screen`} suppressHydrationWarning>
        <ErrorSuppression />
        <ErrorBoundary>
          <QueryProvider>
            <AuthProvider>
              <ThemeProvider
                defaultTheme="system"
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