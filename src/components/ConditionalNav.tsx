"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function ConditionalNav() {
  const pathname = usePathname();
  const isEditor = pathname === '/plays/new' || /^\/plays\/[^/]+$/.test(pathname);

  if (isEditor) return null;

  return (
    <nav style={{ background: '#003087' }} className="no-print flex h-14 flex-shrink-0 items-center px-4">
      <div className="mr-8 flex items-center gap-3">
        <img src="/sca-logo.png" alt="SCA Eagles" className="h-9 w-9 object-contain" />
        <div className="flex flex-col leading-tight">
          <span style={{ color: '#CC0000' }} className="text-sm font-bold">SCA Eagles</span>
          <span className="text-xs text-white opacity-80">SCA Playbook</span>
        </div>
      </div>
      <Link href="/plays" className="mr-6 text-sm font-medium text-white opacity-90 hover:opacity-100">My Plays</Link>
      <Link href="/documents" className="text-sm font-medium text-white opacity-90 hover:opacity-100">Documents</Link>
      <span className="hidden sm:block italic text-white text-xs opacity-60 ml-auto pr-2">
        Isaiah 6:8
      </span>
    </nav>
  );
}