import type {
  Booking,
  BookingStatus,
  Enquiry,
  EnquiryStatus,
  HousekeepingTask,
  PaymentMode,
  PaymentStatus,
  PromoOffer,
  Review,
  ReviewStatus,
  RoomType,
  RoomUnit,
  RoomUnitStatus,
  SiteContent,
  TaskStatus,
} from '../types/hotel';
import {
  INITIAL_BOOKINGS,
  INITIAL_ENQUIRIES,
  INITIAL_HOUSEKEEPING,
  INITIAL_PROMOS,
  INITIAL_REVIEWS,
  INITIAL_ROOM_TYPES,
  INITIAL_ROOM_UNITS,
  INITIAL_SITE_CONTENT,
  TODAY_ISO,
} from './seed';

const STORAGE_KEY = 'ramniwas_hotel_state_v1';

export interface HotelState {
  roomTypes: RoomType[];
  roomUnits: RoomUnit[];
  bookings: Booking[];
  reviews: Review[];
  housekeeping: HousekeepingTask[];
  enquiries: Enquiry[];
  promos: PromoOffer[];
  siteContent: SiteContent;
}

export interface CreateBookingInput {
  roomTypeId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  guestName: string;
  guestPhone: string;
  guestEmail: string;
  idType: Booking['idType'];
  specialRequests: string;
  paymentMode: PaymentMode;
  promoCode?: string;
  source?: Booking['source'];
}

export interface StayQuote {
  nights: number;
  nightlyRate: number;
  subtotal: number;
  discountAmount: number;
  appliedPromo?: PromoOffer;
  gstRate: number;
  gstAmount: number;
  totalAmount: number;
}

/**
 * Repository interface designed for straightforward replacement with Firebase / Supabase.
 */
export interface HotelRepository {
  getState(): HotelState;
  resetDemoData(): HotelState;

  // Availability & Quoting
  getAvailableCountForRange(
    roomTypeId: string,
    checkIn: string,
    checkOut: string,
    excludeBookingId?: string
  ): number;
  getAvailableUnitsForRange(
    roomTypeId: string,
    checkIn: string,
    checkOut: string,
    excludeBookingId?: string
  ): RoomUnit[];
  calculateStayQuote(
    roomTypeId: string,
    checkIn: string,
    checkOut: string,
    promoCode?: string
  ): StayQuote | null;

  // Bookings
  createBooking(input: CreateBookingInput): { ok: true; booking: Booking } | { ok: false; error: string };
  lookupBooking(bookingId: string, phone: string): Booking | null;
  modifyGuestBooking(
    bookingId: string,
    phone: string,
    updates: { checkIn: string; checkOut: string; specialRequests: string }
  ): { ok: true; booking: Booking } | { ok: false; error: string };
  updateBookingStatus(bookingId: string, status: BookingStatus): Booking | null;
  updateBookingPayment(bookingId: string, paymentStatus: PaymentStatus, paymentMode?: PaymentMode): Booking | null;
  autoFlagNoShows(): number;

  // Rooms & Units
  saveRoomType(roomType: RoomType): void;
  deleteRoomType(id: string): boolean;
  updateRoomUnitStatus(roomNumber: string, status: RoomUnitStatus, notes?: string): void;

  // Promos
  savePromo(promo: PromoOffer): void;
  deletePromo(id: string): void;

  // Housekeeping
  createHousekeepingTask(task: Omit<HousekeepingTask, 'id' | 'createdAt'>): HousekeepingTask;
  updateHousekeepingStatus(taskId: string, status: TaskStatus): void;

  // Reviews
  submitReview(input: Omit<Review, 'id' | 'status' | 'createdAt' | 'source'>): Review;
  moderateReview(reviewId: string, status: ReviewStatus, adminReply?: string): void;

  // Enquiries & Room Service
  submitEnquiry(input: Omit<Enquiry, 'id' | 'status' | 'createdAt'>): Enquiry;
  updateEnquiryStatus(enquiryId: string, status: EnquiryStatus): void;

  // Site Content
  updateSiteContent(content: SiteContent): void;
}

