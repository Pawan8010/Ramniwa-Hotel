export type Language = 'en' | 'hi' | 'mr';

export type RoomCategory = 'ac-king' | 'ac-twin' | 'non-ac' | 'sharing';

export type RoomUnitStatus = 'Available' | 'Occupied' | 'Cleaning' | 'Maintenance';

export type BookingStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Checked-in'
  | 'Checked-out'
  | 'Cancelled'
  | 'No-show';

export type PaymentStatus = 'Unpaid' | 'Paid' | 'Partial';

export type PaymentMode = 'Pay at Hotel' | 'UPI' | 'Card' | 'Cash';

export type ReviewStatus = 'Pending' | 'Approved' | 'Rejected';

export type TaskStatus = 'Pending' | 'In Progress' | 'Done';

export type EnquiryStatus = 'New' | 'In Progress' | 'Resolved';

export type AssetSlotKey =
  | 'hero-video'
  | 'hero-poster'
  | 'room-ac-king-1'
  | 'room-ac-king-2'
  | 'room-ac-king-3'
  | 'room-ac-king-4'
  | 'room-ac-king-5'
  | 'room-ac-twin-1'
  | 'room-ac-twin-2'
  | 'room-nonac-1'
  | 'room-sharing-1'
  | 'restaurant-1'
  | 'restaurant-2'
  | 'lobby-1'
  | 'lobby-2'
  | 'exterior-1'
  | 'exterior-2'
  | 'gallery-lift';

export interface AssetItem {
  id: string;
  slot: AssetSlotKey;
  category: 'hero' | 'room-ac-king' | 'room-ac-twin' | 'room-nonac' | 'room-sharing' | 'restaurant' | 'lobby' | 'exterior' | 'gallery';
  label: string;
  src: string;
  alt: string;
  width: number;
  height: number;
  focalPoint: string;
  order: number;
  isVideo?: boolean;
  sizeBytes?: number;
}

export interface RoomType {
  id: string;
  slug: RoomCategory;
  name: string;
  shortName: string;
  filterGroup: 'AC Deluxe' | 'Non-AC' | 'Solo Sharing';
  areaSqFt: number;
  bedConfig: string;
  maxGuests: number;
  baseRate: number;
  minTariff: number;
  maxTariff: number;
  totalInventory: number;
  amenities: string[];
  description: string;
  imageSlots: AssetSlotKey[];
  isPerPerson?: boolean;
}

export interface RoomUnit {
  roomNumber: string;
  floor: 1 | 2 | 3 | 4;
  roomTypeId: string;
  status: RoomUnitStatus;
  notes?: string;
}

export interface Booking {
  id: string;
  invoiceNumber: string;
  roomTypeId: string;
  roomNumber?: string;
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  nights: number;
  guests: number;
  guestName: string;
  guestPhone: string;
  guestEmail: string;
  idType: 'Aadhaar' | 'Passport' | 'Driving Licence' | 'Voter ID';
  specialRequests: string;
  nightlyRate: number;
  subtotal: number;
  discountAmount: number;
  promoCode?: string;
  gstRate: number;
  gstAmount: number;
  totalAmount: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  paymentMode: PaymentMode;
  source: 'Direct Web' | 'Walk-in' | 'Phone';
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  guestName: string;
  rating: number;
  roomStayed: string;
  comment: string;
  photoDataUrl?: string;
  status: ReviewStatus;
  adminReply?: string;
  source: 'Direct' | 'Google' | 'Justdial' | 'Tripadvisor';
  createdAt: string;
}

export interface HousekeepingTask {
  id: string;
  roomNumber: string;
  floor: number;
  taskType: 'Checkout Cleaning' | 'Deep Clean' | 'Maintenance' | 'Linen Refresh';
  status: TaskStatus;
  assignedTo: string;
  notes: string;
  createdAt: string;
  completedAt?: string;
}

export interface Enquiry {
  id: string;
  type: 'General Enquiry' | 'Room Service';
  guestName: string;
  phone: string;
  email?: string;
  roomNumber?: string;
  subject: string;
  message: string;
  items?: { name: string; qty: number; price: number }[];
  totalAmount?: number;
  status: EnquiryStatus;
  createdAt: string;
}

export interface PromoOffer {
  id: string;
  code: string;
  title: string;
  description: string;
  discountPercent: number;
  weekendMultiplier: number;
  seasonalMultiplier: number;
  active: boolean;
}

export interface DiningMenuItem {
  id: string;
  name: string;
  category: 'Breakfast' | 'Main Course' | 'High Tea & Snacks' | 'Beverages';
  price: number;
  description: string;
  isJainAvailable?: boolean;
}

export interface SiteContent {
  hotelName: string;
  tagline: string;
  heroHeadline: string;
  heroSubheadline: string;
  address: string;
  plusCode: string;
  phonePrimary: string;
  phoneSecondary: string;
  email: string;
  whatsappNumber: string;
  checkInTime: string;
  checkOutTime: string;
  diningHighlight: string;
  directBookingPerks: string;
}
