import React, { useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import type { AssetItem } from '../../types/hotel';
import { SmartImage } from './SmartImage';

interface LightboxProps {
  items: AssetItem[];
  activeIndex: number | null;
  onClose: () => void;
  onChangeIndex: (idx: number) => void;
}

export function Lightbox({ items, activeIndex, onClose, onChangeIndex }: LightboxProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const isOpen = activeIndex !== null && items[activeIndex] !== undefined;

  useFocusTrap(isOpen, onClose, containerRef);

  useEffect(() => {
    if (!isOpen || activeIndex === null) return;
    const handleKeys = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        onChangeIndex((activeIndex + 1) % items.length);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        onChangeIndex((activeIndex - 1 + items.length) % items.length);
      }
    };
    window.addEventListener('keydown', handleKeys);
    return () => window.removeEventListener('keydown', handleKeys);
  }, [isOpen, activeIndex, items.length, onChangeIndex]);

  if (!isOpen || activeIndex === null) return null;
  const current = items[activeIndex];

  return (
    <div
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-label={`Photo lightbox: ${current.label}`}
      tabIndex={-1}
      className="fixed inset-0 z-50 bg-surface-base/95 backdrop-blur-md text-text-primary flex flex-col justify-between p-4 md:p-8"
      onTouchStart={(e) => {
        touchStartX.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        if (touchStartX.current === null) return;
        const delta = e.changedTouches[0].clientX - touchStartX.current;
        if (delta > 50) onChangeIndex((activeIndex - 1 + items.length) % items.length);
        else if (delta < -50) onChangeIndex((activeIndex + 1) % items.length);
        touchStartX.current = null;
      }}
    >
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-medium text-text-primary tabular-nums">
          {activeIndex + 1} / {items.length} — {current.label}
        </p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close photo lightbox"
          className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg bg-surface-raised border border-border-subtle hover:bg-surface-muted text-text-primary cursor-pointer"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>
      </div>

      <div className="flex items-center justify-center gap-4 my-4 flex-1 min-h-0">
        <button
          type="button"
          onClick={() => onChangeIndex((activeIndex - 1 + items.length) % items.length)}
          aria-label="Previous photo"
          className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-surface-raised border border-border-subtle hover:bg-surface-muted text-text-primary cursor-pointer shrink-0"
        >
          <ChevronLeft className="w-6 h-6" aria-hidden="true" />
        </button>

        <div className="relative w-full max-w-4xl h-full max-h-[70vh] rounded-xl overflow-hidden border border-border-strong bg-surface-raised">
          <SmartImage asset={current} className="w-full h-full" imgClassName="object-contain bg-surface-base" priority />
        </div>

        <button
          type="button"
          onClick={() => onChangeIndex((activeIndex + 1) % items.length)}
          aria-label="Next photo"
          className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-surface-raised border border-border-subtle hover:bg-surface-muted text-text-primary cursor-pointer shrink-0"
        >
          <ChevronRight className="w-6 h-6" aria-hidden="true" />
        </button>
      </div>

      <p className="text-center text-sm text-text-secondary max-w-2xl mx-auto">{current.alt}</p>
    </div>
  );
}
