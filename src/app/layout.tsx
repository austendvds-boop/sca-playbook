import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ConditionalNav } from '@/components/ConditionalNav';
import { Footer } from '@/components/shared/Footer';

const siteTitle = 'ChalkTalk — SCA Eagles Football';
const siteDescription = 'SCA Eagles Football play diagramming and install sheet builder';
const ogImage = '/sca-team-champs.jpg';

export const metadata: Metadata = {
  title: siteTitle,
  description: siteDescription,
  icons: {
    icon: '/sca-logo.png',
    apple: '/sca-logo.png'
  },
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    images: [{ url: ogImage }]
  },
  twitter: {
    card: 'summary_large_image',
    title: siteTitle,
    description: siteDescription,
    images: [ogImage]
  }
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1, maximumScale: 1 };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" style={{ overscrollBehavior: 'none' }}>
      <body className="flex min-h-screen flex-col bg-white text-[#003087]">
        <ConditionalNav />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
