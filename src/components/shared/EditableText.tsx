"use client";
import { useEffect, useRef, useState } from 'react';

export function EditableText({
  value,
  onSave,
  className,
  multiline,
  placeholder,
  placeholderClassName
}: {
  value: string;
  onSave: (v: string) => void;
  className?: string;
  multiline?: boolean;
  placeholder?: string;
  placeholderClassName?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => setDraft(value), [value]);
  useEffect(() => {
    if (editing && ref.current) {
      ref.current.focus();
      const sel = window.getSelection();
      if (sel) {
        const range = document.createRange();
        range.selectNodeContents(ref.current);
        range.collapse(false);
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }
  }, [editing]);

  if (!editing) {
    return (
      <div
        className={className}
        onClick={() => setEditing(true)}
        role='button'
        tabIndex={0}
        aria-label={placeholder || 'Editable text'}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setEditing(true);
          }
        }}
      >
        {value ? value : <span className={placeholderClassName}>{placeholder || ' '}</span>}
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={className}
      contentEditable
      suppressContentEditableWarning
      onInput={(e) => setDraft(e.currentTarget.textContent ?? '')}
      onBlur={() => {
        setEditing(false);
        onSave(draft);
      }}
      onKeyDown={(e) => {
        if (!multiline && e.key === 'Enter') {
          e.preventDefault();
          setEditing(false);
          onSave(draft);
        }
        if (e.key === 'Escape') {
          e.preventDefault();
          setEditing(false);
          setDraft(value);
        }
      }}
    >
      {draft}
    </div>
  );
}
