import React from 'react';
import { Compass, MapPin, Phone, Plane, ShoppingBag, Train } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { useHotelData } from '../hooks/useRepository';

export function LocationPage() {
  useDocumentMeta(
    'Location & Directions · Hotel Ramniwas, 228 Station Rd, Jalgaon',
    '3-minute walk from Jalgaon Junction Railway Station, walking distance to Navi Peth Market, 9 km from Jalgaon Airport, and gateway to Ajanta Caves.'
  );

  const { state } = useHotelData();
  const site = state.siteContent;

  const distances = [
    {
      icon: Train,
      place: 'Jalgaon Junction Railway Station',
      distance: '3-min walk (~250 m)',
      note: 'Exit towards Station Road / Navi Peth side. Straight walk without needing an auto.',
    },
    {
      icon: ShoppingBag,
      place: 'Navi Peth Commercial Market',
      distance: 'Walking distance',
      note: 'Surrounded by banking hubs, pharmacies, textile showrooms, and local eateries.',
    },
    {
      icon: Plane,
      place: 'Jalgaon Airport (JLG)',
      distance: '9 km (~20 mins)',
      note: 'Front desk arranges punctual airport pickup and drop cabs on request.',
    },
    {
      icon: Compass,
      place: 'Ajanta Caves Gateway',
      distance: '~55 km (~1.5 hrs)',
      note: 'Ideal heritage base for early-morning UNESCO Ajanta Caves departures.',
    },
  ];

  const nearbyAttractions = [
    {
      name: 'Ajanta Caves (UNESCO World Heritage Site)',
      detail: 'Renowned 2nd-century BCE rock-cut Buddhist cave monuments, easily reached via Pahur/Fardapur highway.',
    },
    {
      name: 'Gandhi Research Foundation (Gandhi Teerth)',
      detail: 'Interactive museum and tranquil campus at Jain Hills, ~10 km from the hotel.',
    },
    {
      name: 'Mehrun Lake & Garden',
      detail: 'Popular evening lakeside promenade in Jalgaon city, ~4 km away.',
    },
    {
      name: 'Ichhapurna Ganesh Mandir & Padmalaya',
      detail: 'Revered regional temples accessible by local cab from Station Road.',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10 md:py-14 space-y-10 sm:space-y-14">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-text-accent">
            Plus Code {site.plusCode} · Navi Peth
          </p>
          <h1 className="font-display text-2xl sm:text-4xl font-bold text-text-primary mt-1.5">
            228, Station Road, Jalgaon
          </h1>
          <p className="text-sm sm:text-base text-text-secondary mt-2 leading-relaxed">
            {site.address}. Positioned in the heart of Jalgaon’s transit and business corridor so rail and road travellers arrive effortlessly.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-3">
          <a
            href="https://maps.google.com/?q=Hotel+Ramniwas+228+Station+Rd+Jalgaon+425001"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto"
          >
            <Button variant="primary" size="lg" className="w-full sm:w-auto">
              <MapPin className="w-4 h-4" aria-hidden="true" />
              Directions
            </Button>
          </a>
          <a href={`tel:${site.phonePrimary.replace(/\s+/g, '')}`} className="w-full sm:w-auto">
            <Button variant="secondary" size="lg" className="w-full sm:w-auto">
              <Phone className="w-4 h-4" aria-hidden="true" />
              Call Desk
            </Button>
          </a>
        </div>
      </div>

      {/* Embedded Map */}
      <div className="rounded-2xl overflow-hidden border border-border-subtle shadow-card bg-surface-muted h-[260px] sm:h-[360px] lg:h-[420px]">
        <iframe
          title="Google Map of Hotel Ramniwas at 228 Station Road, Jalgaon"
          src="https://www.google.com/maps?q=228%20Station%20Rd%20Navi%20Peth%20Jaikisan%20Wadi%20Jalgaon%20Maharashtra%20425001&output=embed"
          className="w-full h-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>

      {/* Distance Cards */}
      <section aria-labelledby="distances-heading" className="space-y-6">
        <h2 id="distances-heading" className="font-display text-2xl sm:text-3xl font-bold text-text-primary">
          Transit & Key Distances
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {distances.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.place}
                className="p-5 rounded-xl bg-surface-raised border border-border-subtle shadow-card"
              >
                <div className="w-10 h-10 rounded-lg bg-surface-base border border-border-subtle flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5 text-action-primary" aria-hidden="true" />
                </div>
                <p className="text-xs font-semibold text-text-accent tabular-nums">{item.distance}</p>
                <h3 className="font-display text-lg font-semibold text-text-primary mt-1">
                  {item.place}
                </h3>
                <p className="text-sm text-text-secondary mt-2 leading-relaxed">{item.note}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Nearby Attractions */}
      <section aria-labelledby="attractions-heading" className="space-y-6">
        <h2 id="attractions-heading" className="font-display text-2xl sm:text-3xl font-bold text-text-primary">
          Nearby Attractions & Day Trips
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {nearbyAttractions.map((attr) => (
            <div
              key={attr.name}
              className="p-6 rounded-xl bg-surface-raised border border-border-subtle shadow-card"
            >
              <h3 className="font-display text-xl font-semibold text-text-primary">{attr.name}</h3>
              <p className="text-sm text-text-secondary mt-2 leading-relaxed">{attr.detail}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
