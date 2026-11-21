import React, { useState } from 'react';
import { Check, ChevronLeft, ChevronRight, BedDouble, Maximize2, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getAssetBySlot } from '../../data/assets';
import type { RoomType } from '../../types/hotel';
import { formatInr } from '../../utils/validators';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { SmartImage } from '../ui/SmartImage';

interface RoomDetailsModalProps {
  room: RoomType | null;
  availableCount: number;
  checkIn?: string;
  checkOut?: string;
  onClose: () => void;
}

export function RoomDetailsModal({
  room,
  availableCount,
  checkIn,
  checkOut,
  onClose,
}: RoomDetailsModalProps) {
  const [idx, setIdx] = useState(0);
  if (!room) return null;

  const assets = room.imageSlots.map((s) => getAssetBySlot(s));
  const current = assets[idx % assets.length] ?? assets[0];
  const bookHref = `/book?room=${encodeURIComponent(room.id)}${
    checkIn && checkOut ? `&checkIn=${checkIn}&checkOut=${checkOut}` : ''
  }`;

  return (
    <Modal
      isOpen={Boolean(room)}
      onClose={onClose}
      title={room.name}
      subtitle={`${room.filterGroup} · ${room.areaSqFt} sq ft · ${room.bedConfig}`}
      maxWidthClass="max-w-3xl"
    >
      <div className="space-y-6">
        <div className="relative aspect-[16/9] rounded-xl overflow-hidden border border-border-subtle">
          <SmartImage asset={current} fallbackTitle={room.name} className="w-full h-full" priority />
          {assets.length > 1 && (
            <>
              <button
                type="button"
                aria-label="Previous room photo"
                onClick={() => setIdx((i) => (i - 1 + assets.length) % assets.length)}
                className="absolute left-3 top-1/2 -translate-y-1/2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-surface-base/80 border border-border-subtle text-text-on-dark hover:bg-surface-base cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" aria-hidden="true" />
              </button>
              <button
                type="button"
                aria-label="Next room photo"
                onClick={() => setIdx((i) => (i + 1) % assets.length)}
                className="absolute right-3 top-1/2 -translate-y-1/2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-surface-base/80 border border-border-subtle text-text-on-dark hover:bg-surface-base cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" aria-hidden="true" />
              </button>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-surface-base border border-border-subtle text-sm">
          <div className="flex items-center gap-2">
            <Maximize2 className="w-4 h-4 text-text-accent" aria-hidden="true" />
            <span className="tabular-nums">{room.areaSqFt} sq ft area</span>
          </div>
          <div className="flex items-center gap-2">
            <BedDouble className="w-4 h-4 text-text-accent" aria-hidden="true" />
            <span>{room.bedConfig}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-text-accent" aria-hidden="true" />
            <span className="tabular-nums">Max {room.maxGuests} guest{room.maxGuests > 1 ? 's' : ''}</span>
          </div>
        </div>

        <p className="text-sm text-text-secondary leading-relaxed">{room.description}</p>

        <div>
          <h3 className="font-display text-base font-semibold text-text-primary mb-3">
            Included In-Room Amenities
          </h3>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {room.amenities.map((amenity) => (
              <li key={amenity} className="flex items-center gap-2 text-sm text-text-primary">
                <Check className="w-4 h-4 text-status-success shrink-0" aria-hidden="true" />
                <span>{amenity}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="pt-4 border-t border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs text-text-secondary">
              Seasonal tariff range: {formatInr(room.minTariff)}–{formatInr(room.maxTariff)} · {availableCount} unit{availableCount === 1 ? '' : 's'} available
            </p>
            <p className="font-ui text-2xl font-bold text-text-tertiary tabular-nums">
              {formatInr(room.baseRate)}{' '}
              <span className="text-sm font-normal text-text-secondary">
                {room.isPerPerson ? '/ person / night' : '/ night + GST'}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
            <Link to={bookHref} onClick={onClose}>
              <Button variant="primary" disabled={availableCount <= 0}>
                Book This Room
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Modal>
  );
}
