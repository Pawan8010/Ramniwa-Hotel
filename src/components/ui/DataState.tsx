import React from 'react';
import { AlertCircle, Inbox, RefreshCw } from 'lucide-react';
import { Button } from './Button';

export function LoadingSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Loading content">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-14 w-full rounded-xl bg-surface-muted/80 animate-pulse border border-border-subtle"
        />
      ))}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="rounded-xl border border-border-subtle bg-surface-raised p-8 text-center">
      <div className="mx-auto w-12 h-12 rounded-full bg-surface-muted flex items-center justify-center mb-3">
        <Inbox className="w-6 h-6 text-text-secondary" aria-hidden="true" />
      </div>
      <h3 className="font-display text-lg font-semibold text-text-primary">{title}</h3>
      <p className="text-sm text-text-secondary mt-1 max-w-md mx-auto">{description}</p>
      {actionLabel && onAction && (
        <div className="mt-4">
          <Button variant="secondary" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}

export function ErrorState({
  title = 'Unable to load this section',
  description = 'Please check your connection or try reloading this view.',
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry: () => void;
}) {
  return (
    <div
      role="alert"
      className="rounded-xl border border-status-error/40 bg-surface-raised p-8 text-center"
    >
      <div className="mx-auto w-12 h-12 rounded-full bg-status-error/10 flex items-center justify-center mb-3">
        <AlertCircle className="w-6 h-6 text-status-error" aria-hidden="true" />
      </div>
      <h3 className="font-display text-lg font-semibold text-text-primary">{title}</h3>
      <p className="text-sm text-text-secondary mt-1 max-w-md mx-auto">{description}</p>
      <div className="mt-4">
        <Button variant="primary" size="sm" onClick={onRetry}>
          <RefreshCw className="w-4 h-4" aria-hidden="true" />
          Try Again
        </Button>
      </div>
    </div>
  );
}
