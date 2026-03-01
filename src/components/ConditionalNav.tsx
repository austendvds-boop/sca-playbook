"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

function TopNavLink({ href, label }: { href: string; label: string }) {
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
        <img src="/sca-logo.png" alt="SCA Eagles" className="h-11 w-11 object-contain" />
      </div>

      <div className="flex items-center gap-4 md:gap-6">
        <TopNavLink href="/" label="? Home" />

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

