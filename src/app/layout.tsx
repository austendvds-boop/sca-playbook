import type { Metadata } from "next";
import "./globals.css";
import Link from 'next/link';

export const metadata: Metadata = { title: 'SCA Playbook', description: 'Football play diagram app' };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className="bg-[#F9FAFB] text-gray-900"><header className="bg-[#003087] text-white px-6 py-3 flex gap-6"><strong>SCA Eagles Playbook</strong><Link href="/plays">Plays</Link><Link href="/documents">Documents</Link></header>{children}</body></html>;
}
