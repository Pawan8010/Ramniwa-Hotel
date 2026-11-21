import React, { useRef } from 'react';

export interface TabOption<T extends string> {
  value: T;
  label: string;
  count?: number;
}

interface TabsProps<T extends string> {
  options: TabOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
}

export function Tabs<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
}: TabsProps<T>) {
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);

  const handleKeyDown = (e: React.KeyboardEvent, idx: number) => {
    let nextIdx = idx;
    if (e.key === 'ArrowRight') {
      nextIdx = (idx + 1) % options.length;
    } else if (e.key === 'ArrowLeft') {
      nextIdx = (idx - 1 + options.length) % options.length;
    } else if (e.key === 'Home') {
      nextIdx = 0;
    } else if (e.key === 'End') {
      nextIdx = options.length - 1;
    } else {
      return;
    }
    e.preventDefault();
    const nextOption = options[nextIdx];
    onChange(nextOption.value);
    tabsRef.current[nextIdx]?.focus();
  };

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className="flex sm:inline-flex max-w-full overflow-x-auto no-scrollbar sm:flex-wrap items-center gap-1.5 p-1.5 rounded-xl bg-surface-muted border border-border-subtle"
    >
      {options.map((option, idx) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            ref={(el) => {
              tabsRef.current[idx] = el;
            }}
            role="tab"
            type="button"
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(option.value)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            className={[
              'min-h-[40px] px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap shrink-0 transition-all duration-150 cursor-pointer',
              selected
                ? 'bg-action-primary text-text-inverse shadow-card'
                : 'text-text-primary hover:bg-surface-raised/60',
            ].join(' ')}
          >
            <span>{option.label}</span>
            {option.count !== undefined && (
              <span
                className={`ml-2 text-xs tabular-nums ${
                  selected ? 'text-text-inverse/80' : 'text-text-secondary'
                }`}
              >
                ({option.count})
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
