"use client";
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Play } from '@/lib/store';
import { PlaySVGRenderer } from '@/components/shared/PlaySVGRenderer';

const tags = ['red_zone', 'goal_line', '3rd_down', '2_minute', 'general'];

export default function PlaysPage() {
  const [plays, setPlays] = useState<Play[]>([]);
  const [folders, setFolders] = useState<{ id: string; name: string }[]>([]);
  const [q, setQ] = useState('');
  const [tag, setTag] = useState('');
  const [folderId, setFolderId] = useState('');
  const [folderMenuOpen, setFolderMenuOpen] = useState(false);
  const folderMenuRef = useRef<HTMLDivElement | null>(null);

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

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (!folderMenuRef.current) return;
      if (!folderMenuRef.current.contains(event.target as Node)) setFolderMenuOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const filteredPlays = useMemo(
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

    setFolders((prev) => (prev.some((f) => f.id === folder.id) ? prev : [...prev, folder]));
  };

  return (
    <main className="app-screen mx-auto w-full max-w-7xl p-4 md:p-6">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold text-[#003087]">
          Play Library
          <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-sm text-gray-500">{filteredPlays.length} plays</span>
        </h1>
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
        <div className="relative" ref={folderMenuRef}>
          <button type="button" onClick={() => setFolderMenuOpen((v) => !v)} className="min-w-[180px] rounded-full border border-[#003087]/20 bg-[#003087]/10 px-3 py-2 text-left text-sm font-semibold text-[#003087]">
            {folderId ? folders.find((f) => f.id === folderId)?.name ?? 'All folders' : 'All folders'}
          </button>
          {folderMenuOpen ? (
            <div className="absolute z-20 mt-1 w-full rounded-xl border border-[#003087]/15 bg-white p-1 shadow-lg">
              <button type="button" onClick={() => { setFolderId(''); setFolderMenuOpen(false); }} className="block w-full rounded-lg px-3 py-2 text-left text-sm text-[#003087] hover:bg-[#003087]/10">All folders</button>
              {folders.map((f) => (
                <button key={f.id} type="button" onClick={() => { setFolderId(f.id); setFolderMenuOpen(false); }} className="block w-full rounded-lg px-3 py-2 text-left text-sm text-[#003087] hover:bg-[#003087]/10">
                  {f.name}
                </button>
              ))}
            </div>
          ) : null}
        </div>
        <div className="col-span-2 flex flex-wrap gap-2">
          {tags.map((t) => (
            <button key={t} onClick={() => setTag(tag === t ? '' : t)} className={`rounded-full px-2 py-1 text-sm ${tag === t ? 'bg-[#003087] text-white' : 'bg-[#003087]/10 text-[#003087]'}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto pb-2">
        <div className="grid gap-4 pr-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredPlays.length === 0 ? (
            <div className="col-span-3 py-20 text-center text-gray-400">
              <p className="text-lg">No plays found</p>
              <p className="mt-1 text-sm">Try adjusting your search or filters</p>
            </div>
          ) : null}
          {filteredPlays.map((p) => (
            <div key={p.id} className="overflow-hidden rounded border bg-white">
              <div className="h-44 border-b">
                <PlaySVGRenderer elements={p.canvasData} className="h-full w-full" viewBox="0 260 1000 200" />
              </div>
              <div className="space-y-2 p-3">
                <div className="font-semibold">{p.name}</div>
                <div className="flex flex-wrap gap-1">
                  {(p.tags || []).map((tagName) => (
                    <span key={tagName} className="inline-block rounded-full bg-[#003087]/10 px-2 py-0.5 text-xs font-semibold text-[#003087]">{tagName}</span>
                  ))}
                </div>
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
