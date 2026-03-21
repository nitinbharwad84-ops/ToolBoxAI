import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'ToolboxAI — AI-Powered Productivity Tools',
    template: '%s — ToolboxAI',
  },
  description: 'Summarize documents, roast resumes, and transform emails with AI. Free credits on signup.',
  keywords: ['AI tools', 'document summarizer', 'resume analyzer', 'email transformer', 'productivity', 'SaaS'],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    title: 'ToolboxAI — AI-Powered Productivity Tools',
    description: 'Three AI-powered tools in one SaaS platform. Start free with 100 credits.',
    type: 'website',
    siteName: 'ToolboxAI',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ToolboxAI — AI-Powered Productivity Tools',
    description: 'Summarize docs, roast resumes, transform emails. Free to start.',
  },
  robots: { index: true, follow: true },
};

export function generateViewport() {
  return {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    themeColor: '#18181b',
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: '#6366f1',
          colorBackground: '#121214',
          colorText: '#f4f4f5',
          colorTextSecondary: '#a1a1aa',
          colorInputBackground: '#1e1e20',
          colorInputText: '#ffffff',
          colorSuccess: '#22c55e',
          colorDanger: '#ef4444',
        },
        elements: {
          userButtonPopoverActionButtonText: { color: '#e4e4e7' },
          userButtonPopoverFooter: 'hidden',
          headerTitle: { color: '#ffffff' },
          headerSubtitle: { color: '#a1a1aa' },
          formFieldLabel: { color: '#d4d4d8' },
          footerActionText: { color: '#a1a1aa' },
          footerActionLink: { color: '#6366f1' },
          socialButtonsBlockButtonText: { color: '#f4f4f5' },
          socialButtonsBlockButton: 'bg-[#1e1e20] border-[#2d2d30] hover:bg-[#2d2d30]',
        }
      }}
    >
      <html lang="en" className="dark">
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
            rel="stylesheet"
          />
        </head>
        <body className="min-h-screen text-surface-700 antialiased">
          <a href="#main-content" className="skip-link">Skip to content</a>
          <div id="main-content">
            {children}
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
