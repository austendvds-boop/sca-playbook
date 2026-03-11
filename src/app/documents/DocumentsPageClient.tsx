"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { defaultPlayCardLayout } from '@/lib/installSheet';

type Doc = {
  id: string;
  name: string;
  docType: string;
  updatedAt: string;
  layoutData?: {
    playName?: string;
    diagrams?: Array<{ playId: string | null }>;
  };
};
type Play = { id: string; name: string };

export function DocumentsPageClient() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [plays, setPlays] = useState<Play[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const [docsRes, playsRes] = await Promise.all([fetch('/api/documents'), fetch('/api/plays')]);
      if (!docsRes.ok || !playsRes.ok) throw new Error('Failed to load documents');

      const [docsPayload, playsPayload] = await Promise.all([docsRes.json(), playsRes.json()]);
      setDocs(Array.isArray(docsPayload?.data) ? docsPayload.data : []);
      setPlays(Array.isArray(playsPayload?.data) ? playsPayload.data : []);
    } catch (loadError) {
      console.error('Failed to load documents page', loadError);
      setDocs([]);
      setPlays([]);
      setError('Unable to load install sheets right now.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const playMap = useMemo(() => new Map(plays.map((p) => [p.id, p.name])), [plays]);

  const removeDoc = async (id: string) => {
    const confirmed = window.confirm('Delete this install sheet? This cannot be undone.');
    if (!confirmed) return;

    const r = await fetch(`/api/documents/${id}`, { method: 'DELETE' });
    if (!r.ok) {
      alert('Failed to delete install sheet. Please try again.');
      return;
    }

    setDocs((prev) => prev.filter((d) => d.id !== id));
  };

  const createDoc = async (docType: 'play_card' | 'reference_sheet') => {
    const r = await fetch('/api/documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        docType,
        name: docType === 'play_card' ? 'New Install Sheet' : 'Reference Sheet',
        layoutData: docType === 'play_card' ? defaultPlayCardLayout : undefined
      })
    });

    const d = await r.json();
    if (!r.ok || !d.data?.id) {
      console.error('Failed to create document:', d);
      alert('Failed to create install sheet. Please try again.');
      return;
    }

    router.push(`/documents/${d.data.id}`);
  };

  return (
    <main className="app-screen p-4 md:p-6">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-black uppercase text-[#003087] md:text-3xl">Install Sheets</h1>
        <div className="flex gap-2">
          <button onClick={() => createDoc('play_card')} className="rounded bg-[#CC0000] px-3 py-2 font-black uppercase text-white">
            New Install Sheet
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto pb-2">
        {error ? <p className="mb-3 text-sm font-semibold text-red-700">{error}</p> : null}

        {loading ? (
          <div className="grid gap-3 pr-1">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="rounded border-2 border-gray-200 bg-white p-3">
                <div className="h-6 w-48 animate-pulse rounded bg-gray-200" />
                <div className="mt-2 h-4 w-32 animate-pulse rounded bg-gray-200" />
                <div className="mt-4 flex justify-end">
                  <div className="h-8 w-20 animate-pulse rounded bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        ) : !error && docs.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 px-6 py-8 text-center">
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden="true">
              <ellipse cx="32" cy="32" rx="20" ry="12" stroke="#003087" strokeWidth="3" />
              <line x1="32" y1="20" x2="32" y2="44" stroke="#003087" strokeWidth="2" />
              <line x1="22" y1="28" x2="42" y2="28" stroke="#003087" strokeWidth="2" />
              <line x1="24" y1="32" x2="40" y2="32" stroke="#003087" strokeWidth="2" />
              <line x1="22" y1="36" x2="42" y2="36" stroke="#003087" strokeWidth="2" />
            </svg>
            <h2 className="text-xl font-bold text-[#003087]">No install sheets yet</h2>
            <p className="text-sm text-gray-500">Create your first install sheet to start building your playbook</p>
            <button onClick={() => createDoc('play_card')} className="rounded-lg bg-[#CC0000] px-6 py-3 text-lg font-bold text-white">
              + New Install Sheet
            </button>
          </div>
        ) : (
          <div className="grid gap-3 pr-1">
            {docs.map((d) => {
              const playName = d.layoutData?.playName?.trim() || '';
              const assignedPlayId = d.layoutData?.diagrams?.find((x) => x.playId)?.playId ?? null;
              const assignedPlayName = playName || (assignedPlayId ? playMap.get(assignedPlayId) || '' : '');
              const cardTitle = playName || 'Untitled Install Sheet';

              return (
                <div key={d.id} className="rounded border-2 border-[#003087] bg-white p-3">
                  <Link href={`/documents/${d.id}`} className="block">
                    <div className="text-lg font-black uppercase text-[#003087]">{cardTitle}</div>
                    <div className="text-sm font-bold uppercase text-[#CC0000]">{assignedPlayName ? `Play: ${assignedPlayName}` : 'Play: Not assigned'}</div>
                  </Link>
                  <div className="mt-3 flex justify-end">
                    <button
                      type="button"
                      onClick={() => void removeDoc(d.id)}
                      className="rounded border-2 border-red-700 px-3 py-1 text-xs font-black uppercase text-red-700 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
