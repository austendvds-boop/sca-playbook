"use client";

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

function TopNavLink({ href, label }: { href: string; label: React.ReactNode }) {
  return (
    <Link href={href} className="text-sm font-extrabold uppercase tracking-wide text-white hover:underline">
      {label}
    </Link>
  );
}

export function ConditionalNav() {
  const pathname = usePathname();

  if (pathname === '/' || pathname.includes('/print')) return null;

  const isPlayRoute = pathname.startsWith('/plays');
  const isDocRoute = pathname.startsWith('/documents');

  if (!isPlayRoute && !isDocRoute) return null;

  return (
    <nav style={{ background: '#003087' }} className="no-print flex h-16 items-center px-4 md:px-6">
      <div className="mr-5 flex items-center gap-3">
        <Image src="/sca-logo.png" alt="SCA Eagles" width={44} height={44} className="h-11 w-11 object-contain" />
      </div>

      <div className="flex items-center gap-4 md:gap-6">
        <TopNavLink
          href="/"
          label={
            <span className="inline-flex items-center gap-1">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>Home</span>
            </span>
          }
        />

        {isPlayRoute ? (
          <>
            <TopNavLink href="/plays" label="Play Library" />
            <TopNavLink href="/plays/new" label="+ New Play" />
          </>
        ) : null}

        {isDocRoute ? (
          <>
            <TopNavLink href="/documents" label="Install Sheets" />
            <TopNavLink href="/documents/new" label="+ New Install Sheet" />
          </>
        ) : null}
      </div>
    </nav>
  );
}
