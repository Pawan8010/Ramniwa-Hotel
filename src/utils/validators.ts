export function isValidIndianMobile(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  const normalized = digits.length === 12 && digits.startsWith('91') ? digits.slice(2) : digits;
  return /^[6-9]\d{9}$/.test(normalized);
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

export function formatInr(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function formatDisplayDate(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function getRelativeIsoDate(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

export function downloadIcsCalendarFile(params: {
  bookingId: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  guestName: string;
  address: string;
}): void {
  const start = params.checkIn.replace(/-/g, '') + 'T120000';
  const end = params.checkOut.replace(/-/g, '') + 'T110000';
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Hotel Ramniwas Jalgaon//Booking//EN',
    'BEGIN:VEVENT',
    `UID:${params.bookingId}@hotelramniwas.in`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:Stay at Hotel Ramniwas (${params.roomName}) - ${params.bookingId}`,
    `DESCRIPTION:Guest: ${params.guestName}\\nCheck-in: 12:00 PM | Check-out: 11:00 AM\\nFront Desk: +91 257 222 6126`,
    `LOCATION:${params.address}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Hotel-Ramniwas-${params.bookingId}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
