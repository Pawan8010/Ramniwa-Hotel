import React, { useState } from 'react';
import { Clock, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { InputField, TextareaField } from '../components/ui/FormField';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { useHotelData } from '../hooks/useRepository';
import { useToast } from '../hooks/useToast';
import { isValidEmail, isValidIndianMobile } from '../utils/validators';

export function ContactPage() {
  useDocumentMeta(
    'Contact & 24x7 Reception · Hotel Ramniwas, Jalgaon',
    'Call +91 257 222 6126 or +91 88883 09656, message on WhatsApp, or send a group booking enquiry to Hotel Ramniwas, 228 Station Rd, Jalgaon.'
  );

  const { state, repo } = useHotelData();
  const { showToast } = useToast();
  const site = state.siteContent;

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (name.trim().length < 2) next.name = 'Enter your full name.';
    if (!isValidIndianMobile(phone)) next.phone = 'Enter a valid 10-digit Indian mobile number.';
    if (email.trim() && !isValidEmail(email)) next.email = 'Enter a valid email address.';
    if (subject.trim().length < 3) next.subject = 'Enter a brief subject.';
    if (message.trim().length < 8) next.message = 'Please enter your enquiry details.';
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    repo.submitEnquiry({
      type: 'General Enquiry',
      guestName: name.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      subject: subject.trim(),
      message: message.trim(),
    });

    setName('');
    setPhone('');
    setEmail('');
    setSubject('');
    setMessage('');
    showToast({
      tone: 'success',
      title: 'Enquiry received by front desk',
      description: 'Our reception team will respond shortly by phone or WhatsApp.',
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 md:py-14 space-y-12">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-wider text-text-accent">
          24×7 Reception & Reservation Desk
        </p>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-text-primary mt-1.5">
          Contact Hotel Ramniwas
        </h1>
        <p className="text-base text-text-secondary mt-2 leading-relaxed">
          Reach us round the clock for early train check-ins, group bookings, Ajanta cab hire, or corporate GST tie-ups.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-5 space-y-5">
          <div className="p-6 rounded-2xl bg-surface-raised border border-border-subtle shadow-card space-y-5">
            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-action-primary shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <h2 className="font-semibold text-text-primary">Direct Front Desk Phones</h2>
                <div className="mt-2 flex flex-col gap-2">
                  <a
                    href={`tel:${site.phonePrimary.replace(/\s+/g, '')}`}
                    className="text-base font-semibold text-action-primary hover:underline tabular-nums"
                  >
                    {site.phonePrimary} (Landline)
                  </a>
                  <a
                    href={`tel:${site.phoneSecondary.replace(/\s+/g, '')}`}
                    className="text-base font-semibold text-action-primary hover:underline tabular-nums"
                  >
                    {site.phoneSecondary} (Mobile / WhatsApp)
                  </a>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 pt-4 border-t border-border-subtle">
              <MapPin className="w-5 h-5 text-action-primary shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <h2 className="font-semibold text-text-primary">Address</h2>
                <p className="text-sm text-text-secondary mt-1">
                  {site.address} · Plus Code {site.plusCode}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 pt-4 border-t border-border-subtle">
              <Clock className="w-5 h-5 text-action-primary shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <h2 className="font-semibold text-text-primary">Hours & Check-in</h2>
                <p className="text-sm text-text-secondary mt-1">
                  Reception Open 24×7 · Check-in {site.checkInTime} · Check-out {site.checkOutTime}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 pt-4 border-t border-border-subtle">
              <Mail className="w-5 h-5 text-action-primary shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <h2 className="font-semibold text-text-primary">Email</h2>
                <a href={`mailto:${site.email}`} className="text-sm text-action-primary hover:underline">
                  {site.email}
                </a>
              </div>
            </div>

            <div className="pt-2">
              <a
                href={`https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(
                  'Namaste Hotel Ramniwas, I have a question regarding my stay in Jalgaon.'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Button variant="accent" size="lg" className="w-full">
                  <MessageCircle className="w-4 h-4" aria-hidden="true" />
                  Message on WhatsApp
                </Button>
              </a>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="lg:col-span-7 p-6 sm:p-8 rounded-2xl bg-surface-raised border border-border-subtle shadow-card space-y-5"
        >
          <h2 className="font-display text-2xl font-bold text-text-primary">
            Send an Enquiry to Front Desk
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              label="Full Name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={errors.name}
            />
            <InputField
              label="10-Digit Mobile Number"
              required
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              error={errors.phone}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              label="Email Address (Optional)"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
            />
            <InputField
              label="Subject"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Early morning check-in / Group stay"
              error={errors.subject}
            />
          </div>

          <TextareaField
            label="Message"
            required
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Mention check-in date, train timing, or room count..."
            error={errors.message}
          />

          <Button type="submit" variant="primary" size="lg" className="w-full sm:w-auto">
            Send Enquiry
          </Button>
        </form>
      </div>

      <div className="rounded-2xl overflow-hidden border border-border-subtle shadow-card h-[260px] sm:h-[360px] bg-surface-muted">
        <iframe
          title="Map to Hotel Ramniwas Jalgaon"
          src="https://www.google.com/maps?q=228%20Station%20Rd%20Navi%20Peth%20Jaikisan%20Wadi%20Jalgaon%20Maharashtra%20425001&output=embed"
          className="w-full h-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </div>
  );
}
