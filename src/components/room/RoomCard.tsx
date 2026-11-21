import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, BedDouble, Maximize2, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getAssetBySlot } from '../../data/assets';
import { useLanguage } from '../../hooks/useLanguage';
import type { RoomType } from '../../types/hotel';
import { formatInr } from '../../utils/validators';
import { Button } from '../ui/Button';
import { SmartImage } from '../ui/SmartImage';

interface RoomCardProps {
  room: RoomType;
  availableCount: number;
  checkIn?: string;
  checkOut?: string;
  onInspectDetails?: (room: RoomType) => void;
  className?: string;
}

export function RoomCard({
  room,
  availableCount,
  checkIn,
  checkOut,
  onInspectDetails,
  className = '',
}: RoomCardProps) {
  const { t } = useLanguage();
  const [slideIdx, setSlideIdx] = useState(0);
  const [paused, setPaused] = useState(false);

  const slides = room.imageSlots.map((slot) => getAssetBySlot(slot));
  const totalSlides = slides.length;

  useEffect(() => {
    if (paused || totalSlides <= 1) return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;
    const timer = window.setInterval(() => {
      setSlideIdx((prev) => (prev + 1) % totalSlides);
    }, 4500);
    return () => window.clearInterval(timer);
  }, [paused, totalSlides]);

  const prevSlide = () => setSlideIdx((prev) => (prev - 1 + totalSlides) % totalSlides);
  const nextSlide = () => setSlideIdx((prev) => (prev + 1) % totalSlides);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      prevSlide();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      nextSlide();
    }
  };

  const bookHref = `/book?room=${encodeURIComponent(room.id)}${
    checkIn && checkOut ? `&checkIn=${checkIn}&checkOut=${checkOut}` : ''
  }`;

  const currentAsset = slides[slideIdx] ?? slides[0];

  return (
    <article
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className={`spotlight-card group flex flex-col rounded-2xl bg-surface-raised border border-border-subtle shadow-card overflow-hidden ${className}`}
    >
      {/* Image slider */}
      <div
        className="relative aspect-[16/10] bg-surface-muted overflow-hidden"
        tabIndex={totalSlides > 1 ? 0 : undefined}
        onKeyDown={handleKeyDown}
        aria-roledescription={totalSlides > 1 ? 'carousel' : undefined}
        aria-label={`${room.name} photos`}
      >
        <SmartImage
          asset={currentAsset}
          fallbackTitle={room.name}
          className="w-full h-full"
          imgClassName="group-hover:scale-[1.03] transition-transform duration-500"
        />

        {/* Contrast scrim at bottom */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-surface-base/85 via-surface-base/30 to-transparent"
        />

        {/* Visible availability indicator */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          {availableCount > 0 ? (
            <span className="px-2.5 py-1 rounded-md bg-surface-base/85 border border-border-strong text-text-on-dark text-xs font-medium backdrop-blur-sm tabular-nums">
              {t.onlyLeftPrefix} {availableCount} {t.onlyLeftSuffix}
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-md bg-status-error text-text-inverse text-xs font-semibold">
              Sold out for dates
            </span>
          )}
        </div>

        {totalSlides > 1 && (
          <>
            <div className="absolute inset-y-0 left-2 flex items-center">
              <button
                type="button"
                onClick={prevSlide}
                aria-label={`Previous photo of ${room.name}`}
                className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full bg-surface-base/80 border border-border-subtle text-text-on-dark hover:bg-surface-base transition-colors cursor-pointer active:scale-95"
              >
                <ChevronLeft className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
            <div className="absolute inset-y-0 right-2 flex items-center">
              <button
                type="button"
                onClick={nextSlide}
                aria-label={`Next photo of ${room.name}`}
                className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full bg-surface-base/80 border border-border-subtle text-text-on-dark hover:bg-surface-base transition-colors cursor-pointer active:scale-95"
              >
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
            <div className="absolute bottom-2.5 inset-x-3 flex items-center justify-between pointer-events-none">
              <div className="flex items-center gap-1">
                {slides.map((_, idx) => (
                  <span
                    key={idx}
                    className={`h-1.5 rounded-full transition-all ${
                      idx === slideIdx ? 'w-4 bg-action-primary' : 'w-1.5 bg-text-on-dark/50'
                    }`}
                  />
                ))}
              </div>
              <span className="text-[11px] font-medium text-text-on-dark tabular-nums">
                {slideIdx + 1} / {totalSlides}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-text-secondary mb-1.5">
          <span>{room.filterGroup}</span>
          <span aria-hidden="true">·</span>
          <span className="tabular-nums">{room.areaSqFt} sq ft</span>
          <span aria-hidden="true">·</span>
          <span>{room.bedConfig}</span>
        </div>

        <h3
          title={room.name}
          className="font-display text-lg sm:text-xl font-semibold text-text-tertiary line-clamp-2 sm:min-h-[3.25rem]"
        >
          {room.name}
        </h3>

        <p className="text-sm text-text-secondary mt-1.5 sm:mt-2 line-clamp-2 leading-relaxed">
          {room.description}
        </p>

        <div className="mt-3.5 sm:mt-4 pt-3 border-t border-border-subtle flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-text-secondary">
          <span className="inline-flex items-center gap-1.5">
            <Maximize2 className="w-3.5 h-3.5 text-text-accent" aria-hidden="true" />
            <span className="tabular-nums">{room.areaSqFt} sq ft</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <BedDouble className="w-3.5 h-3.5 text-text-accent" aria-hidden="true" />
            <span>{room.bedConfig}</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-text-accent" aria-hidden="true" />
            <span className="tabular-nums">Up to {room.maxGuests}</span>
          </span>
        </div>

        <div className="mt-auto pt-4 sm:pt-5 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <p className="text-xs text-text-secondary">
              Tariff range {formatInr(room.minTariff)}–{formatInr(room.maxTariff)}
            </p>
            <p className="font-ui text-xl font-bold text-text-tertiary tabular-nums">
              {formatInr(room.baseRate)}{' '}
              <span className="text-xs font-normal text-text-secondary">
                {room.isPerPerson ? '/ bed / night' : t.perNight}
              </span>
            </p>
          </div>

          <div className="grid grid-cols-2 sm:flex items-center gap-2 shrink-0 w-full sm:w-auto">
            {onInspectDetails && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onInspectDetails(room)}
                className="w-full sm:w-auto"
              >
                Details
              </Button>
            )}
            <Link
              to={bookHref}
              className={`${onInspectDetails ? '' : 'col-span-2 '}w-full sm:w-auto ${
                availableCount <= 0 ? 'pointer-events-none opacity-50' : ''
              }`}
            >
              <Button variant="primary" size="sm" disabled={availableCount <= 0} className="w-full sm:w-auto">
                {t.bookThisRoom}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
