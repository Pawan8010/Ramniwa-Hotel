import React, { useState } from 'react';
import { Check, Minus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { RoomCard } from '../components/room/RoomCard';
import { RoomDetailsModal } from '../components/room/RoomDetailsModal';
import { Accordion } from '../components/ui/Accordion';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/DataState';
import { DateRangePicker } from '../components/ui/DateRangePicker';
import { Tabs } from '../components/ui/Tabs';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { useLanguage } from '../hooks/useLanguage';
import { useHotelData } from '../hooks/useRepository';
import type { RoomType } from '../types/hotel';
import { formatInr, getRelativeIsoDate } from '../utils/validators';

type FilterValue = 'All' | 'AC Deluxe' | 'Non-AC' | 'Solo Sharing';

export function RoomsPage() {
  useDocumentMeta(
    'Rooms & Tariffs · Hotel Ramniwas, Jalgaon',
    'Compare AC Deluxe King, AC Deluxe Twin, Deluxe Non-AC, and Sharing Dormitory rooms at Hotel Ramniwas, Jalgaon. Live availability and direct booking.'
  );

  const { t } = useLanguage();
  const { state, repo } = useHotelData();
  const [filter, setFilter] = useState<FilterValue>('All');
  const [checkIn, setCheckIn] = useState(() => getRelativeIsoDate(0));
  const [checkOut, setCheckOut] = useState(() => getRelativeIsoDate(1));
  const [modalRoom, setModalRoom] = useState<RoomType | null>(null);

  const filteredRooms = state.roomTypes.filter((r) =>
    filter === 'All' ? true : r.filterGroup === filter
  );

  const houseRules = [
    {
      id: 'checkin-out',
      question: 'What are the standard check-in and check-out timings?',
      answer:
        'Standard check-in is 12:00 PM and check-out is 11:00 AM. Early check-in or late check-out can be requested subject to same-day availability; luggage storage is complimentary at our 24-hour reception.',
    },
    {
      id: 'id-age',
      question: 'What identification and age rules apply at check-in?',
      answer:
        'Guests must be at least 18 years old to check in. A valid government-issued photo ID (Aadhaar, Passport, Driving Licence, or Voter ID) is mandatory for every adult guest at check-in.',
    },
    {
      id: 'pets-smoking',
      question: 'Are pets allowed, and do you offer non-smoking rooms?',
      answer:
        'Pets are not permitted on the property. Dedicated non-smoking rooms are available across AC and Non-AC categories—simply note your preference while booking.',
    },
    {
      id: 'payments-gst',
      question: 'What payment methods are accepted and is GST billing provided?',
      answer:
        'We accept Cash, Credit/Debit Cards, and UPI (QR/GPay/PhonePe) at reception or online. GST invoices are generated automatically for all stays.',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10 md:py-14 space-y-10 sm:space-y-14">
      {/* Header & Live Date Checker */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-end">
        <div className="lg:col-span-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-text-accent">
            32 Rooms Across 4 Floors · Passenger Lift
          </p>
          <h1 className="font-display text-2xl sm:text-4xl font-bold text-text-primary mt-1.5">
            Rooms & Direct Tariffs
          </h1>
          <p className="text-sm sm:text-base text-text-secondary mt-2 leading-relaxed">
            Every direct reservation carries zero convenience fee. Check live availability for your Jalgaon travel dates below.
          </p>
        </div>

        <div className="lg:col-span-6 p-4 rounded-xl bg-surface-raised border border-border-subtle shadow-card">
          <DateRangePicker
            checkIn={checkIn}
            checkOut={checkOut}
            onChange={(a, b) => {
              setCheckIn(a);
              setCheckOut(b);
            }}
          />
        </div>
      </div>

      {/* Filter Tabs with Roving Tabindex */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Tabs<FilterValue>
          ariaLabel="Filter rooms by category"
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'All', label: 'All', count: state.roomTypes.length },
            {
              value: 'AC Deluxe',
              label: 'AC Deluxe',
              count: state.roomTypes.filter((r) => r.filterGroup === 'AC Deluxe').length,
            },
            {
              value: 'Non-AC',
              label: 'Non-AC',
              count: state.roomTypes.filter((r) => r.filterGroup === 'Non-AC').length,
            },
            {
              value: 'Solo Sharing',
              label: 'Solo Sharing',
              count: state.roomTypes.filter((r) => r.filterGroup === 'Solo Sharing').length,
            },
          ]}
        />
        <p className="text-sm text-text-secondary">
          Showing {filteredRooms.length} room {filteredRooms.length === 1 ? 'category' : 'categories'}
        </p>
      </div>

      {/* Room Grid */}
      {filteredRooms.length === 0 ? (
        <EmptyState
          title="No rooms match this filter"
          description="Try switching back to All rooms or call +91 257 222 6126 for custom family arrangements."
          actionLabel="Show All Rooms"
          onAction={() => setFilter('All')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
          {filteredRooms.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              availableCount={repo.getAvailableCountForRange(room.id, checkIn, checkOut)}
              checkIn={checkIn}
              checkOut={checkOut}
              onInspectDetails={setModalRoom}
            />
          ))}
        </div>
      )}

      {/* Side-by-Side Comparison Matrix */}
      <section aria-labelledby="compare-heading" className="space-y-4">
        <div>
          <h2 id="compare-heading" className="font-display text-2xl sm:text-3xl font-bold text-text-primary">
            Side-by-Side Room Comparison
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            Compare floor size, bedding, climate control, and direct tariff ranges at a glance.
          </p>
          <p className="md:hidden text-xs text-text-accent mt-1">
            Swipe table horizontally to compare all categories →
          </p>
        </div>

        <div className="overflow-x-auto rounded-xl border border-border-subtle bg-surface-raised shadow-card">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-surface-base border-b border-border-subtle">
                <th className="sticky left-0 z-10 bg-surface-base p-3 sm:p-4 font-semibold text-text-primary border-r border-border-subtle">
                  Feature
                </th>
                {state.roomTypes.map((rt) => (
                  <th key={rt.id} className="p-3 sm:p-4 font-semibold text-text-primary whitespace-nowrap">
                    {rt.shortName}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              <tr>
                <th scope="row" className="sticky left-0 z-10 bg-surface-raised p-3 sm:p-4 font-medium text-text-secondary border-r border-border-subtle">
                  Room Size
                </th>
                {state.roomTypes.map((rt) => (
                  <td key={rt.id} className="p-3 sm:p-4 tabular-nums whitespace-nowrap">{rt.areaSqFt} sq ft</td>
                ))}
              </tr>
              <tr>
                <th scope="row" className="sticky left-0 z-10 bg-surface-raised p-3 sm:p-4 font-medium text-text-secondary border-r border-border-subtle">
                  Bedding
                </th>
                {state.roomTypes.map((rt) => (
                  <td key={rt.id} className="p-3 sm:p-4 whitespace-nowrap">{rt.bedConfig}</td>
                ))}
              </tr>
              <tr>
                <th scope="row" className="sticky left-0 z-10 bg-surface-raised p-3 sm:p-4 font-medium text-text-secondary border-r border-border-subtle">
                  Air Conditioning
                </th>
                {state.roomTypes.map((rt) => (
                  <td key={rt.id} className="p-3 sm:p-4 whitespace-nowrap">
                    {rt.filterGroup === 'AC Deluxe' ? (
                      <span className="inline-flex items-center gap-1 text-status-success font-medium">
                        <Check className="w-4 h-4" aria-hidden="true" /> Split AC
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-text-secondary">
                        <Minus className="w-4 h-4" aria-hidden="true" /> Ceiling Fan
                      </span>
                    )}
                  </td>
                ))}
              </tr>
              <tr>
                <th scope="row" className="sticky left-0 z-10 bg-surface-raised p-3 sm:p-4 font-medium text-text-secondary border-r border-border-subtle">
                  Hot Water & Wi-Fi
                </th>
                {state.roomTypes.map((rt) => (
                  <td key={rt.id} className="p-3 sm:p-4 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 text-status-success font-medium">
                      <Check className="w-4 h-4" aria-hidden="true" /> Included
                    </span>
                  </td>
                ))}
              </tr>
              <tr>
                <th scope="row" className="sticky left-0 z-10 bg-surface-raised p-3 sm:p-4 font-medium text-text-secondary border-r border-border-subtle">
                  Tariff Range
                </th>
                {state.roomTypes.map((rt) => (
                  <td key={rt.id} className="p-3 sm:p-4 font-semibold tabular-nums whitespace-nowrap">
                    {formatInr(rt.minTariff)}–{formatInr(rt.maxTariff)}
                    {rt.isPerPerson ? ' / bed' : ''}
                  </td>
                ))}
              </tr>
              <tr>
                <th scope="row" className="sticky left-0 z-10 bg-surface-raised p-3 sm:p-4 font-medium text-text-secondary border-r border-border-subtle">
                  Action
                </th>
                {state.roomTypes.map((rt) => (
                  <td key={rt.id} className="p-3 sm:p-4">
                    <Link to={`/book?room=${rt.id}&checkIn=${checkIn}&checkOut=${checkOut}`}>
                      <Button variant="secondary" size="sm">
                        Select
                      </Button>
                    </Link>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* House Rules Accordion */}
      <section aria-labelledby="house-rules-heading" className="max-w-4xl space-y-4">
        <h2 id="house-rules-heading" className="font-display text-2xl sm:text-3xl font-bold text-text-primary">
          {t.houseRulesHeading}
        </h2>
        <Accordion items={houseRules} />
      </section>

      <RoomDetailsModal
        room={modalRoom}
        availableCount={
          modalRoom ? repo.getAvailableCountForRange(modalRoom.id, checkIn, checkOut) : 0
        }
        checkIn={checkIn}
        checkOut={checkOut}
        onClose={() => setModalRoom(null)}
      />
    </div>
  );
}
