import React, { useState } from 'react';
import { Check, Star, X } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/DataState';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { useHotelData } from '../../hooks/useRepository';
import { useToast } from '../../hooks/useToast';
import type { EnquiryStatus } from '../../types/hotel';
import { formatInr } from '../../utils/validators';

export function AdminInboxPage() {
  useDocumentMeta('Reviews & Guest Inbox · Hotel Ramniwas Admin', 'Moderate guest reviews and process room-service or contact enquiries.');

  const { state, repo } = useHotelData();
  const { showToast } = useToast();
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});

  return (
    <div className="space-y-10">
      {/* Guest Enquiries & Room Service Orders */}
      <section className="space-y-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-text-primary">
            Guest Enquiries & In-Room Dining Orders
          </h1>
          <p className="text-sm text-text-secondary">
            Incoming messages from the Contact page and live food orders from the Dining menu.
          </p>
        </div>

        {state.enquiries.length === 0 ? (
          <EmptyState title="Inbox is clear" description="New enquiries and room-service requests appear here." />
        ) : (
          <div className="space-y-3">
            {state.enquiries.map((enq) => (
              <div
                key={enq.id}
                className="p-5 rounded-xl bg-surface-raised border border-border-subtle shadow-card flex flex-col md:flex-row md:items-start justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-text-secondary">
                    <span className="font-semibold text-action-primary">{enq.type}</span>
                    <span aria-hidden="true">·</span>
                    <span>{enq.guestName}</span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">{enq.phone}</span>
                    {enq.roomNumber && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span>Room {enq.roomNumber}</span>
                      </>
                    )}
                  </div>
                  <h2 className="font-semibold text-text-primary">{enq.subject}</h2>
                  <p className="text-sm text-text-secondary">{enq.message}</p>

                  {enq.items && enq.items.length > 0 && (
                    <div className="pt-2 text-xs space-y-1">
                      {enq.items.map((item) => (
                        <p key={item.name} className="tabular-nums">
                          {item.qty}× {item.name} ({formatInr(item.qty * item.price)})
                        </p>
                      ))}
                      {enq.totalAmount !== undefined && (
                        <p className="font-bold text-text-primary">
                          Total: {formatInr(enq.totalAmount)}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <select
                    aria-label={`Status for ${enq.subject}`}
                    value={enq.status}
                    onChange={(e) => {
                      repo.updateEnquiryStatus(enq.id, e.target.value as EnquiryStatus);
                      showToast({ tone: 'info', title: `Marked ${e.target.value}` });
                    }}
                    className="min-h-[40px] px-3 rounded-lg border border-border-subtle bg-surface-base text-xs font-medium"
                  >
                    <option value="New">New</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Review Moderation */}
      <section className="space-y-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-text-primary">
            Review Moderation Queue ({state.reviews.length})
          </h2>
          <p className="text-sm text-text-secondary">
            Only Approved reviews appear publicly on the Home and Reviews pages.
          </p>
        </div>

        <div className="space-y-4">
          {state.reviews.map((rev) => (
            <div
              key={rev.id}
              className="p-5 rounded-xl bg-surface-raised border border-border-subtle shadow-card space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-text-primary">{rev.guestName}</span>
                    <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-text-accent tabular-nums">
                      {rev.rating} <Star className="w-3.5 h-3.5 fill-action-accent text-action-accent" aria-hidden="true" />
                    </span>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded ${
                        rev.status === 'Approved'
                          ? 'bg-status-success/15 text-status-success'
                          : rev.status === 'Pending'
                            ? 'bg-status-warning/15 text-status-warning'
                            : 'bg-status-error/15 text-status-error'
                      }`}
                    >
                      {rev.status}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary mt-0.5">
                    {rev.roomStayed} · {rev.source} · {rev.createdAt}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      repo.moderateReview(rev.id, 'Approved', replyDrafts[rev.id] ?? rev.adminReply);
                      showToast({ tone: 'success', title: `Approved review by ${rev.guestName}` });
                    }}
                  >
                    <Check className="w-4 h-4 text-status-success" aria-hidden="true" />
                    Approve
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      repo.moderateReview(rev.id, 'Rejected');
                      showToast({ tone: 'info', title: `Hidden review by ${rev.guestName}` });
                    }}
                  >
                    <X className="w-4 h-4 text-status-error" aria-hidden="true" />
                    Reject
                  </Button>
                </div>
              </div>

              <p className="text-sm text-text-primary">“{rev.comment}”</p>

              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  aria-label={`Management reply to ${rev.guestName}`}
                  value={replyDrafts[rev.id] ?? rev.adminReply ?? ''}
                  onChange={(e) =>
                    setReplyDrafts((prev) => ({ ...prev, [rev.id]: e.target.value }))
                  }
                  placeholder="Write an optional management reply..."
                  className="flex-1 min-h-[40px] px-3 rounded-lg bg-surface-base border border-border-subtle text-xs"
                />
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    repo.moderateReview(rev.id, rev.status, replyDrafts[rev.id] ?? rev.adminReply ?? '');
                    showToast({ tone: 'success', title: 'Management reply saved' });
                  }}
                >
                  Save Reply
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
