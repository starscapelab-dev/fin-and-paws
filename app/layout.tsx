import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Fin & Paws — Inventory',
  description: 'Inventory Management System for Fin & Paws',
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