import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

export function PrivacyPage() {
  useDocumentMeta(
    'Privacy Policy · Hotel Ramniwas, Jalgaon',
    'Guest privacy, Aadhaar/ID handling, and booking record practices at Hotel Ramniwas, Jalgaon.'
  );

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-6">
      <h1 className="font-display text-3xl sm:text-4xl font-bold text-text-primary">
        Privacy Policy
      </h1>
      <p className="text-sm text-text-secondary">Effective Date: January 2026 · Hotel Ramniwas, Jalgaon</p>
      <div className="space-y-4 text-sm text-text-primary leading-relaxed">
        <p>
          Hotel Ramniwas collects guest names, contact phone numbers, email addresses, and statutory government photo identification details solely to confirm room reservations, comply with Indian hospitality register regulations, and issue GST invoices.
        </p>
        <p>
          We never sell or share guest contact details with third-party marketing brokers. Direct bookings made through this website store your reservation details securely for front-desk check-in and self-service lookup via Booking ID and phone number.
        </p>
        <p>
          For data correction or deletion requests, please contact our front desk at{' '}
          <a href="tel:+912572226126" className="text-action-primary underline">
            +91 257 222 6126
          </a>{' '}
          or write to reservations@hotelramniwas.in.
        </p>
      </div>
    </article>
  );
}

export function TermsPage() {
  useDocumentMeta(
    'Terms & House Rules · Hotel Ramniwas, Jalgaon',
    'Check-in, check-out, identification, non-smoking, pet policy, and payment terms for Hotel Ramniwas, Jalgaon.'
  );

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-6">
      <h1 className="font-display text-3xl sm:text-4xl font-bold text-text-primary">
        Terms & House Rules
      </h1>
      <ul className="space-y-3 text-sm text-text-primary leading-relaxed list-disc pl-5">
        <li>Standard check-in time is 12:00 PM and check-out time is 11:00 AM.</li>
        <li>Primary guests must be 18 years or older. Valid government-issued photo ID (Aadhaar, Passport, Driving Licence, or Voter ID) is mandatory for all adult occupants at check-in.</li>
        <li>Pets are not permitted anywhere on the hotel premises.</li>
        <li>Non-smoking rooms are available on request; smoking inside designated non-smoking rooms incurs a cleaning fee.</li>
        <li>Payments are accepted in Cash, Credit/Debit Cards, and UPI. Official GST invoices are provided at checkout.</li>
        <li>Cancellations made prior to check-in date via the Manage Booking portal or front desk release your room immediately without penalty for Pay-at-Hotel reservations.</li>
      </ul>
    </article>
  );
}

export function NotFoundPage() {
  useDocumentMeta(
    'Page Not Found · Hotel Ramniwas, Jalgaon',
    'The page you requested could not be found on Hotel Ramniwas.'
  );

  return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-5">
      <p className="font-display text-5xl font-bold text-action-primary">404</p>
      <h1 className="font-display text-3xl font-bold text-text-primary">
        This Room Page Was Not Found
      </h1>
      <p className="text-sm text-text-secondary">
        The link may have moved, or the address may be mistyped. Explore our rooms or head back to the front desk.
      </p>
      <div className="flex flex-wrap justify-center gap-3 pt-2">
        <Link to="/">
          <Button variant="primary">Return Home</Button>
        </Link>
        <Link to="/rooms">
          <Button variant="secondary">View Rooms</Button>
        </Link>
      </div>
    </div>
  );
}
