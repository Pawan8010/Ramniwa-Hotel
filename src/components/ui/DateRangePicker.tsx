import React, { useMemo, useState } from 'react';
import { AlertCircle, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { diffNights } from '../../data/repo';
import { formatDisplayDate, getRelativeIsoDate } from '../../utils/validators';

interface DateRangePickerProps {
  checkIn: string;
  checkOut: string;
  onChange: (checkIn: string, checkOut: string) => void;
  unavailableDates?: Set<string>;
  labelCheckIn?: string;
  labelCheckOut?: string;
  error?: string;
}

function toIso(year: number, month: number, day: number): string {
  const m = String(month + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}-${m}-${d}`;
}

export function DateRangePicker({
  checkIn,
  checkOut,
  onChange,
  unavailableDates,
  labelCheckIn = 'Check-in',
  labelCheckOut = 'Check-out',
  error,
}: DateRangePickerProps) {
  const todayIso = getRelativeIsoDate(0);
  const initialDate = useMemo(() => new Date((checkIn || todayIso) + 'T00:00:00'), [checkIn, todayIso]);
  const [viewYear, setViewYear] = useState(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth());
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [selectingEnd, setSelectingEnd] = useState(false);
  const [focusedIso, setFocusedIso] = useState(checkIn || todayIso);
  const [inlineError, setInlineError] = useState<string | null>(null);

  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric',
  });

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();

  const cells = useMemo(() => {
    const arr: (string | null)[] = [];
    for (let i = 0; i < firstDayOfWeek; i++) arr.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      arr.push(toIso(viewYear, viewMonth, d));
    }
    return arr;
  }, [firstDayOfWeek, daysInMonth, viewYear, viewMonth]);

  const handleSelectDate = (iso: string) => {
    if (iso < todayIso || unavailableDates?.has(iso)) return;
    setInlineError(null);

    if (!selectingEnd) {
      const nextOut = iso >= checkOut ? getRelativeIsoFrom(iso, 1) : checkOut;
      const nights = diffNights(iso, nextOut);
      if (nights > 30) {
        onChange(iso, getRelativeIsoFrom(iso, 1));
      } else {
        onChange(iso, nextOut);
      }
      setSelectingEnd(true);
    } else {
      if (iso <= checkIn) {
        setInlineError('Check-out must be after check-in.');
        return;
      }
      const nights = diffNights(checkIn, iso);
      if (nights > 30) {
        setInlineError('Maximum stay per online booking is 30 nights.');
        return;
      }
      onChange(checkIn, iso);
      setSelectingEnd(false);
      setCalendarOpen(false);
    }
  };

  const handleCalendarKeyDown = (e: React.KeyboardEvent, iso: string) => {
    let delta = 0;
    if (e.key === 'ArrowRight') delta = 1;
    else if (e.key === 'ArrowLeft') delta = -1;
    else if (e.key === 'ArrowDown') delta = 7;
    else if (e.key === 'ArrowUp') delta = -7;
    else if (e.key === 'Escape') {
      e.preventDefault();
      setCalendarOpen(false);
      return;
    } else return;

    e.preventDefault();
    const d = new Date(iso + 'T00:00:00');
    d.setDate(d.getDate() + delta);
    const nextIso = d.toISOString().slice(0, 10);
    setFocusedIso(nextIso);
    if (d.getMonth() !== viewMonth || d.getFullYear() !== viewYear) {
      setViewMonth(d.getMonth());
      setViewYear(d.getFullYear());
    }
    window.requestAnimationFrame(() => {
      const btn = document.querySelector<HTMLButtonElement>(`[data-cal-date="${nextIso}"]`);
      btn?.focus();
    });
  };

  const nightsCount = diffNights(checkIn, checkOut);
  const displayError = error || inlineError;

  return (
    <div className="relative">
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
        <button
          type="button"
          onClick={() => {
            setSelectingEnd(false);
            setCalendarOpen((prev) => !prev);
          }}
          aria-expanded={calendarOpen}
          className="min-h-[48px] min-w-0 flex items-center justify-between gap-2 px-3 sm:px-4 py-2 rounded-lg bg-surface-raised border border-border-subtle hover:border-text-secondary/50 text-left cursor-pointer transition-colors"
        >
          <div className="min-w-0">
            <span className="block text-[11px] sm:text-xs text-text-secondary font-medium truncate">
              {labelCheckIn}
            </span>
            <span className="block text-xs sm:text-sm font-semibold text-text-primary tabular-nums truncate">
              {formatDisplayDate(checkIn)}
            </span>
          </div>
          <Calendar className="w-4 h-4 text-text-secondary shrink-0" aria-hidden="true" />
        </button>

        <button
          type="button"
          onClick={() => {
            setSelectingEnd(true);
            setCalendarOpen((prev) => !prev);
          }}
          aria-expanded={calendarOpen}
          className="min-h-[48px] min-w-0 flex items-center justify-between gap-2 px-3 sm:px-4 py-2 rounded-lg bg-surface-raised border border-border-subtle hover:border-text-secondary/50 text-left cursor-pointer transition-colors"
        >
          <div className="min-w-0">
            <span className="block text-[11px] sm:text-xs text-text-secondary font-medium truncate">
              {labelCheckOut} ({nightsCount > 0 ? `${nightsCount}n` : 'Select'})
            </span>
            <span className="block text-xs sm:text-sm font-semibold text-text-primary tabular-nums truncate">
              {formatDisplayDate(checkOut)}
            </span>
          </div>
          <Calendar className="w-4 h-4 text-text-secondary shrink-0" aria-hidden="true" />
        </button>
      </div>

      {displayError && (
        <p className="mt-2 text-xs text-status-error flex items-center gap-1.5" role="alert">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>{displayError}</span>
        </p>
      )}

      {calendarOpen && (
        <div
          role="dialog"
          aria-label="Choose check-in and check-out dates"
          className="mt-2 p-3 sm:p-4 rounded-xl bg-surface-raised border border-border-strong shadow-modal z-30 w-full max-w-sm"
        >
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              aria-label="Previous month"
              onClick={() => {
                if (viewMonth === 0) {
                  setViewMonth(11);
                  setViewYear((y) => y - 1);
                } else {
                  setViewMonth((m) => m - 1);
                }
              }}
              className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg hover:bg-surface-muted cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" aria-hidden="true" />
            </button>
            <div className="text-sm font-semibold text-text-primary">{monthLabel}</div>
            <button
              type="button"
              aria-label="Next month"
              onClick={() => {
                if (viewMonth === 11) {
                  setViewMonth(0);
                  setViewYear((y) => y + 1);
                } else {
                  setViewMonth((m) => m + 1);
                }
              }}
              className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg hover:bg-surface-muted cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>

          <p className="text-xs text-text-secondary mb-2">
            {selectingEnd ? 'Select check-out date (1–30 nights).' : 'Select check-in date.'}
          </p>

          <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-text-secondary mb-1">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
              <div key={day} className="py-1">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1" role="grid" aria-label={monthLabel}>
            {cells.map((iso, i) => {
              if (!iso) return <div key={`empty-${i}`} />;
              const dayNum = Number(iso.slice(-2));
              const isPast = iso < todayIso;
              const isUnavailable = unavailableDates?.has(iso) ?? false;
              const disabled = isPast || isUnavailable;
              const isStart = iso === checkIn;
              const isEnd = iso === checkOut;
              const inRange = iso > checkIn && iso < checkOut;

              return (
                <button
                  key={iso}
                  type="button"
                  data-cal-date={iso}
                  disabled={disabled}
                  tabIndex={iso === focusedIso ? 0 : -1}
                  aria-label={`${formatDisplayDate(iso)}${
                    isUnavailable ? ', unavailable' : isPast ? ', past date' : ''
                  }${isStart ? ', selected check-in' : ''}${isEnd ? ', selected check-out' : ''}`}
                  aria-selected={isStart || isEnd}
                  onClick={() => handleSelectDate(iso)}
                  onKeyDown={(e) => handleCalendarKeyDown(e, iso)}
                  className={[
                    'min-h-[38px] rounded-md text-xs font-medium tabular-nums transition-colors cursor-pointer',
                    disabled
                      ? 'text-text-secondary/40 line-through cursor-not-allowed'
                      : isStart || isEnd
                        ? 'bg-action-primary text-text-inverse font-semibold'
                        : inRange
                          ? 'bg-surface-muted text-text-primary'
                          : 'hover:bg-surface-muted text-text-primary',
                  ].join(' ')}
                >
                  {dayNum}
                </button>
              );
            })}
          </div>

          <div className="mt-3 pt-3 border-t border-border-subtle flex items-center justify-between text-xs text-text-secondary">
            <span>Min 1 night · Max 30 nights</span>
            <button
              type="button"
              onClick={() => setCalendarOpen(false)}
              className="px-3 py-1.5 rounded-md font-medium text-text-primary hover:bg-surface-muted cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function getRelativeIsoFrom(baseIso: string, deltaDays: number): string {
  const d = new Date(baseIso + 'T00:00:00');
  d.setDate(d.getDate() + deltaDays);
  return d.toISOString().slice(0, 10);
}
