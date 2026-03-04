"use client";
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

function ModeIcon({ kind }: { kind: 'whiteboard' | 'documents' }) {
  if (kind === 'whiteboard') {
    return (
      <svg viewBox="0 0 24 24" className="h-8 w-8 md:h-9 md:w-9" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <rect x="3" y="4" width="18" height="13" rx="2" />
        <path d="M8 21h8M12 17v4M7 9h10M7 13h6" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="h-8 w-8 md:h-9 md:w-9" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <path d="M8 8h8M8 12h8M8 16h5" />
    </svg>
  );
}

function ModeCard({ href, title, description, kind, red }: { href: string; title: string; description: string; kind: 'whiteboard' | 'documents'; red?: boolean }) {
  return (
    <Link
      href={href}
      className={`group flex min-h-[140px] w-full cursor-pointer flex-col justify-between rounded-xl p-4 text-left shadow-2xl transition-transform duration-150 hover:-translate-y-1 hover:shadow-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white md:min-h-[160px] md:p-5 ${
        red ? 'bg-[#CC0000] text-white' : 'bg-white text-[#003087]'
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-2xl font-black uppercase tracking-wide md:text-3xl">{title}</h2>
        <ModeIcon kind={kind} />
      </div>
      <p className="text-sm font-bold uppercase tracking-wide opacity-95 md:text-base">{description}</p>
    </Link>
  );
}

export default function HomePage() {
  const [playCount, setPlayCount] = useState(0);
  const [docCount, setDocCount] = useState(0);

  useEffect(() => {
    fetch('/api/plays').then((r) => r.json()).then((d) => setPlayCount((d.data || []).length)).catch(() => undefined);
    fetch('/api/documents').then((r) => r.json()).then((d) => setDocCount((d.data || []).length)).catch(() => undefined);
  }, []);

  return (
    <main
      style={{ backgroundImage: "url('/sca-team-champs.jpg')" }}
      className="relative h-screen overflow-hidden bg-cover bg-center text-white"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-[#003087]/88 to-black/80" />

      <div className="relative z-10 flex h-full flex-col items-center justify-between px-6 py-8 text-center">
        <div className="flex flex-col items-center gap-2 pt-4">
          <Image src="/sca-logo.png" alt="SCA Eagles" width={112} height={112} className="h-20 w-20 object-contain md:h-28 md:w-28" priority />
          <h1 className="text-3xl font-black uppercase tracking-wide md:text-5xl">SCA Eagles Football</h1>
          <p className="text-2xl font-extrabold tracking-[0.1em] text-[#CC0000] md:text-3xl">ChalkTalk</p>
        </div>

        <div className="flex w-full max-w-md flex-col gap-4">
          <ModeCard href="/plays/new" title="Whiteboard" description="Draw and diagram plays" kind="whiteboard" red />
          <ModeCard href="/documents" title="Install Sheets" description="Build teaching documents" kind="documents" />
          <div className="mt-6 flex gap-6 text-sm text-white/60">
            <span>{playCount} plays</span>
            <span>{docCount} install sheets</span>
          </div>
        </div>

        <div className="flex flex-col items-center gap-3 pb-4">
          <Link href="/plays" className="rounded border border-white/40 px-4 py-2 text-white/80 transition hover:bg-white/10">
            Play Library →
          </Link>
          <p className="text-center text-xs italic text-white/40">"Here am I. Send me!" — Isaiah 6:8</p>
        </div>
      </div>
    </main>
  );
}
