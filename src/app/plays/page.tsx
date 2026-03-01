"use client";
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Play } from '@/lib/store';
import { PlaySVGRenderer } from '@/components/shared/PlaySVGRenderer';

const tags = ['red_zone', 'goal_line', '3rd_down', '2_minute', 'general'];

export default function PlaysPage() {
  const [plays, setPlays] = useState<Play[]>([]);
  const [folders, setFolders] = useState<{ id: string; name: string }[]>([]);
  const [q, setQ] = useState('');
  const [tag, setTag] = useState('');
  const [folderId, setFolderId] = useState('');

  const load = async () => {
    const res = await fetch('/api/plays');
    const data = await res.json();
    setPlays(data.data ?? []);

    const fr = await fetch('/api/folders');
    const fd = await fr.json();
    setFolders(fd.data ?? []);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(
    () => plays.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()) && (!tag || p.tags.includes(tag)) && (!folderId || p.folderId === folderId)),
    [plays, q, tag, folderId]
  );

  const createFolder = async () => {
    const input = window.prompt('Folder name', 'New Folder');
    const name = input?.trim();
    if (!name) return;

    const res = await fetch('/api/folders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });
    if (!res.ok) return;

    const payload = await res.json();
    const folder = payload?.data as { id: string; name: string } | undefined;
    if (!folder?.id) return;

    setFolders((prev) => {
      if (prev.some((f) => f.id === folder.id)) return prev;
      return [...prev, folder];
    });
  };

  return (
    <main className="app-screen mx-auto w-full max-w-7xl p-4 md:p-6">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold text-[#003087]">Play Library</h1>
        <div className="flex flex-wrap gap-2">
          <button onClick={createFolder} className="rounded border px-3 py-2">
            New Folder
          </button>
          <Link className="rounded border border-[#CC0000] px-3 py-2 font-semibold text-[#CC0000]" href="/documents/new">
            New Install Sheet
          </Link>
          <Link className="rounded bg-[#CC0000] px-3 py-2 text-white" href="/plays/new">
            New Play
          </Link>
        </div>
      </div>

      <div className="mb-3 grid gap-2 md:grid-cols-4">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search plays" className="rounded border px-3 py-2" />
        <select value={folderId} onChange={(e) => setFolderId(e.target.value)} className="rounded border px-3 py-2">
          <option value="">All folders</option>
          {folders.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </select>
        <div className="col-span-2 flex flex-wrap gap-2">
          {tags.map((t) => (
            <button key={t} onClick={() => setTag(tag === t ? '' : t)} className={`rounded px-2 py-1 text-sm ${tag === t ? 'bg-[#003087] text-white' : 'bg-slate-200'}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto pb-2">
        <div className="grid gap-4 pr-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((p) => (
            <div key={p.id} className="overflow-hidden rounded border bg-white">
              <div className="h-44 border-b">
                <PlaySVGRenderer elements={p.canvasData} className="h-full w-full" />
              </div>
              <div className="space-y-2 p-3">
                <div className="font-semibold">{p.name}</div>
                <div className="text-xs text-slate-500">{(p.tags || []).join(', ')}</div>
                <div className="flex gap-2">
                  <Link href={`/plays/${p.id}`} className="rounded bg-[#003087] px-2 py-1 text-xs text-white">
                    Edit
                  </Link>
                  <button
                    onClick={async () => {
                      await fetch(`/api/plays/${p.id}/duplicate`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mirror: false }) });
                      load();
                    }}
                    className="rounded border px-2 py-1 text-xs"
                  >
                    Duplicate
                  </button>
                  <button
                    onClick={async () => {
                      await fetch(`/api/plays/${p.id}`, { method: 'DELETE' });
                      load();
                    }}
                    className="rounded border px-2 py-1 text-xs"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

