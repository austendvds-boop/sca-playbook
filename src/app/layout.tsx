import type { Metadata } from "next";
import "./globals.css";
import Link from 'next/link';

export const metadata: Metadata = { title: 'SCA Playbook', description: 'Football play diagram app' };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900">
        <header className="no-print border-b bg-[#003087] text-white">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
            <div className="flex items-center gap-3 font-bold"><span className="rounded bg-[#CC0000] px-2 py-1">SCA</span> SCA Eagles Playbook</div>
            <nav className="flex gap-5 text-sm font-semibold"><Link href="/plays">Plays</Link><Link href="/documents">Documents</Link></nav>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
