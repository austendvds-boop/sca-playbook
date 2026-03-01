import Link from 'next/link';

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
      className={`group flex min-h-[140px] w-full flex-col justify-between rounded-xl p-4 text-left shadow-2xl transition-transform hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white md:min-h-[160px] md:p-5 ${
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
  return (
    <main className="app-screen relative text-white">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(to bottom, rgba(0,48,135,0.88) 0%, rgba(0,0,0,0.80) 100%), url('/sca-team-champs.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />

      <div className="relative mx-auto flex h-full w-full max-w-6xl flex-col items-center px-4 py-4 text-center md:px-8 md:py-6">
        <img src="/sca-logo.png" alt="SCA Eagles" className="mb-2 h-20 w-20 object-contain md:mb-3 md:h-28 md:w-28" />
        <h1 className="text-3xl font-black uppercase tracking-wide md:text-5xl">SCA Eagles Football</h1>
        <p className="mt-1 text-2xl font-extrabold tracking-[0.1em] text-[#CC0000] md:text-3xl">ChalkTalk</p>

        <div className="mt-4 grid w-full max-w-5xl gap-3 md:mt-6 md:gap-4 md:grid-cols-2">
          <ModeCard href="/plays/new" title="Whiteboard" description="Draw and diagram plays" kind="whiteboard" red />
          <ModeCard href="/documents" title="Install Sheets" description="Build teaching documents" kind="documents" />
        </div>

        <Link href="/plays" className="mt-3 text-xs font-extrabold tracking-wider text-white/60 md:mt-4 md:text-sm">
          Play Library ?
        </Link>

        <p className="mt-auto pt-3 text-xs italic text-white/95 md:pt-5 md:text-sm">“Here am I. Send me!” — Isaiah 6:8</p>
      </div>
    </main>
  );
}

