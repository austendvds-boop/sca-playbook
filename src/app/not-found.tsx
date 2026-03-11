import Image from 'next/image';
import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-6 py-12 text-[#003087]">
      <div className="w-full max-w-md rounded-2xl border-2 border-[#003087] bg-white p-8 text-center shadow-lg">
        <Image
          src="/sca-logo.png"
          alt="SCA Eagles logo"
          width={88}
          height={88}
          className="mx-auto mb-6 h-[88px] w-[88px] object-contain"
          priority
        />
        <p className="text-sm font-black uppercase tracking-[0.2em] text-[#CC0000]">ChalkTalk</p>
        <h1 className="mt-3 text-3xl font-black uppercase">Page not found</h1>
        <p className="mt-3 text-sm text-[#003087]/80">The page you were looking for does not exist or may have moved.</p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded bg-[#CC0000] px-5 py-3 font-black uppercase text-white transition hover:bg-[#A40000]"
        >
          Back to Home
        </Link>
      </div>
    </main>
  );
}
