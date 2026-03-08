"use client";

import { use, useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CanvasToolbar } from '@/components/canvas/CanvasToolbar';
import { FieldSVG } from '@/components/canvas/FieldSVG';
import { SaveStatus, useCanvasEditor } from '@/hooks/useCanvasEditor';
import { CanvasElement } from '@/lib/store';

const TAG_OPTIONS = ['red_zone', 'goal_line', '3rd_down', '2_minute', 'general'];

function SaveStatusIndicator({ status }: { status: SaveStatus }) {
  if (status === 'idle') return null;

  if (status === 'saving') return <span className="text-xs text-slate-300">Saving...</span>;
  if (status === 'saved') return <span className="text-xs text-emerald-300">✓ Saved</span>;
  return <span className="text-xs text-red-300">Save failed</span>;
}

export default function PlayEdit({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [name, setName] = useState('Play');
  const [tags, setTags] = useState<string[]>(['general']);
  const [tagPickerOpen, setTagPickerOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [initialCanvasData, setInitialCanvasData] = useState<CanvasElement[] | undefined>(undefined);
  const router = useRouter();

  const savePlay = useCallback(
    async ({ canvasData, thumbnailSvg }: { canvasData: CanvasElement[]; thumbnailSvg: string }) => {
      const response = await fetch(`/api/plays/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, tags, canvasData, thumbnailSvg })
      });

      if (!response.ok) throw new Error('Save failed');
    },
    [id, name, tags]
  );

  const {
    elements,
    saveStatus,
    canUndo,
    canRedo,
    offensePresetNames,
    defensePresetNames,
    applyCanvasChange,
    setSelected,
    requestSaveNow,
    insertPlayer,
    insertOLGroup,
    applyPreset,
    handleUndo,
    handleRedo,
    deleteSelected
  } = useCanvasEditor({ playId: id, initialCanvasData, onSave: savePlay });

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoadError('');
        const response = await fetch(`/api/plays/${id}`);
        if (!response.ok) throw new Error('Failed to load play');

        const payload = await response.json();
        if (cancelled) return;

        setName(payload.data?.name ?? 'Play');
        setTags(Array.isArray(payload.data?.tags) && payload.data.tags.length ? payload.data.tags : ['general']);
        setInitialCanvasData(Array.isArray(payload.data?.canvasData) ? payload.data.canvasData : []);
      } catch (error) {
        console.error('Failed to load play', error);
        if (!cancelled) {
          setLoadError('Failed to load play.');
          setInitialCanvasData([]);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const renamePlay = async (nextName: string) => {
    setName(nextName);

    try {
      const response = await fetch(`/api/plays/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: nextName })
      });
      if (!response.ok) throw new Error('Rename failed');
    } catch (error) {
      console.error('Rename failed', error);
      window.alert('Failed to rename play.');
    }
  };

  const toggleTag = async (tag: string) => {
    const next = tags.includes(tag) ? tags.filter((t) => t !== tag) : [...tags, tag];
    const normalized = next.length ? next : ['general'];
    setTags(normalized);

    try {
      const response = await fetch(`/api/plays/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tags: normalized })
      });
      if (!response.ok) throw new Error('Toggle tag failed');
    } catch (error) {
      console.error('Tag update failed', error);
      window.alert('Failed to update tags.');
    }
  };

  const exportPng = async () => {
    const svg = document.querySelector('svg');
    if (!svg) return;

    const raw = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([raw], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();

    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = 1600;
      c.height = 900;
      const ctx = c.getContext('2d');
      if (!ctx) return;
      ctx.fillStyle = '#111124';
      ctx.fillRect(0, 0, c.width, c.height);
      ctx.drawImage(img, 0, 0, c.width, c.height);
      c.toBlob((b) => {
        if (!b) return;
        const durl = URL.createObjectURL(b);
        const a = document.createElement('a');
        a.href = durl;
        a.download = `${name.toLowerCase().replace(/\s+/g, '-') || 'play'}.png`;
        a.click();
        URL.revokeObjectURL(durl);
      }, 'image/png');
      URL.revokeObjectURL(url);
    };

    img.src = url;
  };

  const mirror = async () => {
    const next = new Map<string, CanvasElement>();
    elements.forEach((e) => {
      if (e.type === 'player') next.set(e.id, { ...e, x: 1000 - e.x });
      else if (e.type === 'text') next.set(e.id, { ...e, x: 1000 - e.x });
      else if (e.type === 'zone') next.set(e.id, { ...e, cx: 1000 - e.cx });
      else next.set(e.id, { ...e, points: e.points.map((p) => ({ x: 1000 - p.x, y: p.y })) });
    });

    applyCanvasChange(() => next);

    try {
      await requestSaveNow([...next.values()]);
    } catch (error) {
      console.error('Mirror save failed', error);
      window.alert('Failed to save mirrored play.');
    }
  };

  const clearCanvas = () => {
    if (!window.confirm('Clear all players and routes?')) return;
    applyCanvasChange(() => new Map());
    setSelected(new Set());
  };

  const removePlay = async () => {
    const confirmed = window.confirm('Delete this play? This cannot be undone.');
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/plays/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Delete failed');
      router.push('/plays');
    } catch (error) {
      console.error('Delete failed', error);
      window.alert('Failed to delete play. Please try again.');
    }
  };

  return (
    <main className="w-screen overflow-hidden bg-[#111124] text-white" style={{ height: '100dvh' }}>
      <div className="flex h-dvh w-screen flex-col overflow-hidden">
        <CanvasToolbar
          name={name}
          onNameChange={(next) => void renamePlay(next)}
          onBack={() => router.push('/plays')}
          onSave={() => void requestSaveNow().catch(() => window.alert('Failed to save play. Please try again.'))}
          moreMenuOpen={moreMenuOpen}
          onToggleMoreMenu={() => setMoreMenuOpen((v) => !v)}
          moreMenu={(
            <div className="w-44 overflow-visible rounded-md border border-white/10 bg-[#111125] shadow-xl">
              <button onClick={() => { void mirror(); setMoreMenuOpen(false); }} className="block w-full px-3 py-2 text-left text-sm text-white hover:bg-white/10">Mirror Play</button>
              <button onClick={() => { void exportPng(); setMoreMenuOpen(false); }} className="block w-full px-3 py-2 text-left text-sm text-white hover:bg-white/10">Export PNG</button>
              <button onClick={() => { clearCanvas(); setMoreMenuOpen(false); }} className="block w-full px-3 py-2 text-left text-sm text-white hover:bg-white/10">Clear Canvas</button>
              <button onClick={() => { void removePlay(); setMoreMenuOpen(false); }} className="block w-full px-3 py-2 text-left text-sm text-red-300 hover:bg-red-500/20">Delete Play</button>
            </div>
          )}
          onInsertPlayer={insertPlayer}
          onInsertOLGroup={insertOLGroup}
          onApplyPreset={applyPreset}
          offensePresetNames={offensePresetNames}
          defensePresetNames={defensePresetNames}
          onDeleteSelected={deleteSelected}
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={canUndo}
          canRedo={canRedo}
          tags={tags}
          onToggleTag={(t) => void toggleTag(t)}
          onToggleTagPicker={() => setTagPickerOpen((v) => !v)}
          tagPickerOpen={tagPickerOpen}
          tagOptions={TAG_OPTIONS}
        />

        {loadError ? <p className="px-3 py-1 text-sm font-semibold text-red-300">{loadError}</p> : null}

        <div className="flex items-center justify-end px-3 py-1">
          <SaveStatusIndicator status={saveStatus} />
        </div>

        <div className="min-h-0 w-full" style={{ height: 'calc(100vh - 132px)' }}>
          <FieldSVG onSave={() => void requestSaveNow().catch(() => window.alert('Failed to save play. Please try again.'))} />
        </div>
      </div>
    </main>
  );
}
