import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';

export const metadata: Metadata = {
  title: 'ToolboxAI — AI-Powered Productivity Tools',
  description: 'Summarize documents, roast resumes, and transform emails with AI. Free credits on signup.',
  keywords: ['AI tools', 'document summarizer', 'resume analyzer', 'email transformer', 'productivity'],
  openGraph: {
    title: 'ToolboxAI — AI-Powered Productivity Tools',
    description: 'Three AI-powered tools in one SaaS platform. Start free.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider appearance={{ variables: { colorPrimary: '#0ea5e9', colorBackground: '#18181b', colorText: '#e4e4e7' } }}>
      <html lang="en" className="dark">
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
            rel="stylesheet"
          />
        </head>
        <body className="min-h-screen bg-surface-900 text-surface-700 antialiased">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
