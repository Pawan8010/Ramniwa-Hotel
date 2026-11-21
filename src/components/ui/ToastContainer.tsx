import React from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';
import { useToast, type ToastTone } from '../../hooks/useToast';

const TONE_ICON: Record<ToastTone, React.ReactNode> = {
  success: <CheckCircle2 className="w-5 h-5 text-status-success shrink-0" aria-hidden="true" />,
  error: <AlertCircle className="w-5 h-5 text-status-error shrink-0" aria-hidden="true" />,
  warning: <AlertTriangle className="w-5 h-5 text-status-warning shrink-0" aria-hidden="true" />,
  info: <Info className="w-5 h-5 text-status-info shrink-0" aria-hidden="true" />,
};

export function ToastContainer() {
  const { toasts, dismissToast, pauseToast, resumeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-label="Notifications"
      className="fixed bottom-20 md:bottom-6 inset-x-3 sm:inset-x-auto sm:right-4 z-50 flex flex-col gap-2.5 sm:w-full sm:max-w-sm pointer-events-none"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="status"
          aria-live="polite"
          onMouseEnter={() => pauseToast(toast.id)}
          onMouseLeave={() => resumeToast(toast.id)}
          onFocus={() => pauseToast(toast.id)}
          onBlur={() => resumeToast(toast.id)}
          className="pointer-events-auto flex items-start gap-3 p-4 rounded-xl bg-surface-raised border border-border-subtle shadow-modal text-text-primary"
        >
          {TONE_ICON[toast.tone]}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-text-primary">{toast.title}</p>
            {toast.description && (
              <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">
                {toast.description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => dismissToast(toast.id)}
            aria-label="Dismiss notification"
            className="min-w-[36px] min-h-[36px] -mr-1 -mt-1 flex items-center justify-center rounded-md text-text-secondary hover:bg-surface-muted cursor-pointer"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      ))}
    </div>
  );
}
