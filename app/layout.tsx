import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

// Resolves relative OG/Twitter image paths to absolute URLs for crawlers.
const siteUrl = process.env.NEXTAUTH_URL || 'https://fin-and-paws.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'Fin & Paws — Inventory',
  description: 'Inventory Management System for Fin & Paws',
  openGraph: {
    title: 'Fin & Paws — Inventory',
    description: 'Inventory Management System for Fin & Paws',
    url: '/',
    siteName: 'Fin & Paws',
    images: [{ url: '/logo.jpg', width: 150, height: 150, alt: 'Fin & Paws' }],
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Fin & Paws — Inventory',
    description: 'Inventory Management System for Fin & Paws',
    images: ['/logo.jpg'],
  },
};

export const viewport: Viewport = {
  themeColor: '#11998e',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased bg-canvas text-ink`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}