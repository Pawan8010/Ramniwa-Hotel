import React, { useId } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface BaseFieldProps {
  label: string;
  error?: string;
  successMessage?: string;
  helperText?: string;
  required?: boolean;
  className?: string;
}

type InputFieldProps = BaseFieldProps &
  Omit<React.InputHTMLAttributes<HTMLInputElement>, 'className'>;

export function InputField({
  label,
  error,
  successMessage,
  helperText,
  required,
  className = '',
  id,
  ...rest
}: InputFieldProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const descId = `${inputId}-desc`;
  const hasError = Boolean(error);
  const hasSuccess = Boolean(successMessage && !hasError);

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label
        htmlFor={inputId}
        className="text-sm font-medium text-text-primary flex items-center gap-1"
      >
        <span>{label}</span>
        {required && (
          <span className="text-status-error" aria-hidden="true">
            *
          </span>
        )}
      </label>
      <input
        id={inputId}
        required={required}
        aria-invalid={hasError || undefined}
        aria-describedby={error || successMessage || helperText ? descId : undefined}
        className={[
          'min-h-[44px] w-full rounded-lg bg-surface-raised px-3.5 py-2.5 text-base text-text-primary',
          'border transition-colors duration-150 placeholder:text-text-secondary/60',
          'disabled:bg-surface-muted/60 disabled:opacity-60 disabled:cursor-not-allowed',
          hasError
            ? 'border-status-error ring-1 ring-status-error'
            : hasSuccess
              ? 'border-status-success'
              : 'border-border-subtle hover:border-text-secondary/50',
        ].join(' ')}
        {...rest}
      />
      {(error || successMessage || helperText) && (
        <div id={descId} className="text-xs flex items-center gap-1.5">
          {hasError ? (
            <span className="text-status-error flex items-center gap-1" role="alert">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>{error}</span>
            </span>
          ) : hasSuccess ? (
            <span className="text-status-success flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>{successMessage}</span>
            </span>
          ) : (
            <span className="text-text-secondary">{helperText}</span>
          )}
        </div>
      )}
    </div>
  );
}

type SelectFieldProps = BaseFieldProps &
  Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'className'> & {
    children: React.ReactNode;
  };

export function SelectField({
  label,
  error,
  helperText,
  required,
  className = '',
  id,
  children,
  ...rest
}: SelectFieldProps) {
  const autoId = useId();
  const selectId = id ?? autoId;
  const descId = `${selectId}-desc`;
  const hasError = Boolean(error);

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label
        htmlFor={selectId}
        className="text-sm font-medium text-text-primary flex items-center gap-1"
      >
        <span>{label}</span>
        {required && (
          <span className="text-status-error" aria-hidden="true">
            *
          </span>
        )}
      </label>
      <select
        id={selectId}
        required={required}
        aria-invalid={hasError || undefined}
        aria-describedby={error || helperText ? descId : undefined}
        className={[
          'min-h-[44px] w-full rounded-lg bg-surface-raised px-3.5 py-2.5 text-base text-text-primary',
          'border transition-colors duration-150',
          'disabled:bg-surface-muted/60 disabled:opacity-60 disabled:cursor-not-allowed',
          hasError
            ? 'border-status-error ring-1 ring-status-error'
            : 'border-border-subtle hover:border-text-secondary/50',
        ].join(' ')}
        {...rest}
      >
        {children}
      </select>
      {(error || helperText) && (
        <div id={descId} className="text-xs">
          {hasError ? (
            <span className="text-status-error flex items-center gap-1" role="alert">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>{error}</span>
            </span>
          ) : (
            <span className="text-text-secondary">{helperText}</span>
          )}
        </div>
      )}
    </div>
  );
}

type TextareaFieldProps = BaseFieldProps &
  Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'>;

export function TextareaField({
  label,
  error,
  helperText,
  required,
  className = '',
  id,
  ...rest
}: TextareaFieldProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const descId = `${fieldId}-desc`;
  const hasError = Boolean(error);

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label
        htmlFor={fieldId}
        className="text-sm font-medium text-text-primary flex items-center gap-1"
      >
        <span>{label}</span>
        {required && (
          <span className="text-status-error" aria-hidden="true">
            *
          </span>
        )}
      </label>
      <textarea
        id={fieldId}
        required={required}
        aria-invalid={hasError || undefined}
        aria-describedby={error || helperText ? descId : undefined}
        className={[
          'min-h-[96px] w-full rounded-lg bg-surface-raised px-3.5 py-2.5 text-base text-text-primary',
          'border transition-colors duration-150 placeholder:text-text-secondary/60',
          'disabled:bg-surface-muted/60 disabled:opacity-60 disabled:cursor-not-allowed',
          hasError
            ? 'border-status-error ring-1 ring-status-error'
            : 'border-border-subtle hover:border-text-secondary/50',
        ].join(' ')}
        {...rest}
      />
      {(error || helperText) && (
        <div id={descId} className="text-xs">
          {hasError ? (
            <span className="text-status-error flex items-center gap-1" role="alert">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>{error}</span>
            </span>
          ) : (
            <span className="text-text-secondary">{helperText}</span>
          )}
        </div>
      )}
    </div>
  );
}
