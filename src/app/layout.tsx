import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ConditionalNav } from '@/components/ConditionalNav';

export const metadata: Metadata = { title: 'SCA Playbook', description: 'Football play diagram app' };
export const viewport: Viewport = { width: 'device-width', initialScale: 1, maximumScale: 1 };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" style={{ overscrollBehavior: 'none' }}>
      <body className="bg-slate-50 text-slate-900">
        <ConditionalNav />
        {children}
      </body>
    </html>
  );
}