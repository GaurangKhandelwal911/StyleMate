import type { Metadata } from 'next';
import './globals.css';
import { AppLayout } from '@/components/layout/AppLayout';

export const metadata: Metadata = {
  title: 'StyleMate — Virtual Closet & AI Outfit Recommender',
  description: 'Your personal digital wardrobe. Organize clothes, manage availability, and generate smart outfit combinations.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,500;0,600;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="h-full bg-[#FAF8F5] antialiased selection:bg-[#E7ECE3] selection:text-[#2A3524]">
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}
