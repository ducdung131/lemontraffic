import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: {
    default: 'Analytics Hub — Traffic & Revenue Dashboard',
    template: '%s | Analytics Hub',
  },
  description:
    'Unified analytics dashboard combining Google Analytics 4 and Adsconex revenue data into one powerful control center.',
  keywords: ['analytics', 'dashboard', 'traffic', 'revenue', 'google analytics', 'adsconex'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
