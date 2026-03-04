"use client";

import { useMemo } from 'react';

type SafeSvgPreviewProps = {
  svg: string;
  alt: string;
  className?: string;
};

export function SafeSvgPreview({ svg, alt, className }: SafeSvgPreviewProps) {
  const trimmed = svg.trim();
  const isSvg = trimmed.startsWith('<svg');

  const src = useMemo(() => {
    if (!isSvg) return '';
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(trimmed)}`;
  }, [isSvg, trimmed]);

  if (!isSvg) return null;

  return <img src={src} alt={alt} className={className} loading="lazy" draggable={false} />;
}
