import React, { useState } from 'react';
import { ExternalLink, MessageSquareQuote, Star } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/DataState';
import { InputField, SelectField, TextareaField } from '../components/ui/FormField';
import { compressImageToDataUrl } from '../data/assets';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { useHotelData } from '../hooks/useRepository';
import { useToast } from '../hooks/useToast';

export function ReviewsPage() {
  useDocumentMeta(
    'Guest Reviews · 4.1★ Google & 4.0★ Justdial · Hotel Ramniwas, Jalgaon',
    'Read verified guest feedback for Hotel Ramniwas (4.1/5 from 537 Google reviews, 4.0/5 from 708 Justdial ratings) and submit your own stay review.'
  );

  const { state, repo } = useHotelData();
  const { showToast } = useToast();

  const [guestName, setGuestName] = useState('');
  const [rating, setRating] = useState(5);
  const [roomStayed, setRoomStayed] = useState(state.roomTypes[0]?.name ?? 'AC Deluxe King Bed');
  const [comment, setComment] = useState('');
  const [photoDataUrl, setPhotoDataUrl] = useState<string | undefined>();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const approved = state.reviews.filter((r) => r.status === 'Approved');

  const starDistribution = [
    { stars: 5, pct: 54 },
    { stars: 4, pct: 28 },
    { stars: 3, pct: 11 },
    { stars: 2, pct: 4 },
    { stars: 1, pct: 3 },
  ];

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await compressImageToDataUrl(file, 1000, 0.78);
      setPhotoDataUrl(res.dataUrl);
    } catch {
      showToast({ tone: 'error', title: 'Could not read photo', description: 'Please select a valid JPEG, PNG, or WebP file.' });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (guestName.trim().length < 2) next.guestName = 'Enter your name.';
    if (comment.trim().length < 10) next.comment = 'Please share at least a short sentence about your stay.';
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    repo.submitReview({
      guestName: guestName.trim(),
      rating,
      roomStayed,
      comment: comment.trim(),
      photoDataUrl,
    });

    setGuestName('');
    setRating(5);
    setComment('');
    setPhotoDataUrl(undefined);
    showToast({
      tone: 'success',
      title: 'Review submitted for moderation',
      description: 'Your feedback is now in Pending status and will appear publicly once approved by our team.',
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 md:py-14 space-y-14">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Rating Summary Card */}
        <div className="lg:col-span-5 p-6 sm:p-8 rounded-2xl bg-surface-raised border border-border-subtle shadow-card space-y-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-text-accent">
              Verified Guest Satisfaction
            </p>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-text-primary mt-1">
              Guest Reviews & Ratings
            </h1>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-xl bg-surface-base border border-border-subtle">
            <div>
              <p className="font-ui text-2xl sm:text-3xl font-bold text-action-primary tabular-nums">4.1 / 5</p>
              <p className="text-[11px] sm:text-xs text-text-secondary mt-0.5 tabular-nums">537 Google Reviews</p>
            </div>
            <div>
              <p className="font-ui text-2xl sm:text-3xl font-bold text-action-primary tabular-nums">4.0 / 5</p>
              <p className="text-[11px] sm:text-xs text-text-secondary mt-0.5 tabular-nums">708 Justdial Ratings</p>
            </div>
          </div>

          <div className="space-y-2.5" aria-label="Star rating distribution">
            {starDistribution.map((row) => (
              <div key={row.stars} className="flex items-center gap-3 text-xs">
                <span className="w-10 font-medium text-text-primary tabular-nums">{row.stars} ★</span>
                <div className="flex-1 h-2.5 rounded-full bg-surface-muted overflow-hidden">
                  <div
                    className="h-full bg-action-accent rounded-full"
                    style={{ width: `${row.pct}%` }}
                  />
                </div>
                <span className="w-10 text-right text-text-secondary tabular-nums">{row.pct}%</span>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-border-subtle space-y-2">
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Read External Listings
            </p>
            <div className="flex flex-wrap gap-3 text-sm">
              <a
                href="https://www.google.com/search?q=Hotel+Ramniwas+Jalgaon+reviews"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-action-primary hover:underline font-medium"
              >
                Google <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
              </a>
              <a
                href="https://www.justdial.com/Jalgaon/Hotel-Ramniwas"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-action-primary hover:underline font-medium"
              >
                Justdial <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
              </a>
              <a
                href="https://www.tripadvisor.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-action-primary hover:underline font-medium"
              >
                Tripadvisor <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>

        {/* Review Submission Form */}
        <form
          onSubmit={handleSubmit}
          noValidate
          className="lg:col-span-7 p-6 sm:p-8 rounded-2xl bg-surface-raised border border-border-subtle shadow-card space-y-5"
        >
          <div>
            <h2 className="font-display text-2xl font-bold text-text-primary">
              Share Your Stay Experience
            </h2>
            <p className="text-sm text-text-secondary mt-1">
              Reviews are checked by our management desk before publishing to keep feedback genuine.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              label="Your Name"
              required
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              error={errors.guestName}
            />
            <SelectField
              label="Room Category Stayed"
              value={roomStayed}
              onChange={(e) => setRoomStayed(e.target.value)}
            >
              {state.roomTypes.map((rt) => (
                <option key={rt.id} value={rt.name}>
                  {rt.name}
                </option>
              ))}
            </SelectField>
          </div>

          <div>
            <p className="text-sm font-medium text-text-primary mb-2">Rating</p>
            <div className="flex items-center gap-2" role="radiogroup" aria-label="Star rating">
              {[1, 2, 3, 4, 5].map((num) => (
                <button
                  key={num}
                  type="button"
                  role="radio"
                  aria-checked={rating === num}
                  aria-label={`${num} star${num > 1 ? 's' : ''}`}
                  onClick={() => setRating(num)}
                  className={`min-w-[44px] min-h-[44px] rounded-lg border flex items-center justify-center cursor-pointer transition-colors ${
                    num <= rating
                      ? 'bg-action-primary text-text-inverse border-action-primary'
                      : 'bg-surface-base text-text-secondary border-border-subtle'
                  }`}
                >
                  <Star className={`w-5 h-5 ${num <= rating ? 'fill-text-inverse' : ''}`} aria-hidden="true" />
                </button>
              ))}
            </div>
          </div>

          <TextareaField
            label="Your Review"
            required
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Tell future travellers about room cleanliness, proximity to the station, or dining..."
            error={errors.comment}
          />

          <div>
            <label htmlFor="review-photo-upload" className="block text-sm font-medium text-text-primary mb-1.5">
              Optional Stay Photo
            </label>
            <input
              id="review-photo-upload"
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="block w-full text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border file:border-border-subtle file:bg-surface-base file:text-text-primary file:font-medium hover:file:bg-surface-muted"
            />
          </div>

          <Button type="submit" variant="primary" size="lg" className="w-full sm:w-auto">
            <MessageSquareQuote className="w-4 h-4" aria-hidden="true" />
            Submit Review for Approval
          </Button>
        </form>
      </div>

      {/* Approved Reviews List */}
      <section aria-labelledby="approved-reviews-heading" className="space-y-6">
        <h2 id="approved-reviews-heading" className="font-display text-2xl sm:text-3xl font-bold text-text-primary">
          Published Guest Reviews ({approved.length})
        </h2>

        {approved.length === 0 ? (
          <EmptyState
            title="No published reviews yet"
            description="Be the first guest to share feedback about your stay."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {approved.map((rev) => (
              <article
                key={rev.id}
                className="p-6 rounded-2xl bg-surface-raised border border-border-subtle shadow-card flex flex-col justify-between gap-4"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-1 text-action-accent" aria-label={`${rev.rating} out of 5 stars`}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < rev.rating ? 'fill-action-accent' : 'text-border-subtle'}`}
                          aria-hidden="true"
                        />
                      ))}
                    </div>
                    <span className="text-xs text-text-secondary tabular-nums">{rev.createdAt}</span>
                  </div>

                  <p className="text-sm text-text-primary leading-relaxed">“{rev.comment}”</p>

                  {rev.photoDataUrl && (
                    <img
                      src={rev.photoDataUrl}
                      alt={`Guest photo uploaded by ${rev.guestName}`}
                      className="mt-4 w-full max-h-48 object-cover rounded-lg border border-border-subtle"
                    />
                  )}

                  {rev.adminReply && (
                    <div className="mt-4 p-3.5 rounded-lg bg-surface-base border border-border-subtle text-xs">
                      <p className="font-semibold text-action-primary">Management Response</p>
                      <p className="text-text-secondary mt-1">{rev.adminReply}</p>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-border-subtle text-xs text-text-secondary">
                  <span className="font-semibold text-text-primary text-sm">{rev.guestName}</span>
                  <span className="mx-1.5" aria-hidden="true">·</span>
                  <span>{rev.roomStayed}</span>
                  <span className="mx-1.5" aria-hidden="true">·</span>
                  <span>{rev.source}</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
