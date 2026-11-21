import React, { useState } from 'react';
import { Printer, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/DataState';
import { DateRangePicker } from '../components/ui/DateRangePicker';
import { InputField, TextareaField } from '../components/ui/FormField';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { useHotelData } from '../hooks/useRepository';
import { useToast } from '../hooks/useToast';
import type { Booking } from '../types/hotel';
import { formatDisplayDate, formatInr, isValidIndianMobile } from '../utils/validators';

export function MyBookingPage() {
  useDocumentMeta(
    'Manage My Booking · Hotel Ramniwas, Jalgaon',
    'Look up your Hotel Ramniwas reservation by Booking ID and mobile number to print GST receipt, modify dates, or cancel.'
  );

  const { state, repo } = useHotelData();
  const { showToast } = useToast();

  const [bookingId, setBookingId] = useState('RN-2026-1004');
  const [phone, setPhone] = useState('9765234109');
  const [booking, setBooking] = useState<Booking | null>(null);
  const [searched, setSearched] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [editCheckIn, setEditCheckIn] = useState('');
  const [editCheckOut, setEditCheckOut] = useState('');
  const [editRequests, setEditRequests] = useState('');

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!bookingId.trim()) nextErrors.bookingId = 'Enter your Booking ID (e.g. RN-2026-1004).';
    if (!isValidIndianMobile(phone)) nextErrors.phone = 'Enter your 10-digit registered mobile number.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const found = repo.lookupBooking(bookingId, phone);
    setSearched(true);
    setBooking(found);
    if (found) {
      setEditCheckIn(found.checkIn);
      setEditCheckOut(found.checkOut);
      setEditRequests(found.specialRequests);
    }
  };

  const handleModify = () => {
    if (!booking) return;
    const res = repo.modifyGuestBooking(booking.id, phone, {
      checkIn: editCheckIn,
      checkOut: editCheckOut,
      specialRequests: editRequests,
    });
    if (!res.ok) {
      showToast({ tone: 'error', title: 'Unable to modify booking', description: res.error });
      return;
    }
    setBooking(res.booking);
    showToast({ tone: 'success', title: 'Reservation updated', description: 'New dates and tariff saved.' });
  };

  const handleCancel = () => {
    if (!booking) return;
    const updated = repo.updateBookingStatus(booking.id, 'Cancelled');
    if (updated) {
      setBooking(updated);
      showToast({
        tone: 'info',
        title: `Booking ${updated.id} cancelled`,
        description: 'The room inventory has been released.',
      });
    }
  };

  const roomType = booking ? state.roomTypes.find((r) => r.id === booking.roomTypeId) : null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 md:py-14 space-y-8">
      <div className="no-print">
        <p className="text-xs font-semibold uppercase tracking-wider text-text-accent">
          Self-Service Reservation Portal
        </p>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-text-primary mt-1">
          Find, Modify, or Cancel Your Booking
        </h1>
        <p className="text-sm text-text-secondary mt-2">
          Enter your Booking ID and registered 10-digit phone number. (Sample demo lookup pre-filled: RN-2026-1004 / 9765234109)
        </p>
      </div>

      <form
        onSubmit={handleLookup}
        noValidate
        className="p-6 rounded-2xl bg-surface-raised border border-border-subtle shadow-card grid grid-cols-1 sm:grid-cols-12 gap-4 items-end no-print"
      >
        <div className="sm:col-span-5">
          <InputField
            label="Booking ID"
            required
            value={bookingId}
            onChange={(e) => setBookingId(e.target.value)}
            error={errors.bookingId}
          />
        </div>
        <div className="sm:col-span-4">
          <InputField
            label="Registered Mobile"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            error={errors.phone}
          />
        </div>
        <div className="sm:col-span-3">
          <Button type="submit" variant="primary" size="lg" className="w-full">
            <Search className="w-4 h-4" aria-hidden="true" />
            Find Booking
          </Button>
        </div>
      </form>

      {searched && !booking && (
        <EmptyState
          title="No matching booking found"
          description="Verify your Booking ID and 10-digit mobile number, or call +91 257 222 6126 for front-desk assistance."
        />
      )}

      {booking && (
        <div className="p-6 sm:p-8 rounded-2xl bg-surface-raised border border-border-subtle shadow-card space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border-subtle pb-4">
            <div>
              <p className="text-xs text-text-secondary">
                Booking ID <span className="font-semibold text-text-primary">{booking.id}</span> · Invoice {booking.invoiceNumber}
              </p>
              <h2 className="font-display text-2xl font-bold text-text-primary mt-1">
                {booking.guestName}
              </h2>
              <p className="text-sm text-text-secondary">
                {roomType?.name ?? booking.roomTypeId} · Status: <strong>{booking.status}</strong> · Payment: {booking.paymentStatus}
              </p>
            </div>
            <Button variant="secondary" size="sm" onClick={() => window.print()} className="no-print">
              <Printer className="w-4 h-4" aria-hidden="true" />
              Print Receipt
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-xs text-text-secondary">Check-in</p>
              <p className="font-semibold tabular-nums">{formatDisplayDate(booking.checkIn)} (12:00 PM)</p>
            </div>
            <div>
              <p className="text-xs text-text-secondary">Check-out</p>
              <p className="font-semibold tabular-nums">{formatDisplayDate(booking.checkOut)} (11:00 AM)</p>
            </div>
            <div>
              <p className="text-xs text-text-secondary">Total Amount (incl. GST)</p>
              <p className="font-bold text-action-primary tabular-nums">{formatInr(booking.totalAmount)}</p>
            </div>
          </div>

          {booking.status !== 'Cancelled' && booking.status !== 'Checked-out' && (
            <div className="pt-5 border-t border-border-subtle space-y-4 no-print">
              <h3 className="font-display text-lg font-semibold text-text-primary">
                Modify Stay Dates or Requests
              </h3>
              <DateRangePicker
                checkIn={editCheckIn}
                checkOut={editCheckOut}
                onChange={(a, b) => {
                  setEditCheckIn(a);
                  setEditCheckOut(b);
                }}
              />
              <TextareaField
                label="Special Requests"
                value={editRequests}
                onChange={(e) => setEditRequests(e.target.value)}
              />
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <Button variant="primary" className="w-full sm:w-auto" onClick={handleModify}>
                  Save Changes
                </Button>
                <Button
                  variant="secondary"
                  onClick={handleCancel}
                  className="w-full sm:w-auto text-status-error border-status-error/40"
                >
                  Cancel Reservation
                </Button>
              </div>
            </div>
          )}

          {booking.status === 'Cancelled' && (
            <div className="pt-4 border-t border-border-subtle no-print">
              <Link to="/book">
                <Button variant="primary">Book New Stay</Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
