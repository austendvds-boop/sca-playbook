"use client";

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PlaySVGRenderer } from '@/components/shared/PlaySVGRenderer';
import { SafeSvgPreview } from '@/components/shared/SafeSvgPreview';
import { Play } from '@/lib/store';

const tags = ['red_zone', 'goal_line', '3rd_down', '2_minute', 'general'];

type FolderOption = { id: string; name: string };

export function PlaysPageClient() {
  const [plays, setPlays] = useState<Play[]>([]);
  const [folders, setFolders] = useState<FolderOption[]>([]);
  const [q, setQ] = useState('');
  const [tag, setTag] = useState('');
  const [folderId, setFolderId] = useState('');
  const [folderMenuOpen, setFolderMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const folderMenuRef = useRef<HTMLDivElement | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const [playsRes, foldersRes] = await Promise.all([fetch('/api/plays'), fetch('/api/folders')]);
      if (!playsRes.ok || !foldersRes.ok) {
        throw new Error('Failed to fetch plays/folders');
      }

      const [playsData, foldersData] = await Promise.all([playsRes.json(), foldersRes.json()]);
      setPlays(Array.isArray(playsData?.data) ? playsData.data : []);
      setFolders(Array.isArray(foldersData?.data) ? foldersData.data : []);
    } catch (loadError) {
      console.error('Failed to load play library', loadError);
      setError('Unable to load play library right now.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (!folderMenuRef.current) return;
      if (!folderMenuRef.current.contains(event.target as Node)) setFolderMenuOpen(false);
    };

    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const filteredPlays = useMemo(() => {
    const query = q.trim().toLowerCase();

    return plays.filter((p) => {
      const matchesQuery = !query || p.name.toLowerCase().includes(query);
      const matchesTag = !tag || (p.tags ?? []).includes(tag);
      const matchesFolder = !folderId || p.folderId === folderId;

      return matchesQuery && matchesTag && matchesFolder;
    });
  }, [plays, q, tag, folderId]);

  const createFolder = async () => {
    const input = window.prompt('Folder name', 'New Folder');
    const name = input?.trim();
    if (!name) return;

    try {
      const res = await fetch('/api/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      if (!res.ok) throw new Error('Create folder failed');

      const payload = await res.json();
      const folder = payload?.data as FolderOption | undefined;
      if (!folder?.id) return;

      setFolders((prev) => (prev.some((f) => f.id === folder.id) ? prev : [...prev, folder]));
    } catch (createError) {
      console.error('Failed to create folder', createError);
      window.alert('Failed to create folder. Please try again.');
    }
  };

  return (
    <main className="app-screen mx-auto w-full max-w-7xl p-4 md:p-6">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold text-[#003087]">
          Play Library
          <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-sm text-gray-500">{filteredPlays.length} plays</span>
        </h1>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={createFolder} className="rounded border px-3 py-2" aria-label="Create new folder">
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
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search plays"
          aria-label="Search plays"
          className="rounded border px-3 py-2"
        />
        <div className="relative" ref={folderMenuRef}>
          <button
            type="button"
            onClick={() => setFolderMenuOpen((v) => !v)}
            className="min-w-[180px] rounded-full border border-[#003087]/20 bg-[#003087]/10 px-3 py-2 text-left text-sm font-semibold text-[#003087]"
            aria-haspopup="menu"
            aria-expanded={folderMenuOpen}
          >
            {folderId ? folders.find((f) => f.id === folderId)?.name ?? 'All folders' : 'All folders'}
          </button>
          {folderMenuOpen ? (
            <div className="absolute z-20 mt-1 w-full rounded-xl border border-[#003087]/15 bg-white p-1 shadow-lg" role="menu">
              <button
                type="button"
                onClick={() => {
                  setFolderId('');
                  setFolderMenuOpen(false);
                }}
                className="block w-full rounded-lg px-3 py-2 text-left text-sm text-[#003087] hover:bg-[#003087]/10"
              >
                All folders
              </button>
              {folders.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => {
                    setFolderId(f.id);
                    setFolderMenuOpen(false);
                  }}
                  className="block w-full rounded-lg px-3 py-2 text-left text-sm text-[#003087] hover:bg-[#003087]/10"
                >
                  {f.name}
                </button>
              ))}
            </div>
          ) : null}
        </div>
        <div className="col-span-2 flex flex-wrap gap-2">
          {tags.map((t) => (
            <button key={t} type="button" onClick={() => setTag(tag === t ? '' : t)} className={`rounded-full px-2 py-1 text-sm ${tag === t ? 'bg-[#003087] text-white' : 'bg-[#003087]/10 text-[#003087]'}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {error ? <p className="mb-2 text-sm font-semibold text-red-700">{error}</p> : null}

      <div className="min-h-0 flex-1 overflow-auto pb-2">
        <div className="grid gap-4 pr-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {loading
            ? Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="overflow-hidden rounded border bg-white">
                  <div className="h-44 animate-pulse border-b bg-gray-200" />
                  <div className="space-y-2 p-3">
                    <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200" />
                    <div className="flex flex-wrap gap-1">
                      <div className="h-5 w-16 animate-pulse rounded-full bg-gray-200" />
                      <div className="h-5 w-20 animate-pulse rounded-full bg-gray-200" />
                    </div>
                    <div className="flex gap-2 pt-1">
                      <div className="h-7 w-12 animate-pulse rounded bg-gray-200" />
                      <div className="h-7 w-16 animate-pulse rounded bg-gray-200" />
                      <div className="h-7 w-14 animate-pulse rounded bg-gray-200" />
                    </div>
                  </div>
                </div>
              ))
            : null}
          {!loading && !error && filteredPlays.length === 0 ? (
            <div className="col-span-3 py-20 text-center text-gray-400">
              <p className="text-lg font-semibold">No plays found</p>
              <p className="mt-1 text-sm">Try adjusting your search or filters</p>
            </div>
          ) : null}
          {!loading && filteredPlays.map((p) => (
            <div key={p.id} className="overflow-hidden rounded border bg-white">
              <div className="h-44 border-b">
                {Array.isArray(p.canvasData) && p.canvasData.length > 0 ? (
                  <PlaySVGRenderer elements={p.canvasData} className="h-full w-full" viewBox="0 260 1000 200" />
                ) : p.thumbnailSvg?.trim().startsWith('<svg') ? (
                  <SafeSvgPreview svg={p.thumbnailSvg} alt={`${p.name} thumbnail`} className="h-full w-full" />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs font-semibold uppercase text-gray-400">No Thumbnail</div>
                )}
              </div>
              <div className="space-y-2 p-3">
                <div className="font-semibold">{p.name}</div>
                <div className="flex flex-wrap gap-1">
                  {(p.tags || []).map((tagName) => (
                    <span key={tagName} className="inline-block rounded-full bg-[#003087]/10 px-2 py-0.5 text-xs font-semibold text-[#003087]">
                      {tagName}
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Link href={`/plays/${p.id}`} className="rounded bg-[#003087] px-2 py-1 text-xs text-white">
                    Edit
                  </Link>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        const response = await fetch(`/api/plays/${p.id}/duplicate`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ mirror: false })
                        });
                        if (!response.ok) throw new Error('Duplicate failed');
                        await load();
                      } catch (duplicateError) {
                        console.error('Duplicate failed', duplicateError);
                        window.alert('Failed to duplicate play. Please try again.');
                      }
                    }}
                    className="rounded border px-2 py-1 text-xs"
                  >
                    Duplicate
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        const response = await fetch(`/api/plays/${p.id}`, { method: 'DELETE' });
                        if (!response.ok) throw new Error('Delete failed');
                        await load();
                      } catch (deleteError) {
                        console.error('Delete failed', deleteError);
                        window.alert('Failed to delete play. Please try again.');
                      }
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
