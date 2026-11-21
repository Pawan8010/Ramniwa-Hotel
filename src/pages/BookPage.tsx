import React, { useEffect, useState } from 'react';
import {
  CalendarPlus,
  CheckCircle2,
  MessageCircle,
  Printer,
  QrCode,
  ShieldCheck,
  Tag,
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { ConfettiBurst } from '../components/ui/ConfettiBurst';
import { EmptyState } from '../components/ui/DataState';
import { DateRangePicker } from '../components/ui/DateRangePicker';
import { InputField, SelectField, TextareaField } from '../components/ui/FormField';
import { SmartImage } from '../components/ui/SmartImage';
import { buildWhatsAppConfirmationUrl, diffNights } from '../data/repo';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { useHotelData } from '../hooks/useRepository';
import { useToast } from '../hooks/useToast';
import type { Booking, PaymentMode } from '../types/hotel';
import {
  downloadIcsCalendarFile,
  formatDisplayDate,
  formatInr,
  getRelativeIsoDate,
  isValidEmail,
  isValidIndianMobile,
} from '../utils/validators';

const STEPS = [
  '1. Dates & Guests',
  '2. Room & Tariff',
  '3. Guest Details',
  '4. Payment Mode',
  '5. Confirmation',
];

export function BookPage() {
  useDocumentMeta(
    'Book Direct · Hotel Ramniwas, Jalgaon',
    'Reserve AC Deluxe or Non-AC rooms directly at Hotel Ramniwas, Jalgaon with zero convenience fee and instant confirmation.'
  );

  const [searchParams] = useSearchParams();
  const { state, repo } = useHotelData();
  const { showToast } = useToast();

  const [step, setStep] = useState<number>(1);
  const [checkIn, setCheckIn] = useState(() => searchParams.get('checkIn') || getRelativeIsoDate(0));
  const [checkOut, setCheckOut] = useState(() => searchParams.get('checkOut') || getRelativeIsoDate(1));
  const [guests, setGuests] = useState<number>(() => Number(searchParams.get('guests') || 2));
  const [selectedRoomId, setSelectedRoomId] = useState<string>(
    () => searchParams.get('room') || state.roomTypes[0]?.id || 'rt-ac-king'
  );
  const [promoCode, setPromoCode] = useState('DIRECT10');

  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [idType, setIdType] = useState<Booking['idType']>('Aadhaar');
  const [specialRequests, setSpecialRequests] = useState('');
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('Pay at Hotel');
  const [submitting, setSubmitting] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    const paramRoom = searchParams.get('room');
    if (paramRoom && state.roomTypes.some((r) => r.id === paramRoom)) {
      setSelectedRoomId(paramRoom);
    }
  }, [searchParams, state.roomTypes]);

  const nights = diffNights(checkIn, checkOut);
  const selectedRoom = state.roomTypes.find((r) => r.id === selectedRoomId) ?? state.roomTypes[0];
  const quote = selectedRoom
    ? repo.calculateStayQuote(selectedRoom.id, checkIn, checkOut, promoCode)
    : null;
  const availableCount = selectedRoom
    ? repo.getAvailableCountForRange(selectedRoom.id, checkIn, checkOut)
    : 0;

  const validateStep1 = (): boolean => {
    if (nights < 1) {
      setErrors({ dates: 'Check-out must be after check-in.' });
      return false;
    }
    if (nights > 30) {
      setErrors({ dates: 'Maximum stay is 30 nights per online reservation.' });
      return false;
    }
    setErrors({});
    return true;
  };

  const validateStep2 = (): boolean => {
    if (!selectedRoom || availableCount <= 0) {
      setErrors({
        room: 'No rooms are available for these dates. Try different dates or call +91 257 222 6126.',
      });
      return false;
    }
    setErrors({});
    return true;
  };

  const validateStep3 = (): boolean => {
    const next: Record<string, string> = {};
    if (guestName.trim().length < 2) {
      next.guestName = 'Please enter the primary guest full name.';
    }
    if (!isValidIndianMobile(guestPhone)) {
      next.guestPhone = 'Enter a valid 10-digit Indian mobile number (starting 6–9).';
    }
    if (!isValidEmail(guestEmail)) {
      next.guestEmail = 'Enter a valid email address for your GST confirmation.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleConfirmBooking = () => {
    if (!selectedRoom) return;
    setSubmitting(true);
    window.setTimeout(() => {
      const result = repo.createBooking({
        roomTypeId: selectedRoom.id,
        checkIn,
        checkOut,
        guests,
        guestName,
        guestPhone,
        guestEmail,
        idType,
        specialRequests,
        paymentMode,
        promoCode,
        source: 'Direct Web',
      });
      setSubmitting(false);
      if (!result.ok) {
        showToast({ tone: 'error', title: 'Booking could not be completed', description: result.error });
        return;
      }
      setConfirmedBooking(result.booking);
      setStep(5);
      showToast({
        tone: 'success',
        title: `Booking ${result.booking.id} Confirmed`,
        description: 'Your room has been reserved with zero convenience fee.',
      });
    }, 300);
  };

  const activePromos = state.promos.filter((p) => p.active);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 md:py-14">
      {step === 5 && confirmedBooking && <ConfettiBurst />}

      {/* Wizard Header & Progress Bar */}
      <div className="mb-6 sm:mb-8 no-print">
        <p className="text-xs font-semibold uppercase tracking-wider text-text-accent">
          Direct Reservation · Zero Convenience Fee
        </p>
        <h1 className="font-display text-2xl sm:text-4xl font-bold text-text-primary mt-1">
          Reserve Your Room at Hotel Ramniwas
        </h1>

        {/* Compact Mobile Progress Bar */}
        <div className="mt-5 sm:hidden p-3.5 rounded-xl bg-surface-raised border border-border-subtle space-y-2.5">
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="font-semibold text-text-accent">Step {step} of 5</span>
            <span className="font-medium text-text-primary truncate">{STEPS[step - 1]}</span>
          </div>
          <div className="grid grid-cols-5 gap-1.5" aria-hidden="true">
            {STEPS.map((_, idx) => {
              const num = idx + 1;
              return (
                <span
                  key={num}
                  className={`h-1.5 rounded-full transition-colors ${
                    step >= num ? 'bg-action-primary' : 'bg-surface-muted'
                  }`}
                />
              );
            })}
          </div>
        </div>

        {/* Desktop 5-Column Stepper */}
        <nav aria-label="Booking progress" className="mt-6 hidden sm:block">
          <ol className="grid sm:grid-cols-5 gap-2">
            {STEPS.map((label, idx) => {
              const num = idx + 1;
              const active = step === num;
              const completed = step > num;
              return (
                <li
                  key={label}
                  className={[
                    'px-3 py-2.5 rounded-lg border text-xs font-medium transition-colors',
                    active
                      ? 'bg-action-primary text-text-inverse border-action-primary font-semibold'
                      : completed
                        ? 'bg-surface-muted text-text-primary border-action-accent'
                        : 'bg-surface-raised text-text-secondary border-border-subtle',
                  ].join(' ')}
                  aria-current={active ? 'step' : undefined}
                >
                  {label}
                </li>
              );
            })}
          </ol>
        </nav>
      </div>

      {/* Compact Mobile Live Summary Strip */}
      {selectedRoom && quote && step < 5 && (
        <div className="lg:hidden mb-5 p-3.5 rounded-xl bg-surface-raised border border-border-strong flex items-center justify-between gap-3 no-print">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-text-primary truncate">{selectedRoom.shortName}</p>
            <p className="text-[11px] text-text-secondary tabular-nums truncate">
              {formatDisplayDate(checkIn)} – {formatDisplayDate(checkOut)} · {quote.nights}n · Incl. GST
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[10px] uppercase tracking-wider text-text-secondary">Total</p>
            <p className="font-ui text-base font-bold text-text-accent tabular-nums">
              {formatInr(quote.totalAmount)}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Main Wizard Column */}
        <div className="lg:col-span-8">
          {/* STEP 1: DATES & GUESTS */}
          {step === 1 && (
            <section className="p-4 sm:p-8 rounded-2xl bg-surface-raised border border-border-subtle shadow-card space-y-5 sm:space-y-6">
              <div>
                <h2 className="font-display text-2xl font-semibold text-text-primary">
                  Select Check-in & Check-out Dates
                </h2>
                <p className="text-sm text-text-secondary mt-1">
                  Check-in starts at 12:00 PM · Check-out until 11:00 AM.
                </p>
              </div>

              <DateRangePicker
                checkIn={checkIn}
                checkOut={checkOut}
                onChange={(a, b) => {
                  setCheckIn(a);
                  setCheckOut(b);
                }}
                error={errors.dates}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SelectField
                  label="Number of Guests"
                  value={String(guests)}
                  onChange={(e) => setGuests(Number(e.target.value))}
                  helperText="Age 18+ primary guest with valid govt. photo ID required."
                >
                  <option value="1">1 Guest (Solo)</option>
                  <option value="2">2 Guests</option>
                  <option value="3">3 Guests (Extra bedding where supported)</option>
                  <option value="4">4 Guests</option>
                </SelectField>

                <InputField
                  label="Promo Code (Optional)"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  placeholder="DIRECT10"
                  helperText={
                    activePromos.length > 0
                      ? `Active codes: ${activePromos.map((p) => p.code).join(', ')}`
                      : undefined
                  }
                />
              </div>

              <div className="pt-4 border-t border-border-subtle flex justify-end">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full sm:w-auto"
                  onClick={() => {
                    if (validateStep1()) setStep(2);
                  }}
                >
                  Continue to Room Selection
                </Button>
              </div>
            </section>
          )}

          {/* STEP 2: ROOM CHOICE */}
          {step === 2 && (
            <section className="p-4 sm:p-8 rounded-2xl bg-surface-raised border border-border-subtle shadow-card space-y-5 sm:space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="font-display text-2xl font-semibold text-text-primary">
                    Choose Available Room Category
                  </h2>
                  <p className="text-sm text-text-secondary mt-1">
                    {formatDisplayDate(checkIn)} to {formatDisplayDate(checkOut)} · {nights} night
                    {nights > 1 ? 's' : ''} · {guests} guest{guests > 1 ? 's' : ''}
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setStep(1)}>
                  Change Dates
                </Button>
              </div>

              {errors.room && (
                <div role="alert" className="p-4 rounded-xl border border-status-error bg-status-error/10 text-sm text-status-error">
                  {errors.room}
                </div>
              )}

              <div className="space-y-4">
                {state.roomTypes.every(
                  (r) => repo.getAvailableCountForRange(r.id, checkIn, checkOut) === 0
                ) ? (
                  <EmptyState
                    title="No rooms are available for these dates"
                    description="No rooms are available for these dates. Try different dates or call +91 257 222 6126."
                    actionLabel="Pick Different Dates"
                    onAction={() => setStep(1)}
                  />
                ) : (
                  state.roomTypes.map((room) => {
                    const count = repo.getAvailableCountForRange(room.id, checkIn, checkOut);
                    const roomQuote = repo.calculateStayQuote(room.id, checkIn, checkOut, promoCode);
                    const isSelected = selectedRoomId === room.id;
                    const soldOut = count <= 0;

                    return (
                      <div
                        key={room.id}
                        className={[
                          'p-4 rounded-xl border transition-all flex flex-col sm:flex-row gap-4 items-stretch',
                          isSelected
                            ? 'border-action-primary bg-surface-base/70 ring-1 ring-action-primary'
                            : 'border-border-subtle bg-surface-raised',
                          soldOut ? 'opacity-60' : '',
                        ].join(' ')}
                      >
                        <div className="sm:w-44 aspect-[16/10] sm:aspect-auto rounded-lg overflow-hidden shrink-0">
                          <SmartImage
                            slot={room.imageSlots[0]}
                            fallbackTitle={room.name}
                            className="w-full h-full min-h-[110px]"
                          />
                        </div>

                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <h3 className="font-display text-lg font-semibold text-text-primary">
                                {room.name}
                              </h3>
                              <span
                                className={`text-xs font-semibold tabular-nums ${
                                  soldOut ? 'text-status-error' : 'text-status-success'
                                }`}
                              >
                                {soldOut ? 'Sold out' : `Only ${count} left`}
                              </span>
                            </div>
                            <p className="text-xs text-text-secondary mt-1">
                              {room.areaSqFt} sq ft · {room.bedConfig} · Up to {room.maxGuests} guests
                            </p>
                            <p className="text-sm text-text-secondary mt-2 line-clamp-2">
                              {room.description}
                            </p>
                          </div>

                          <div className="mt-4 pt-3 border-t border-border-subtle flex flex-wrap items-center justify-between gap-3">
                            {roomQuote && (
                              <div>
                                <p className="font-ui text-lg font-bold text-text-primary tabular-nums">
                                  {formatInr(roomQuote.totalAmount)}{' '}
                                  <span className="text-xs font-normal text-text-secondary">
                                    total incl. GST
                                  </span>
                                </p>
                                <p className="text-xs text-text-secondary tabular-nums">
                                  {formatInr(roomQuote.nightlyRate)} × {nights} night{nights > 1 ? 's' : ''}
                                  {roomQuote.discountAmount > 0
                                    ? ` · Saved ${formatInr(roomQuote.discountAmount)}`
                                    : ''}
                                </p>
                              </div>
                            )}

                            <Button
                              variant={isSelected ? 'primary' : 'secondary'}
                              size="sm"
                              disabled={soldOut}
                              onClick={() => setSelectedRoomId(room.id)}
                            >
                              {isSelected ? 'Selected' : 'Select Room'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="pt-4 border-t border-border-subtle flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <Button variant="secondary" className="w-full sm:w-auto" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full sm:w-auto"
                  onClick={() => {
                    if (validateStep2()) setStep(3);
                  }}
                >
                  Continue to Guest Details
                </Button>
              </div>
            </section>
          )}

          {/* STEP 3: GUEST DETAILS */}
          {step === 3 && (
            <section className="p-4 sm:p-8 rounded-2xl bg-surface-raised border border-border-subtle shadow-card space-y-5">
              <div>
                <h2 className="font-display text-2xl font-semibold text-text-primary">
                  Primary Guest Details
                </h2>
                <p className="text-sm text-text-secondary mt-1">
                  Required for room assignment, WhatsApp confirmation, and GST invoicing.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                  label="Full Name"
                  required
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="e.g. Aniruddha Kulkarni"
                  error={errors.guestName}
                />
                <InputField
                  label="10-Digit Mobile Number"
                  required
                  type="tel"
                  inputMode="numeric"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  placeholder="9823011223"
                  error={errors.guestPhone}
                  helperText="Used for booking lookup and arrival updates."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                  label="Email Address"
                  required
                  type="email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  placeholder="guest@example.in"
                  error={errors.guestEmail}
                />
                <SelectField
                  label="Government Photo ID at Check-in"
                  required
                  value={idType}
                  onChange={(e) => setIdType(e.target.value as Booking['idType'])}
                >
                  <option value="Aadhaar">Aadhaar Card</option>
                  <option value="Passport">Passport</option>
                  <option value="Driving Licence">Driving Licence</option>
                  <option value="Voter ID">Voter ID</option>
                </SelectField>
              </div>

              <TextareaField
                label="Arrival Time & Special Requests (Optional)"
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                placeholder="e.g. Early morning train arrival, non-smoking room, GST company name..."
              />

              <div className="pt-4 border-t border-border-subtle flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <Button variant="secondary" className="w-full sm:w-auto" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full sm:w-auto"
                  onClick={() => {
                    if (validateStep3()) setStep(4);
                  }}
                >
                  Review & Choose Payment
                </Button>
              </div>
            </section>
          )}

          {/* STEP 4: REVIEW & PAYMENT MODE */}
          {step === 4 && selectedRoom && quote && (
            <section className="p-4 sm:p-8 rounded-2xl bg-surface-raised border border-border-subtle shadow-card space-y-5 sm:space-y-6">
              <div>
                <h2 className="font-display text-2xl font-semibold text-text-primary">
                  Review & Payment Preference
                </h2>
                <p className="text-sm text-text-secondary mt-1">
                  Pay directly at the 24-hour hotel reception or pay via UPI QR now.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(['Pay at Hotel', 'UPI'] as const).map((mode) => {
                  const active = paymentMode === mode;
                  return (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setPaymentMode(mode)}
                      className={[
                        'p-4 rounded-xl border text-left cursor-pointer transition-all',
                        active
                          ? 'border-action-primary bg-surface-base ring-1 ring-action-primary'
                          : 'border-border-subtle hover:border-text-secondary/50',
                      ].join(' ')}
                    >
                      <p className="font-semibold text-text-primary">
                        {mode === 'Pay at Hotel'
                          ? 'Pay at Hotel Reception'
                          : 'Instant UPI QR Payment'}
                      </p>
                      <p className="text-xs text-text-secondary mt-1">
                        {mode === 'Pay at Hotel'
                          ? 'Settle via Cash, Card, or UPI upon check-in at 228 Station Rd.'
                          : 'Scan Hotel Ramniwas UPI QR (GPay / PhonePe / Paytm) with instant receipt.'}
                      </p>
                    </button>
                  );
                })}
              </div>

              {paymentMode === 'UPI' && (
                <div className="p-5 rounded-xl bg-surface-base border border-border-subtle flex flex-col sm:flex-row items-center gap-5">
                  <div className="w-28 h-28 rounded-lg bg-surface-raised border border-border-subtle flex items-center justify-center shrink-0">
                    <QrCode className="w-20 h-20 text-text-primary" aria-hidden="true" />
                  </div>
                  <div className="space-y-1 text-sm">
                    <p className="font-semibold text-text-primary">
                      UPI ID: <span className="font-mono">hotelramniwas@upi</span>
                    </p>
                    <p className="text-text-secondary">
                      Amount payable: <strong className="tabular-nums">{formatInr(quote.totalAmount)}</strong>
                    </p>
                    <p className="text-xs text-text-secondary">
                      Confirming below marks this demo UPI reservation as Paid and issues your GST invoice immediately.
                    </p>
                  </div>
                </div>
              )}

              <div className="p-4 rounded-xl bg-surface-base border border-border-subtle text-sm space-y-1.5">
                <p className="font-semibold text-text-primary">Reservation Review</p>
                <p className="text-text-secondary">
                  Guest: <strong className="text-text-primary">{guestName}</strong> ({guestPhone})
                </p>
                <p className="text-text-secondary">
                  Room: <strong className="text-text-primary">{selectedRoom.name}</strong> ·{' '}
                  {formatDisplayDate(checkIn)} → {formatDisplayDate(checkOut)} ({nights} night
                  {nights > 1 ? 's' : ''})
                </p>
                <p className="text-text-secondary">
                  ID Type: {idType} · Guests: {guests}
                </p>
              </div>

              <div className="pt-4 border-t border-border-subtle flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <Button variant="secondary" className="w-full sm:w-auto" onClick={() => setStep(3)}>
                  Back
                </Button>
                <Button
                  variant="primary"
                  size="lg"
                  loading={submitting}
                  className="w-full sm:w-auto"
                  onClick={handleConfirmBooking}
                >
                  Confirm Direct Booking
                </Button>
              </div>
            </section>
          )}

          {/* STEP 5: SUCCESS SCREEN & PRINTABLE CONFIRMATION */}
          {step === 5 && confirmedBooking && selectedRoom && (
            <section className="p-4 sm:p-8 rounded-2xl bg-surface-raised border border-border-subtle shadow-card space-y-5 sm:space-y-6">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-8 h-8 text-status-success shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-status-success">
                    Confirmed · Zero Convenience Fee
                  </p>
                  <h2 className="font-display text-2xl sm:text-3xl font-bold text-text-primary mt-0.5">
                    Booking ID: {confirmedBooking.id}
                  </h2>
                  <p className="text-sm text-text-secondary mt-1">
                    Invoice {confirmedBooking.invoiceNumber} · Assigned Room{' '}
                    {confirmedBooking.roomNumber ?? 'At Front Desk'}
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-surface-base border border-border-subtle grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-text-secondary">Guest Name</p>
                  <p className="font-semibold text-text-primary">{confirmedBooking.guestName}</p>
                </div>
                <div>
                  <p className="text-xs text-text-secondary">Mobile & Email</p>
                  <p className="font-semibold text-text-primary tabular-nums">
                    {confirmedBooking.guestPhone} · {confirmedBooking.guestEmail}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-text-secondary">Check-in (12:00 PM)</p>
                  <p className="font-semibold text-text-primary tabular-nums">
                    {formatDisplayDate(confirmedBooking.checkIn)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-text-secondary">Check-out (11:00 AM)</p>
                  <p className="font-semibold text-text-primary tabular-nums">
                    {formatDisplayDate(confirmedBooking.checkOut)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-text-secondary">Room Category</p>
                  <p className="font-semibold text-text-primary">{selectedRoom.name}</p>
                </div>
                <div>
                  <p className="text-xs text-text-secondary">Total Tariff (incl. GST)</p>
                  <p className="font-bold text-action-primary text-base tabular-nums">
                    {formatInr(confirmedBooking.totalAmount)} ({confirmedBooking.paymentStatus})
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 no-print">
                <Button variant="primary" onClick={() => window.print()}>
                  <Printer className="w-4 h-4" aria-hidden="true" />
                  Print Confirmation / GST Receipt
                </Button>
                <Button
                  variant="secondary"
                  onClick={() =>
                    downloadIcsCalendarFile({
                      bookingId: confirmedBooking.id,
                      roomName: selectedRoom.name,
                      checkIn: confirmedBooking.checkIn,
                      checkOut: confirmedBooking.checkOut,
                      guestName: confirmedBooking.guestName,
                      address: state.siteContent.address,
                    })
                  }
                >
                  <CalendarPlus className="w-4 h-4" aria-hidden="true" />
                  Add to Calendar
                </Button>
                <a
                  href={buildWhatsAppConfirmationUrl(
                    confirmedBooking,
                    selectedRoom.name,
                    state.siteContent.whatsappNumber
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="accent">
                    <MessageCircle className="w-4 h-4" aria-hidden="true" />
                    Share via WhatsApp
                  </Button>
                </a>
                <Link to="/my-booking">
                  <Button variant="ghost">Manage Booking</Button>
                </Link>
              </div>
            </section>
          )}
        </div>

        {/* Tariff Summary Sidebar */}
        <aside className="lg:col-span-4 p-6 rounded-2xl bg-surface-raised border border-border-subtle shadow-card space-y-5 no-print">
          <div>
            <h2 className="font-display text-xl font-semibold text-text-primary">
              Stay Summary
            </h2>
            <p className="text-xs text-text-secondary mt-0.5">
              228 Station Rd, Jalgaon · Est. 1975
            </p>
          </div>

          {selectedRoom && quote ? (
            <>
              <div className="space-y-2.5 text-sm border-t border-border-subtle pt-4">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Room</span>
                  <span className="font-semibold text-text-primary">{selectedRoom.shortName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Dates</span>
                  <span className="font-medium text-text-primary tabular-nums">
                    {formatDisplayDate(checkIn)} – {formatDisplayDate(checkOut)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">
                    Tariff ({quote.nights} night{quote.nights > 1 ? 's' : ''})
                  </span>
                  <span className="font-medium text-text-primary tabular-nums">
                    {formatInr(quote.subtotal)}
                  </span>
                </div>
                {quote.discountAmount > 0 && (
                  <div className="flex justify-between text-status-success">
                    <span className="inline-flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5" aria-hidden="true" />
                      Promo ({quote.appliedPromo?.code})
                    </span>
                    <span className="font-medium tabular-nums">-{formatInr(quote.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-text-secondary">
                    GST ({Math.round(quote.gstRate * 100)}%)
                  </span>
                  <span className="font-medium text-text-primary tabular-nums">
                    {formatInr(quote.gstAmount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">OTA Convenience Fee</span>
                  <span className="font-semibold text-status-success tabular-nums">₹0</span>
                </div>
              </div>

              <div className="pt-4 border-t border-border-subtle flex items-baseline justify-between">
                <span className="font-semibold text-text-primary">Total Payable</span>
                <span className="font-ui text-2xl font-bold text-action-primary tabular-nums">
                  {formatInr(quote.totalAmount)}
                </span>
              </div>
            </>
          ) : (
            <p className="text-sm text-text-secondary">
              Select valid check-in and check-out dates (1–30 nights) to calculate tariff.
            </p>
          )}

          <div className="pt-4 border-t border-border-subtle flex items-start gap-2.5 text-xs text-text-secondary">
            <ShieldCheck className="w-4 h-4 text-status-success shrink-0 mt-0.5" aria-hidden="true" />
            <span>
              Valid government photo ID mandatory at check-in. Free luggage storage & 24-hour reception.
            </span>
          </div>
        </aside>
      </div>
    </div>
  );
}
