import Link from 'next/link';

function ModeIcon({ kind }: { kind: 'whiteboard' | 'documents' }) {
  if (kind === 'whiteboard') {
    return (
      <svg viewBox="0 0 24 24" className="h-9 w-9" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <rect x="3" y="4" width="18" height="13" rx="2" />
        <path d="M8 21h8M12 17v4M7 9h10M7 13h6" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="h-9 w-9" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <path d="M8 8h8M8 12h8M8 16h5" />
    </svg>
  );
}

function ModeCard({ href, title, description, kind, red }: { href: string; title: string; description: string; kind: 'whiteboard' | 'documents'; red?: boolean }) {
  return (
    <Link
      href={href}
      className={`group flex min-h-44 w-full flex-col justify-between rounded-2xl border-4 p-6 text-left transition-transform hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white ${
        red ? 'border-white bg-[#CC0000] text-white' : 'border-[#CC0000] bg-[#003087] text-white'
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-3xl font-black uppercase tracking-wide">{title}</h2>
        <ModeIcon kind={kind} />
      </div>
      <p className="text-base font-bold uppercase tracking-wide opacity-95">{description}</p>
    </Link>
  );
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#003087] px-5 py-8 text-white md:px-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center text-center">
        <img src="/sca-logo.png" alt="SCA Eagles" className="mb-4 h-36 w-36 object-contain md:h-44 md:w-44" />
        <h1 className="text-4xl font-black uppercase tracking-wide md:text-6xl">SCA Eagles Football</h1>
        <p className="mt-2 text-2xl font-extrabold uppercase tracking-[0.2em] text-[#CC0000]">ChalkTalk</p>
        <p className="mt-4 max-w-2xl text-sm font-bold italic uppercase tracking-wider opacity-90 md:text-base">
          “Here am I. Send me!” — Isaiah 6:8
        </p>

        <div className="mt-10 grid w-full max-w-5xl gap-5 md:grid-cols-2">
          <ModeCard href="/plays/new" title="Whiteboard" description="Draw plays, build your library" kind="whiteboard" red />
          <ModeCard href="/documents" title="Install Sheets" description="Build teaching documents for players" kind="documents" />
        </div>

        <Link href="/plays" className="mt-8 text-sm font-extrabold uppercase tracking-wider text-white underline underline-offset-4">
          Play Library
        </Link>
      </div>
    </main>
  );
}