export function diffNights(checkIn: string, checkOut: string): number {
  const start = new Date(checkIn + 'T00:00:00');
  const end = new Date(checkOut + 'T00:00:00');
  const ms = end.getTime() - start.getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

function datesOverlap(aStart: string, aEnd: string, bStart: string, bEnd: string): boolean {
  return aStart < bEnd && bStart < aEnd;
}

function getDefaultState(): HotelState {
  return {
    roomTypes: structuredClone(INITIAL_ROOM_TYPES),
    roomUnits: structuredClone(INITIAL_ROOM_UNITS),
    bookings: structuredClone(INITIAL_BOOKINGS),
    reviews: structuredClone(INITIAL_REVIEWS),
    housekeeping: structuredClone(INITIAL_HOUSEKEEPING),
    enquiries: structuredClone(INITIAL_ENQUIRIES),
    promos: structuredClone(INITIAL_PROMOS),
    siteContent: structuredClone(INITIAL_SITE_CONTENT),
  };
}

class LocalStorageHotelRepository implements HotelRepository {
  private load(): HotelState {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        const seed = getDefaultState();
        this.save(seed);
        return seed;
      }
      return JSON.parse(raw) as HotelState;
    } catch {
      const seed = getDefaultState();
      this.save(seed);
      return seed;
    }
  }

  private save(state: HotelState): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(new CustomEvent('ramniwas:data-updated'));
  }

  getState(): HotelState {
    return this.load();
  }

  resetDemoData(): HotelState {
    const fresh = getDefaultState();
    this.save(fresh);
    return fresh;
  }

  getAvailableUnitsForRange(
    roomTypeId: string,
    checkIn: string,
    checkOut: string,
    excludeBookingId?: string
  ): RoomUnit[] {
    const state = this.load();
    const units = state.roomUnits.filter(
      (u) => u.roomTypeId === roomTypeId && u.status !== 'Maintenance'
    );
    const activeBookings = state.bookings.filter(
      (b) =>
        b.id !== excludeBookingId &&
        b.roomTypeId === roomTypeId &&
        b.status !== 'Cancelled' &&
        b.status !== 'Checked-out' &&
        b.status !== 'No-show' &&
        datesOverlap(checkIn, checkOut, b.checkIn, b.checkOut)
    );

    const assignedRoomNumbers = new Set(
      activeBookings.map((b) => b.roomNumber).filter(Boolean) as string[]
    );
    const unassignedCount = activeBookings.filter((b) => !b.roomNumber).length;

    const freeUnits = units.filter((u) => !assignedRoomNumbers.has(u.roomNumber));
    const remainingSlots = Math.max(0, freeUnits.length - unassignedCount);
    return freeUnits.slice(0, remainingSlots);
  }

  getAvailableCountForRange(
    roomTypeId: string,
    checkIn: string,
    checkOut: string,
    excludeBookingId?: string
  ): number {
    const state = this.load();
    const roomType = state.roomTypes.find((r) => r.id === roomTypeId);
    if (!roomType) return 0;

    const unitsForType = state.roomUnits.filter(
      (u) => u.roomTypeId === roomTypeId && u.status !== 'Maintenance'
    );
    const effectiveTotal = Math.max(roomType.totalInventory, unitsForType.length) -
      state.roomUnits.filter((u) => u.roomTypeId === roomTypeId && u.status === 'Maintenance').length;

    const overlappingCount = state.bookings.filter(
      (b) =>
        b.id !== excludeBookingId &&
        b.roomTypeId === roomTypeId &&
        b.status !== 'Cancelled' &&
        b.status !== 'Checked-out' &&
        b.status !== 'No-show' &&
        datesOverlap(checkIn, checkOut, b.checkIn, b.checkOut)
    ).length;

    return Math.max(0, effectiveTotal - overlappingCount);
  }

  calculateStayQuote(
    roomTypeId: string,
    checkIn: string,
    checkOut: string,
    promoCode?: string
  ): StayQuote | null {
    const state = this.load();
    const roomType = state.roomTypes.find((r) => r.id === roomTypeId);
    if (!roomType) return null;
    const nights = diffNights(checkIn, checkOut);
    if (nights < 1 || nights > 30) return null;

    // Check active weekend/seasonal multiplier from active offers if applicable
    const checkInDay = new Date(checkIn + 'T00:00:00').getDay();
    const isWeekend = checkInDay === 5 || checkInDay === 6;
    const baseMultiplier = isWeekend ? 1.05 : 1;
    const nightlyRate = Math.round((roomType.baseRate * baseMultiplier) / 10) * 10;
    const subtotal = nightlyRate * nights;

    const normalizedCode = promoCode?.trim().toUpperCase();
    const appliedPromo = normalizedCode
      ? state.promos.find((p) => p.active && p.code.toUpperCase() === normalizedCode)
      : undefined;

    const discountAmount = appliedPromo
      ? Math.round((subtotal * appliedPromo.discountPercent) / 100)
      : 0;
    const taxable = Math.max(0, subtotal - discountAmount);
    const gstRate = nightlyRate > 1000 ? 0.12 : 0;
    const gstAmount = Math.round(taxable * gstRate);
    const totalAmount = taxable + gstAmount;

    return {
      nights,
      nightlyRate,
      subtotal,
      discountAmount,
      appliedPromo,
      gstRate,
      gstAmount,
      totalAmount,
    };
  }

  createBooking(
    input: CreateBookingInput
  ): { ok: true; booking: Booking } | { ok: false; error: string } {
    const nights = diffNights(input.checkIn, input.checkOut);
    if (nights < 1) {
      return { ok: false, error: 'Check-out must be after check-in.' };
    }
    if (nights > 30) {
      return { ok: false, error: 'Maximum stay per online booking is 30 nights. Please call +91 257 222 6126 for extended stays.' };
    }

    const available = this.getAvailableCountForRange(
      input.roomTypeId,
      input.checkIn,
      input.checkOut
    );
    if (available <= 0) {
      return {
        ok: false,
        error: 'No rooms are available for these dates. Try different dates or call +91 257 222 6126.',
      };
    }

    const quote = this.calculateStayQuote(
      input.roomTypeId,
      input.checkIn,
      input.checkOut,
      input.promoCode
    );
    if (!quote) {
      return { ok: false, error: 'Selected room category could not be priced.' };
    }

    const state = this.load();
    const freeUnits = this.getAvailableUnitsForRange(
      input.roomTypeId,
      input.checkIn,
      input.checkOut
    );
    const assignedUnit = freeUnits[0]?.roomNumber;

    const seq = 1001 + state.bookings.length + Math.floor(Math.random() * 90);
    const id = `RN-${new Date().getFullYear()}-${seq}`;
    const invoiceNumber = `INV-RN-${seq}`;
    const nowIso = new Date().toISOString();

    const booking: Booking = {
      id,
      invoiceNumber,
      roomTypeId: input.roomTypeId,
      roomNumber: assignedUnit,
      checkIn: input.checkIn,
      checkOut: input.checkOut,
      nights: quote.nights,
      guests: input.guests,
      guestName: input.guestName.trim(),
      guestPhone: input.guestPhone.replace(/\D/g, '').slice(-10),
      guestEmail: input.guestEmail.trim(),
      idType: input.idType,
      specialRequests: input.specialRequests.trim(),
      nightlyRate: quote.nightlyRate,
      subtotal: quote.subtotal,
      discountAmount: quote.discountAmount,
      promoCode: quote.appliedPromo?.code,
      gstRate: quote.gstRate,
      gstAmount: quote.gstAmount,
      totalAmount: quote.totalAmount,
      // Automation: Auto-confirm when inventory is available
      status: 'Confirmed',
      paymentStatus: input.paymentMode === 'UPI' || input.paymentMode === 'Card' ? 'Paid' : 'Unpaid',
      paymentMode: input.paymentMode,
      source: input.source ?? 'Direct Web',
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    state.bookings.unshift(booking);
    this.save(state);
    return { ok: true, booking };
  }

  lookupBooking(bookingId: string, phone: string): Booking | null {
    const state = this.load();
    const normId = bookingId.trim().toUpperCase();
    const normPhone = phone.replace(/\D/g, '').slice(-10);
    return (
      state.bookings.find(
        (b) => b.id.toUpperCase() === normId && b.guestPhone.slice(-10) === normPhone
      ) ?? null
    );
  }

  modifyGuestBooking(
    bookingId: string,
    phone: string,
    updates: { checkIn: string; checkOut: string; specialRequests: string }
  ): { ok: true; booking: Booking } | { ok: false; error: string } {
    const state = this.load();
    const normPhone = phone.replace(/\D/g, '').slice(-10);
    const idx = state.bookings.findIndex(
      (b) => b.id.toUpperCase() === bookingId.trim().toUpperCase() && b.guestPhone.slice(-10) === normPhone
    );
    if (idx === -1) {
      return { ok: false, error: 'Booking not found for these credentials.' };
    }
    const existing = state.bookings[idx];
    if (existing.status === 'Cancelled' || existing.status === 'Checked-out') {
      return { ok: false, error: `Bookings in "${existing.status}" status cannot be modified.` };
    }
    const nights = diffNights(updates.checkIn, updates.checkOut);
    if (nights < 1 || nights > 30) {
      return { ok: false, error: 'Check-out must be 1 to 30 nights after check-in.' };
    }
    const available = this.getAvailableCountForRange(
      existing.roomTypeId,
      updates.checkIn,
      updates.checkOut,
      existing.id
    );
    if (available <= 0) {
      return { ok: false, error: 'No rooms are available for the requested new dates.' };
    }
    const quote = this.calculateStayQuote(
      existing.roomTypeId,
      updates.checkIn,
      updates.checkOut,
      existing.promoCode
    );
    if (!quote) {
      return { ok: false, error: 'Could not recalculate tariff.' };
    }

    const updated: Booking = {
      ...existing,
      checkIn: updates.checkIn,
      checkOut: updates.checkOut,
      nights: quote.nights,
      nightlyRate: quote.nightlyRate,
      subtotal: quote.subtotal,
      discountAmount: quote.discountAmount,
      gstAmount: quote.gstAmount,
      totalAmount: quote.totalAmount,
      specialRequests: updates.specialRequests.trim(),
      updatedAt: new Date().toISOString(),
    };
    state.bookings[idx] = updated;
    this.save(state);
    return { ok: true, booking: updated };
  }

  updateBookingStatus(bookingId: string, status: BookingStatus): Booking | null {
    const state = this.load();
    const idx = state.bookings.findIndex((b) => b.id === bookingId);
    if (idx === -1) return null;

    const prev = state.bookings[idx];
    const updated: Booking = {
      ...prev,
      status,
      updatedAt: new Date().toISOString(),
    };

    // Automation: Assign / update room unit & create housekeeping task on checkout
    if (status === 'Checked-in') {
      if (!updated.roomNumber) {
        const free = this.getAvailableUnitsForRange(
          updated.roomTypeId,
          updated.checkIn,
          updated.checkOut,
          updated.id
        );
        if (free[0]) {
          updated.roomNumber = free[0].roomNumber;
        }
      }
      if (updated.roomNumber) {
        const unit = state.roomUnits.find((u) => u.roomNumber === updated.roomNumber);
        if (unit) unit.status = 'Occupied';
      }
    } else if (status === 'Checked-out') {
      if (updated.roomNumber) {
        const unit = state.roomUnits.find((u) => u.roomNumber === updated.roomNumber);
        if (unit) {
          unit.status = 'Cleaning';
          // Auto-create housekeeping task if none pending for this room
          const hasOpenTask = state.housekeeping.some(
            (t) => t.roomNumber === unit.roomNumber && t.status !== 'Done'
          );
          if (!hasOpenTask) {
            state.housekeeping.unshift({
              id: `hk-${Date.now()}`,
              roomNumber: unit.roomNumber,
              floor: unit.floor,
              taskType: 'Checkout Cleaning',
              status: 'Pending',
              assignedTo: 'Floor Attendant',
              notes: `Auto-generated on checkout of ${updated.guestName} (${updated.id})`,
              createdAt: new Date().toISOString(),
            });
          }
        }
      }
    } else if (status === 'Cancelled' || status === 'No-show') {
      if (updated.roomNumber) {
        const unit = state.roomUnits.find((u) => u.roomNumber === updated.roomNumber);
        if (unit && unit.status === 'Occupied') {
          unit.status = 'Available';
        }
      }
    }

    state.bookings[idx] = updated;
    this.save(state);
    return updated;
  }

  updateBookingPayment(
    bookingId: string,
    paymentStatus: PaymentStatus,
    paymentMode?: PaymentMode
  ): Booking | null {
    const state = this.load();
    const idx = state.bookings.findIndex((b) => b.id === bookingId);
    if (idx === -1) return null;
    state.bookings[idx] = {
      ...state.bookings[idx],
      paymentStatus,
      paymentMode: paymentMode ?? state.bookings[idx].paymentMode,
      updatedAt: new Date().toISOString(),
    };
    this.save(state);
    return state.bookings[idx];
  }

  autoFlagNoShows(): number {
    const state = this.load();
    let count = 0;
    state.bookings = state.bookings.map((b) => {
      if (b.status === 'Confirmed' && b.checkIn < TODAY_ISO) {
        count++;
        return { ...b, status: 'No-show', updatedAt: new Date().toISOString() };
      }
      return b;
    });
    if (count > 0) this.save(state);
    return count;
  }

  saveRoomType(roomType: RoomType): void {
    const state = this.load();
    const idx = state.roomTypes.findIndex((r) => r.id === roomType.id);
    if (idx >= 0) {
      state.roomTypes[idx] = roomType;
    } else {
      state.roomTypes.push(roomType);
    }
    this.save(state);
  }

  deleteRoomType(id: string): boolean {
    const state = this.load();
    const hasActive = state.bookings.some(
      (b) => b.roomTypeId === id && (b.status === 'Confirmed' || b.status === 'Checked-in')
    );
    if (hasActive) return false;
    state.roomTypes = state.roomTypes.filter((r) => r.id !== id);
    this.save(state);
    return true;
  }

  updateRoomUnitStatus(roomNumber: string, status: RoomUnitStatus, notes?: string): void {
    const state = this.load();
    const unit = state.roomUnits.find((u) => u.roomNumber === roomNumber);
    if (!unit) return;
    unit.status = status;
    if (notes !== undefined) unit.notes = notes;
    this.save(state);
  }

  savePromo(promo: PromoOffer): void {
    const state = this.load();
    const idx = state.promos.findIndex((p) => p.id === promo.id);
    if (idx >= 0) {
      state.promos[idx] = promo;
    } else {
      state.promos.push(promo);
    }
    this.save(state);
  }

  deletePromo(id: string): void {
    const state = this.load();
    state.promos = state.promos.filter((p) => p.id !== id);
    this.save(state);
  }

  createHousekeepingTask(task: Omit<HousekeepingTask, 'id' | 'createdAt'>): HousekeepingTask {
    const state = this.load();
    const created: HousekeepingTask = {
      ...task,
      id: `hk-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    state.housekeeping.unshift(created);
    this.save(state);
    return created;
  }

  updateHousekeepingStatus(taskId: string, status: TaskStatus): void {
    const state = this.load();
    const task = state.housekeeping.find((t) => t.id === taskId);
    if (!task) return;
    task.status = status;
    if (status === 'Done') {
      task.completedAt = new Date().toISOString();
      const unit = state.roomUnits.find((u) => u.roomNumber === task.roomNumber);
      if (unit && (unit.status === 'Cleaning' || unit.status === 'Maintenance')) {
        unit.status = 'Available';
      }
    }
    this.save(state);
  }

  submitReview(input: Omit<Review, 'id' | 'status' | 'createdAt' | 'source'>): Review {
    const state = this.load();
    const review: Review = {
      ...input,
      id: `rev-${Date.now()}`,
      status: 'Pending',
      source: 'Direct',
      createdAt: new Date().toISOString().slice(0, 10),
    };
    state.reviews.unshift(review);
    this.save(state);
    return review;
  }

  moderateReview(reviewId: string, status: ReviewStatus, adminReply?: string): void {
    const state = this.load();
    const review = state.reviews.find((r) => r.id === reviewId);
    if (!review) return;
    review.status = status;
    if (adminReply !== undefined) review.adminReply = adminReply;
    this.save(state);
  }

  submitEnquiry(input: Omit<Enquiry, 'id' | 'status' | 'createdAt'>): Enquiry {
    const state = this.load();
    const enquiry: Enquiry = {
      ...input,
      id: `enq-${Date.now()}`,
      status: 'New',
      createdAt: new Date().toISOString(),
    };
    state.enquiries.unshift(enquiry);
    this.save(state);
    return enquiry;
  }

  updateEnquiryStatus(enquiryId: string, status: EnquiryStatus): void {
    const state = this.load();
    const item = state.enquiries.find((e) => e.id === enquiryId);
    if (!item) return;
    item.status = status;
    this.save(state);
  }

  updateSiteContent(content: SiteContent): void {
    const state = this.load();
    state.siteContent = content;
    this.save(state);
  }
}

export const hotelRepo: HotelRepository = new LocalStorageHotelRepository();

export function buildWhatsAppConfirmationUrl(
  booking: Booking,
  roomName: string,
  whatsappNumber = '918888309656'
): string {
  const msg = [
    `Namaste from Hotel Ramniwas, Jalgaon!`,
    `Booking ID: ${booking.id}`,
    `Guest: ${booking.guestName}`,
    `Room: ${roomName}${booking.roomNumber ? ` (Room ${booking.roomNumber})` : ''}`,
    `Check-in: ${booking.checkIn} (12:00 PM)`,
    `Check-out: ${booking.checkOut} (11:00 AM)`,
    `Total Tariff (incl. GST): ₹${booking.totalAmount.toLocaleString('en-IN')}`,
    `Address: 228, Station Rd, Navi Peth, Jalgaon (3-min walk from Jalgaon Junction)`,
  ].join('\n');
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(msg)}`;
}

export function buildMailtoConfirmationUrl(booking: Booking, roomName: string): string {
  const subject = `Hotel Ramniwas Booking Confirmation · ${booking.id}`;
  const body = [
    `Dear ${booking.guestName},`,
    ``,
    `Thank you for booking directly with Hotel Ramniwas, Jalgaon.`,
    ``,
    `Booking ID: ${booking.id}`,
    `Invoice No: ${booking.invoiceNumber}`,
    `Room Category: ${roomName}`,
    `Check-in: ${booking.checkIn} from 12:00 PM`,
    `Check-out: ${booking.checkOut} until 11:00 AM`,
    `Guests: ${booking.guests}`,
    `Total (incl. GST): INR ${booking.totalAmount.toLocaleString('en-IN')}`,
    `Payment Status: ${booking.paymentStatus} (${booking.paymentMode})`,
    ``,
    `Address: 228, Station Rd, Navi Peth, Jaikisan Wadi, Jalgaon 425001`,
    `Front Desk: +91 257 222 6126 / +91 88883 09656`,
  ].join('\n');
  return `mailto:${booking.guestEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function exportBookingsToCsv(bookings: Booking[], roomTypes: RoomType[]): string {
  const roomMap = new Map(roomTypes.map((r) => [r.id, r.name]));
  const headers = [
    'Booking ID',
    'Invoice',
    'Guest Name',
    'Phone',
    'Email',
    'Room Category',
    'Room No',
    'Check-in',
    'Check-out',
    'Nights',
    'Subtotal',
    'Discount',
    'GST',
    'Total INR',
    'Status',
    'Payment Status',
    'Payment Mode',
    'Source',
  ];
  const rows = bookings.map((b) => [
    b.id,
    b.invoiceNumber,
    b.guestName,
    b.guestPhone,
    b.guestEmail,
    roomMap.get(b.roomTypeId) ?? b.roomTypeId,
    b.roomNumber ?? 'Unassigned',
    b.checkIn,
    b.checkOut,
    String(b.nights),
    String(b.subtotal),
    String(b.discountAmount),
    String(b.gstAmount),
    String(b.totalAmount),
    b.status,
    b.paymentStatus,
    b.paymentMode,
    b.source,
  ]);
  return [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');
}
