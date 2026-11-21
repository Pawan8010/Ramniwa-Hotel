import React from 'react';
import { Loader2 } from 'lucide-react';

export type ButtonVariant = 'primary' | 'accent' | 'secondary' | 'ghost' | 'icon';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  hasError?: boolean;
  children: React.ReactNode;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    'bg-action-primary text-text-inverse font-semibold hover:bg-action-primary-hover active:scale-[0.98] shadow-[0_0_24px_rgba(0,163,255,0.22)] border border-transparent',
  accent:
    'bg-action-accent text-text-inverse font-semibold hover:bg-action-accent-hover active:scale-[0.98] shadow-card border border-transparent',
  secondary:
    'bg-surface-raised text-text-primary border border-border-strong hover:bg-surface-muted hover:border-action-primary/50 active:scale-[0.98]',
  ghost:
    'bg-transparent text-text-primary hover:bg-surface-muted/80 border border-transparent active:scale-[0.98]',
  icon:
    'bg-surface-raised text-text-primary border border-border-subtle hover:bg-surface-muted hover:border-action-primary/50 active:scale-[0.96] p-0 justify-center',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'min-h-[40px] px-3.5 py-1.5 text-sm',
  md: 'min-h-[44px] px-5 py-2.5 text-sm',
  lg: 'min-h-[48px] px-6 py-3 text-base',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      hasError = false,
      disabled,
      className = '',
      children,
      onClick,
      type = 'button',
      ...rest
    },
    ref
  ) => {
    const isDisabled = Boolean(disabled || loading);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (isDisabled) {
        e.preventDefault();
        return;
      }
      onClick?.(e);
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        onClick={handleClick}
        className={[
          'inline-flex items-center justify-center gap-2 rounded-lg font-medium whitespace-nowrap shrink-0',
          'transition-all duration-200 cursor-pointer select-none',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
          variant === 'icon' ? 'min-w-[44px] min-h-[44px] w-11 h-11' : SIZE_CLASSES[size],
          VARIANT_CLASSES[variant],
          hasError ? 'ring-2 ring-status-error border-status-error' : '',
          className,
        ].join(' ')}
        {...rest}
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin shrink-0" aria-hidden="true" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
