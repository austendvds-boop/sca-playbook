"use client";

import { useCallback, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CanvasToolbar } from '@/components/canvas/CanvasToolbar';
import { FieldSVG } from '@/components/canvas/FieldSVG';
import { SaveStatus, useCanvasEditor } from '@/hooks/useCanvasEditor';
import { CanvasElement } from '@/lib/store';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';

function SaveStatusIndicator({ status }: { status: SaveStatus }) {
  if (status === 'idle') return null;

  if (status === 'saving') return <span className="text-xs text-slate-300">Saving...</span>;
  if (status === 'saved') return <span className="text-xs text-emerald-300">✓ Saved</span>;
  return <span className="text-xs text-red-300">Save failed</span>;
}

export default function NewPlay() {
  const [name, setName] = useState('New Play');
  const router = useRouter();
  const createdPlayIdRef = useRef<string | null>(null);
  const savingRef = useRef<Promise<void> | null>(null);

  const saveNewPlay = useCallback(
    async ({ canvasData, thumbnailSvg }: { canvasData: CanvasElement[]; thumbnailSvg: string }) => {
      if (savingRef.current) {
        await savingRef.current;
        return;
      }

      const run = async () => {
        if (createdPlayIdRef.current) {
          const updateResponse = await fetch(`/api/plays/${createdPlayIdRef.current}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, tags: ['general'], canvasData, thumbnailSvg })
          });
          if (!updateResponse.ok) throw new Error('Save failed');
          return;
        }

        const createResponse = await fetch('/api/plays', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, canvasData, tags: ['general'], thumbnailSvg })
        });

        if (!createResponse.ok) throw new Error('Save failed');

        const payload = await createResponse.json();
        if (!payload?.data?.id) throw new Error('Save failed');

        createdPlayIdRef.current = payload.data.id;
        router.push(`/plays/${payload.data.id}`);
      };

      savingRef.current = run();
      try {
        await savingRef.current;
      } finally {
        savingRef.current = null;
      }
    },
    [name, router]
  );

  const {
    saveStatus,
    canUndo,
    canRedo,
    offensePresetNames,
    defensePresetNames,
    requestSaveNow,
    insertPlayer,
    insertOLGroup,
    applyPreset,
    handleUndo,
    handleRedo,
    deleteSelected
  } = useCanvasEditor({
    playId: 'new',
    initialCanvasData: [],
    onSave: saveNewPlay
  });

  return (
    <ErrorBoundary>
      <main className="w-screen overflow-hidden bg-[#111124] text-white" style={{ height: '100dvh' }}>
      <div className="flex h-dvh w-screen flex-col overflow-hidden">
        <CanvasToolbar
          playId="new"
          name={name}
          onNameChange={setName}
          onBack={() => router.push('/plays')}
          onSave={() => void requestSaveNow().catch(() => window.alert('Failed to save play. Please try again.'))}
          moreMenuOpen={false}
          onToggleMoreMenu={() => undefined}
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
        />

        <div className="flex items-center justify-end px-3 py-1">
          <SaveStatusIndicator status={saveStatus} />
        </div>

        <div className="min-h-0 w-full" style={{ height: 'calc(100vh - 132px)' }}>
          <FieldSVG
            playId="new"
            playTitle={name}
            onSave={() => void requestSaveNow().catch(() => window.alert('Failed to save play. Please try again.'))}
          />
        </div>
      </div>
    </main>
    </ErrorBoundary>
  );
}
