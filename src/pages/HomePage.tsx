import React, { useRef, useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Camera,
  Car,
  Clock,
  MapPin,
  Pause,
  Play,
  Phone,
  ShieldCheck,
  Star,
  Stethoscope,
  Utensils,
  Wifi,
  Zap,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { RoomCard } from '../components/room/RoomCard';
import { RoomDetailsModal } from '../components/room/RoomDetailsModal';
import { AnimatedCounter } from '../components/ui/AnimatedCounter';
import { Button } from '../components/ui/Button';
import { DateRangePicker } from '../components/ui/DateRangePicker';
import { Lightbox } from '../components/ui/Lightbox';
import { SmartImage } from '../components/ui/SmartImage';
import { getAssetBySlot } from '../data/assets';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { useLanguage } from '../hooks/useLanguage';
import { useHotelData } from '../hooks/useRepository';
import type { RoomType } from '../types/hotel';
import { getRelativeIsoDate } from '../utils/validators';

const REVEAL_TRANSITION = { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const };

export function HomePage() {
  useDocumentMeta(
    'Hotel Ramniwas · Heritage Hotel Steps from Jalgaon Junction (Est. 1975)',
    'Book direct at Hotel Ramniwas, 228 Station Rd, Jalgaon. AC Deluxe & Non-AC rooms, pure veg dining, lift, parking, 3 minutes from Jalgaon Junction.'
  );

  const navigate = useNavigate();
  const { t, lang, setLang } = useLanguage();
  const { state, assets, repo } = useHotelData();
  const site = state.siteContent;

  const videoRef = useRef<HTMLVideoElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  const [videoPlaying, setVideoPlaying] = useState(true);
  const [checkIn, setCheckIn] = useState(() => getRelativeIsoDate(0));
  const [checkOut, setCheckOut] = useState(() => getRelativeIsoDate(1));
  const [selectedRoomId, setSelectedRoomId] = useState<string>(state.roomTypes[0]?.id ?? 'rt-ac-king');
  const [guests, setGuests] = useState<number>(2);
  const [selectedRoomModal, setSelectedRoomModal] = useState<RoomType | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [reviewSlide, setReviewSlide] = useState(0);

  const heroVideo = getAssetBySlot('hero-video');
  const heroPoster = getAssetBySlot('hero-poster');

  const toggleHeroVideo = () => {
    const vid = videoRef.current;
    if (!vid) return;
    if (vid.paused) {
      vid.play().catch(() => {});
      setVideoPlaying(true);
    } else {
      vid.pause();
      setVideoPlaying(false);
    }
  };

  const handleAvailabilitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(
      `/book?room=${encodeURIComponent(selectedRoomId)}&checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`
    );
  };

  const approvedReviews = state.reviews.filter((r) => r.status === 'Approved');
  const galleryAssets = assets.filter(
    (a) => !a.isVideo && a.src && a.slot !== 'exterior-2'
  );

  const scrollCarousel = (dir: -1 | 1) => {
    if (!carouselRef.current) return;
    carouselRef.current.scrollBy({ left: dir * 360, behavior: 'smooth' });
  };

  const whyStayItems = [
    {
      icon: Wifi,
      title: 'High-Speed Wi-Fi',
      desc: 'Complimentary fibre Wi-Fi across all 4 floors for business calls and rail schedule checks.',
    },
    {
      icon: Zap,
      title: '24h Power Backup',
      desc: 'Uninterrupted lighting, ceiling fans, and charging points with automatic generator backup.',
    },
    {
      icon: Building2,
      title: 'Passenger Lift (4 Floors)',
      desc: 'Senior-friendly elevator serving all 32 rooms—effortless with heavy luggage.',
    },
    {
      icon: Clock,
      title: '24-Hour Front Desk',
      desc: 'Smooth late-night and early-morning train check-ins anytime at Station Road.',
    },
    {
      icon: Utensils,
      title: 'Pure Veg Dining & Room Service',
      desc: 'Fresh breakfast, Khandeshi thalis, high tea, and 24-hour in-room ordering.',
    },
    {
      icon: Car,
      title: 'Free Parking & EV Plug',
      desc: 'On-site vehicle parking with EV charging socket access for road travellers.',
    },
    {
      icon: ShieldCheck,
      title: '24/7 CCTV Security',
      desc: 'Monitored lobby, corridors, and verified guest ID check-in for family peace of mind.',
    },
    {
      icon: Stethoscope,
      title: 'Doctor on Call & Travel Desk',
      desc: 'Immediate medical assistance on call plus Ajanta Caves cab & airport transfers.',
    },
  ];

  return (
    <div>
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[540px] sm:min-h-[640px] lg:min-h-[720px] flex flex-col justify-between overflow-hidden bg-surface-base text-text-on-dark border-b border-border-subtle">
        {/* Background poster & video */}
        <div className="absolute inset-0">
          <img
            src={heroPoster.src}
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover opacity-55"
            style={{ objectPosition: heroPoster.focalPoint }}
          />
          {heroVideo.src && (
            <video
              ref={videoRef}
              autoPlay
              muted
              loop
              playsInline
              poster={heroPoster.src}
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover opacity-55"
            >
              <source src={heroVideo.src} type="video/webm" />
            </video>
          )}
          {/* Obsidian-to-cyan radial atmospheric scrim */}
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 85% 60% at 50% 0%, rgba(0, 163, 255, 0.16), transparent 65%), linear-gradient(180deg, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.68) 50%, rgba(0,0,0,0.96) 100%)',
            }}
          />
        </div>

        {/* Hero Copy */}
        <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 pt-6 pb-6 sm:pt-12 sm:pb-8 md:pt-16">
          <div className="flex flex-wrap items-center justify-between gap-2.5 mb-5 sm:mb-6">
            <p className="text-xs sm:text-sm font-medium tracking-wide text-text-accent">
              {t.heroBadge}
            </p>
            <div className="flex items-center gap-2 ml-auto">
              <div className="inline-flex items-center gap-0.5 rounded-lg bg-surface-raised/85 border border-border-subtle p-1 backdrop-blur-md">
                {(['en', 'hi', 'mr'] as const).map((code) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => setLang(code)}
                    aria-label={`Switch language to ${code === 'en' ? 'English' : code === 'hi' ? 'Hindi' : 'Marathi'}`}
                    className={`min-h-[32px] px-2.5 rounded text-xs font-semibold cursor-pointer transition-colors ${
                      lang === code
                        ? 'bg-action-primary text-text-inverse'
                        : 'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    {code === 'en' ? 'EN' : code === 'hi' ? 'हिं' : 'मरा'}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={toggleHeroVideo}
                aria-label={videoPlaying ? 'Pause background video' : 'Play background video'}
                className="sm:hidden min-w-[40px] min-h-[40px] inline-flex items-center justify-center rounded-lg bg-surface-raised/85 border border-border-subtle text-text-primary hover:bg-surface-muted cursor-pointer backdrop-blur-md"
              >
                {videoPlaying ? (
                  <Pause className="w-4 h-4 text-text-accent" aria-hidden="true" />
                ) : (
                  <Play className="w-4 h-4 text-text-accent" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={REVEAL_TRANSITION}
            className="max-w-4xl"
          >
            <h1 className="font-display text-[1.95rem] leading-[1.12] sm:text-5xl lg:text-[4.25rem] font-bold sm:leading-[1.06] tracking-tight text-text-tertiary">
              {site.heroHeadline}
            </h1>
            <p className="mt-3.5 sm:mt-5 text-sm sm:text-lg text-text-secondary max-w-2xl leading-relaxed">
              {site.heroSubheadline}
            </p>

            <div className="mt-6 sm:mt-8 flex flex-wrap items-center gap-3 sm:gap-4">
              <Link to="/book" className="flex-1 sm:flex-none min-w-[140px]">
                <Button variant="primary" size="lg" className="w-full sm:w-auto">
                  {t.heroCtaBook}
                </Button>
              </Link>
              <Link to="/rooms" className="flex-1 sm:flex-none min-w-[140px]">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                  {t.heroCtaRooms}
                </Button>
              </Link>

              <button
                type="button"
                onClick={toggleHeroVideo}
                aria-label={videoPlaying ? 'Pause background video' : 'Play background video'}
                className="hidden sm:inline-flex ml-auto min-w-[44px] min-h-[44px] items-center gap-2 px-3.5 rounded-lg bg-surface-raised/85 border border-border-subtle text-xs font-medium text-text-primary hover:bg-surface-muted cursor-pointer backdrop-blur-md"
              >
                {videoPlaying ? (
                  <>
                    <Pause className="w-4 h-4 text-text-accent" aria-hidden="true" />
                    <span>Pause Video</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 text-text-accent" aria-hidden="true" />
                    <span>Play Video</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>

        {/* Floating Obsidian Glass Check Availability Bar */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...REVEAL_TRANSITION, delay: 0.12 }}
          className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 pb-6 sm:pb-8"
        >
          <form
            onSubmit={handleAvailabilitySubmit}
            className="rounded-2xl bg-surface-raised/90 backdrop-blur-xl border border-border-strong shadow-modal p-3.5 sm:p-5 text-text-primary"
          >
            <div className="grid grid-cols-2 lg:grid-cols-12 gap-2.5 sm:gap-3 items-end">
              <div className="col-span-2 lg:col-span-5">
                <DateRangePicker
                  checkIn={checkIn}
                  checkOut={checkOut}
                  onChange={(inDate, outDate) => {
                    setCheckIn(inDate);
                    setCheckOut(outDate);
                  }}
                  labelCheckIn={t.checkInLabel}
                  labelCheckOut={t.checkOutLabel}
                />
              </div>

              <div className="col-span-1 lg:col-span-3">
                <label htmlFor="hero-room-select" className="block text-[11px] sm:text-xs font-medium text-text-secondary mb-1 truncate">
                  {t.roomTypeLabel}
                </label>
                <select
                  id="hero-room-select"
                  value={selectedRoomId}
                  onChange={(e) => setSelectedRoomId(e.target.value)}
                  className="min-h-[48px] w-full rounded-lg bg-surface-base border border-border-subtle px-2.5 sm:px-3 text-xs sm:text-sm font-medium text-text-primary"
                >
                  {state.roomTypes.map((rt) => (
                    <option key={rt.id} value={rt.id}>
                      {rt.shortName} (₹{rt.baseRate}/nt)
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-span-1 lg:col-span-2">
                <label htmlFor="hero-guests-select" className="block text-[11px] sm:text-xs font-medium text-text-secondary mb-1 truncate">
                  {t.guestsLabel}
                </label>
                <select
                  id="hero-guests-select"
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                  className="min-h-[48px] w-full rounded-lg bg-surface-base border border-border-subtle px-2.5 sm:px-3 text-xs sm:text-sm font-medium text-text-primary"
                >
                  {[1, 2, 3, 4].map((n) => (
                    <option key={n} value={n}>
                      {n} Guest{n > 1 ? 's' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-span-2 lg:col-span-2">
                <Button type="submit" variant="primary" size="lg" className="w-full">
                  {t.checkAvailability}
                </Button>
              </div>
            </div>
          </form>
        </motion.div>
      </section>

      {/* 2. TRUST STRIP */}
      <section aria-label="Hotel trust highlights" className="bg-surface-raised border-b border-border-subtle">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={REVEAL_TRANSITION}
          className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8"
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 sm:divide-x sm:divide-border-subtle">
            <div className="p-3.5 sm:p-0 sm:px-4 first:sm:pl-0 rounded-xl sm:rounded-none bg-surface-base/65 sm:bg-transparent border border-border-subtle sm:border-0">
              <p className="font-display text-xl sm:text-3xl font-bold text-text-accent">
                <AnimatedCounter target={50} suffix="+" />
              </p>
              <p className="text-xs sm:text-sm font-medium text-text-tertiary mt-1">{t.trustLegacy}</p>
              <p className="text-[11px] sm:text-xs text-text-secondary mt-0.5">Welcoming guests since 1975</p>
            </div>
            <div className="p-3.5 sm:p-0 sm:px-6 rounded-xl sm:rounded-none bg-surface-base/65 sm:bg-transparent border border-border-subtle sm:border-0">
              <p className="font-display text-xl sm:text-3xl font-bold text-text-accent">
                <AnimatedCounter target={3} suffix=" min" />
              </p>
              <p className="text-xs sm:text-sm font-medium text-text-tertiary mt-1">{t.trustStation}</p>
              <p className="text-[11px] sm:text-xs text-text-secondary mt-0.5">228 Station Road, Navi Peth</p>
            </div>
            <div className="p-3.5 sm:p-0 sm:px-6 rounded-xl sm:rounded-none bg-surface-base/65 sm:bg-transparent border border-border-subtle sm:border-0">
              <p className="font-display text-xl sm:text-3xl font-bold text-text-accent">
                <AnimatedCounter target={4.1} decimals={1} suffix="★" />
              </p>
              <p className="text-xs sm:text-sm font-medium text-text-tertiary mt-1">{t.trustRating}</p>
              <p className="text-[11px] sm:text-xs text-text-secondary mt-0.5">4.0/5 across 708 Justdial ratings</p>
            </div>
            <div className="p-3.5 sm:p-0 sm:px-6 rounded-xl sm:rounded-none bg-surface-base/65 sm:bg-transparent border border-border-subtle sm:border-0">
              <p className="font-display text-xl sm:text-3xl font-bold text-text-accent">
                <AnimatedCounter target={32} suffix=" Rooms" />
              </p>
              <p className="text-xs sm:text-sm font-medium text-text-tertiary mt-1">{t.trustParking}</p>
              <p className="text-[11px] sm:text-xs text-text-secondary mt-0.5">4 Floors with lift & EV plug</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* 3. FEATURED ROOMS CAROUSEL */}
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.12 }}
        transition={REVEAL_TRANSITION}
        className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-text-accent">
              {t.directBadge}
            </p>
            <h2 className="font-display text-2xl sm:text-4xl font-bold text-text-tertiary mt-1.5">
              {t.featuredRoomsHeading}
            </h2>
          </div>
          <div className="flex items-center justify-between sm:justify-start gap-2">
            <div className="flex items-center gap-2">
              <Button
                variant="icon"
                aria-label="Scroll rooms left"
                onClick={() => scrollCarousel(-1)}
              >
                <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              </Button>
              <Button
                variant="icon"
                aria-label="Scroll rooms right"
                onClick={() => scrollCarousel(1)}
              >
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Button>
            </div>
            <Link to="/rooms">
              <Button variant="secondary" size="sm">
                Compare All Rooms
              </Button>
            </Link>
          </div>
        </div>

        <div
          ref={carouselRef}
          tabIndex={0}
          aria-label="Featured rooms carousel"
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight') scrollCarousel(1);
            if (e.key === 'ArrowLeft') scrollCarousel(-1);
          }}
          className="-mx-4 px-4 sm:mx-0 sm:px-0 flex gap-4 sm:gap-6 overflow-x-auto no-scrollbar pb-4 snap-x snap-mandatory scroll-smooth"
        >
          {state.roomTypes.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              availableCount={repo.getAvailableCountForRange(room.id, checkIn, checkOut)}
              checkIn={checkIn}
              checkOut={checkOut}
              onInspectDetails={setSelectedRoomModal}
              className="w-[84vw] max-w-[350px] sm:w-auto sm:min-w-[360px] lg:min-w-[380px] shrink-0 snap-center sm:snap-start sm:flex-1"
            />
          ))}
        </div>
        <p className="sm:hidden text-xs text-text-secondary mt-1 flex items-center gap-1.5">
          <ArrowRight className="w-3.5 h-3.5 text-text-accent" aria-hidden="true" />
          <span>Swipe horizontally to explore all 4 room categories</span>
        </p>
      </motion.section>

      {/* 4. WHY STAY WITH US */}
      <section className="bg-surface-raised/60 border-y border-border-subtle py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mb-8 sm:mb-10">
            <p className="text-xs font-semibold uppercase tracking-wider text-text-accent">
              Engineered for Reliability
            </p>
            <h2 className="font-display text-2xl sm:text-4xl font-bold text-text-tertiary mt-1.5">
              {t.whyStayHeading}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
            {whyStayItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ ...REVEAL_TRANSITION, delay: idx * 0.04 }}
                  className="spotlight-card p-4 sm:p-5 rounded-2xl bg-surface-raised border border-border-subtle shadow-card flex sm:block items-start gap-3.5"
                >
                  <div className="w-10 h-10 rounded-lg bg-surface-base border border-border-subtle flex items-center justify-center shrink-0 sm:mb-4">
                    <Icon className="w-5 h-5 text-text-accent" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-display text-base sm:text-lg font-semibold text-text-tertiary">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-text-secondary mt-1 sm:mt-1.5 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. MASONRY GALLERY WITH LIGHTBOX */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={REVEAL_TRANSITION}
        className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20"
      >
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-text-accent">
              Real Property Photographs
            </p>
            <h2 className="font-display text-2xl sm:text-4xl font-bold text-text-tertiary mt-1.5">
              {t.galleryHeading}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-text-secondary inline-flex items-center gap-1.5">
            <Camera className="w-4 h-4 text-text-accent" aria-hidden="true" />
            <span>Tap any photograph to expand</span>
          </p>
        </div>

        <div className="columns-2 lg:columns-3 gap-3 sm:gap-4 space-y-3 sm:space-y-4">
          {galleryAssets.slice(0, 9).map((item, idx) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setLightboxIndex(idx)}
              className="spotlight-card group relative block w-full break-inside-avoid rounded-xl sm:rounded-2xl overflow-hidden border border-border-subtle bg-surface-raised shadow-card text-left cursor-pointer"
            >
              <SmartImage
                asset={item}
                className="w-full"
                imgClassName="group-hover:scale-[1.03] transition-transform duration-500"
              />
              <div className="p-2.5 sm:p-3.5 bg-surface-raised border-t border-border-subtle">
                <p className="text-xs sm:text-sm font-medium text-text-primary truncate">{item.label}</p>
              </div>
            </button>
          ))}
        </div>
      </motion.section>

      {/* 6. REVIEWS SLIDER */}
      <section className="bg-surface-strong border-y border-border-subtle text-text-on-dark py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 sm:mb-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-text-accent">
                4.1/5 Google (537) · 4.0/5 Justdial (708)
              </p>
              <h2 className="font-display text-2xl sm:text-4xl font-bold text-text-tertiary mt-1.5">
                {t.reviewsHeading}
              </h2>
            </div>
            <div className="flex items-center justify-between sm:justify-start gap-2">
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    setReviewSlide((prev) => (prev - 1 + approvedReviews.length) % approvedReviews.length)
                  }
                  aria-label="Previous guest review"
                >
                  <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setReviewSlide((prev) => (prev + 1) % approvedReviews.length)}
                  aria-label="Next guest review"
                >
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Button>
              </div>
              <Link to="/reviews">
                <Button variant="primary" size="sm">
                  All Reviews & Share Stay
                </Button>
              </Link>
            </div>
          </div>

          {approvedReviews.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                {[0, 1, 2].map((offset) => {
                  const review = approvedReviews[(reviewSlide + offset) % approvedReviews.length];
                  if (!review) return null;
                  return (
                    <article
                      key={`${review.id}-${offset}`}
                      className={`spotlight-card p-5 sm:p-6 rounded-2xl bg-surface-raised border border-border-subtle flex-col justify-between ${
                        offset > 0 ? 'hidden md:flex' : 'flex'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-1 text-text-accent mb-3" aria-label={`${review.rating} out of 5 stars`}>
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${i < review.rating ? 'fill-text-accent text-text-accent' : 'text-border-strong'}`}
                              aria-hidden="true"
                            />
                          ))}
                        </div>
                        <p className="text-sm text-text-primary leading-relaxed">
                          “{review.comment}”
                        </p>
                      </div>
                      <div className="mt-5 pt-4 border-t border-border-subtle text-xs text-text-secondary">
                        <p className="font-semibold text-text-tertiary text-sm">{review.guestName}</p>
                        <p className="mt-0.5">
                          {review.roomStayed} · {review.source}
                        </p>
                      </div>
                    </article>
                  );
                })}
              </div>

              {/* Mobile Review Dots */}
              <div className="mt-4 flex md:hidden items-center justify-center gap-1.5">
                {approvedReviews.slice(0, 6).map((rev, i) => {
                  const active = reviewSlide % approvedReviews.length === i;
                  return (
                    <button
                      key={rev.id}
                      type="button"
                      onClick={() => setReviewSlide(i)}
                      aria-label={`Show review ${i + 1}`}
                      className="min-w-[24px] min-h-[24px] flex items-center justify-center cursor-pointer"
                    >
                      <span
                        className={`h-1.5 rounded-full transition-all ${
                          active ? 'w-5 bg-action-primary' : 'w-1.5 bg-border-strong'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </section>

      {/* 7. LOCATION TEASER MAP */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.12 }}
        transition={REVEAL_TRANSITION}
        className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch">
          <div className="lg:col-span-5 flex flex-col justify-between p-5 sm:p-8 rounded-2xl bg-surface-raised border border-border-subtle shadow-card">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-text-accent">
                Plus Code {site.plusCode}
              </p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-text-tertiary mt-1.5">
                {t.locationHeading}
              </h2>
              <p className="text-sm text-text-secondary mt-2.5 sm:mt-3 leading-relaxed">
                {site.address}. Reach our 24-hour reception desk within a 3-minute walk from Jalgaon Junction Railway Station, with easy cab access to Jalgaon Airport (9 km) and the Ajanta Caves gateway.
              </p>

              <dl className="mt-5 sm:mt-6 space-y-2.5 sm:space-y-3 text-sm">
                <div className="flex items-center justify-between gap-2 py-2 border-b border-border-subtle">
                  <dt className="text-text-secondary">Jalgaon Junction Station</dt>
                  <dd className="font-semibold text-text-tertiary tabular-nums shrink-0">3-min walk</dd>
                </div>
                <div className="flex items-center justify-between gap-2 py-2 border-b border-border-subtle">
                  <dt className="text-text-secondary">Navi Peth Market</dt>
                  <dd className="font-semibold text-text-tertiary shrink-0">Walking distance</dd>
                </div>
                <div className="flex items-center justify-between gap-2 py-2 border-b border-border-subtle">
                  <dt className="text-text-secondary">Jalgaon Airport</dt>
                  <dd className="font-semibold text-text-tertiary tabular-nums shrink-0">9 km</dd>
                </div>
              </dl>
            </div>

            <div className="mt-6 grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2.5 sm:gap-3">
              <a
                href="https://maps.google.com/?q=Hotel+Ramniwas+228+Station+Rd+Jalgaon+425001"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto"
              >
                <Button variant="primary" size="md" className="w-full sm:w-auto">
                  <MapPin className="w-4 h-4" aria-hidden="true" />
                  Directions
                </Button>
              </a>
              <a href={`tel:${site.phonePrimary.replace(/\s+/g, '')}`} className="w-full sm:w-auto">
                <Button variant="secondary" size="md" className="w-full sm:w-auto">
                  <Phone className="w-4 h-4" aria-hidden="true" />
                  {t.callFrontDesk}
                </Button>
              </a>
            </div>
          </div>

          <div className="lg:col-span-7 min-h-[260px] sm:min-h-[340px] rounded-2xl overflow-hidden border border-border-subtle shadow-card bg-surface-muted">
            <iframe
              title="Hotel Ramniwas Jalgaon Location Map"
              src="https://www.google.com/maps?q=228%20Station%20Rd%20Navi%20Peth%20Jaikisan%20Wadi%20Jalgaon%20Maharashtra%20425001&output=embed"
              className="w-full h-full min-h-[260px] sm:min-h-[340px] border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </motion.section>

      <RoomDetailsModal
        room={selectedRoomModal}
        availableCount={
          selectedRoomModal
            ? repo.getAvailableCountForRange(selectedRoomModal.id, checkIn, checkOut)
            : 0
        }
        checkIn={checkIn}
        checkOut={checkOut}
        onClose={() => setSelectedRoomModal(null)}
      />

      <Lightbox
        items={galleryAssets.slice(0, 9)}
        activeIndex={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onChangeIndex={setLightboxIndex}
      />
    </div>
  );
}
