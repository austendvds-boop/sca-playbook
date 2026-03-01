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
      className={`group flex min-h-[180px] w-full flex-col justify-between rounded-xl p-6 text-left shadow-2xl transition-transform hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white ${
        red ? 'bg-[#CC0000] text-white' : 'bg-white text-[#003087]'
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
    <main className="relative min-h-screen overflow-hidden text-white">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(to bottom, rgba(0,48,135,0.88) 0%, rgba(0,0,0,0.80) 100%), url('/sca-team-champs.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col items-center px-5 py-8 text-center md:px-10">
        <img src="/sca-logo.png" alt="SCA Eagles" className="mb-4 h-[120px] w-[120px] object-contain md:h-40 md:w-40" />
        <h1 className="text-4xl font-black uppercase tracking-wide md:text-6xl">SCA Eagles Football</h1>
        <p className="mt-2 text-3xl font-extrabold tracking-[0.1em] text-[#CC0000]">ChalkTalk</p>

        <div className="mt-10 grid w-full max-w-5xl gap-5 md:grid-cols-2">
          <ModeCard href="/plays/new" title="Whiteboard" description="Draw and diagram plays" kind="whiteboard" red />
          <ModeCard href="/documents" title="Install Sheets" description="Build teaching documents" kind="documents" />
        </div>

        <Link href="/plays" className="mt-7 text-sm font-extrabold tracking-wider text-white/50">
          Play Library ?
        </Link>

        <p className="mt-auto pt-10 text-sm italic text-white">“Here am I. Send me!” — Isaiah 6:8</p>
      </div>
    </main>
  );
}
