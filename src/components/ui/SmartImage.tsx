import React, { useState } from 'react';
import { getAssetBySlot } from '../../data/assets';
import type { AssetItem, AssetSlotKey } from '../../types/hotel';

interface SmartImageProps {
  slot?: AssetSlotKey;
  asset?: AssetItem;
  fallbackTitle?: string;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
  decorative?: boolean;
}

export function SmartImage({
  slot,
  asset: passedAsset,
  fallbackTitle,
  className = '',
  imgClassName = '',
  priority = false,
  decorative = false,
}: SmartImageProps) {
  const item = passedAsset ?? (slot ? getAssetBySlot(slot) : getAssetBySlot('hero-poster'));
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  const showPlaceholder = !item.src || failed;

  return (
    <div
      className={`relative overflow-hidden bg-surface-muted ${className}`}
      style={{
        background: showPlaceholder
          ? 'radial-gradient(circle at 20% 20%, rgba(0, 163, 255, 0.28), transparent 55%), linear-gradient(135deg, var(--color-surface-raised) 0%, var(--color-surface-strong) 100%)'
          : undefined,
      }}
    >
      {showPlaceholder ? (
        <div
          className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-text-primary select-none"
          role={decorative ? undefined : 'img'}
          aria-label={decorative ? undefined : item.alt}
        >
          <span
            className="w-10 h-10 rounded-full border border-action-primary/60 bg-action-primary/10 flex items-center justify-center font-display text-lg font-semibold text-action-primary mb-3"
            aria-hidden="true"
          >
            R
          </span>
          <p className="font-display text-lg font-semibold tracking-tight text-text-primary">
            {fallbackTitle || item.label}
          </p>
          <p className="text-xs text-text-secondary mt-1 max-w-xs">
            Hotel Ramniwas · Est. 1975 · Jalgaon
          </p>
        </div>
      ) : (
        <>
          {!loaded && (
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-surface-muted animate-pulse backdrop-blur-sm"
            />
          )}
          <img
            src={item.src}
            alt={decorative ? '' : item.alt}
            width={item.width}
            height={item.height}
            loading={priority ? 'eager' : 'lazy'}
            decoding={priority ? 'sync' : 'async'}
            referrerPolicy="no-referrer"
            onLoad={() => setLoaded(true)}
            onError={() => setFailed(true)}
            style={{ objectPosition: item.focalPoint || '50% 50%' }}
            className={[
              'w-full h-full object-cover transition-opacity duration-300',
              loaded ? 'opacity-100' : 'opacity-0',
              imgClassName,
            ].join(' ')}
          />
        </>
      )}
    </div>
  );
}
