import React, { useState } from 'react';
import { AlertTriangle, ArrowDown, ArrowUp, RotateCcw, Trash2, Upload } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { InputField, TextareaField } from '../../components/ui/FormField';
import { SmartImage } from '../../components/ui/SmartImage';
import {
  compressImageToDataUrl,
  resetMediaOverrides,
  saveMediaOverrides,
} from '../../data/assets';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { useHotelData } from '../../hooks/useRepository';
import { useToast } from '../../hooks/useToast';
import type { AssetItem } from '../../types/hotel';

export function AdminMediaPage() {
  useDocumentMeta('Media Manager · Hotel Ramniwas Admin', 'Upload, replace, reorder, and delete hotel images per slot with instant live sync.');

  const { assets } = useHotelData();
  const { showToast } = useToast();
  const [filterCat, setFilterCat] = useState<string>('all');

  const imageSlots = assets.filter((a) => !a.isVideo);
  const visible = imageSlots.filter((a) =>
    filterCat === 'all' ? true : a.category === filterCat
  );

  const handleUploadReplace = async (item: AssetItem, file: File) => {
    try {
      const compressed = await compressImageToDataUrl(file, 1600, 0.8);
      const updated = assets.map((a) =>
        a.id === item.id
          ? {
              ...a,
              src: compressed.dataUrl,
              width: compressed.width,
              height: compressed.height,
              sizeBytes: compressed.sizeBytes,
            }
          : a
      );
      saveMediaOverrides(updated);
      const kb = Math.round(compressed.sizeBytes / 1024);
      showToast({
        tone: kb > 500 ? 'warning' : 'success',
        title: `Updated "${item.label}" (${kb} KB)`,
        description:
          kb > 500
            ? 'Image exceeds 500 KB after compression; consider a smaller image for faster mobile load.'
            : 'Changes are now live across the public website.',
      });
    } catch (err) {
      showToast({
        tone: 'error',
        title: 'Image upload failed',
        description: err instanceof Error ? err.message : 'Invalid image file.',
      });
    }
  };

  const handleClearSlot = (item: AssetItem) => {
    const updated = assets.map((a) =>
      a.id === item.id ? { ...a, src: '', sizeBytes: undefined } : a
    );
    saveMediaOverrides(updated);
    showToast({
      tone: 'info',
      title: `Cleared "${item.label}"`,
      description: 'Public site now displays the maroon-gold heritage placeholder for this slot.',
    });
  };

  const handleMove = (item: AssetItem, dir: -1 | 1) => {
    const sorted = [...assets].sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex((a) => a.id === item.id);
    const targetIdx = idx + dir;
    if (targetIdx < 0 || targetIdx >= sorted.length) return;
    const tempOrder = sorted[idx].order;
    sorted[idx] = { ...sorted[idx], order: sorted[targetIdx].order };
    sorted[targetIdx] = { ...sorted[targetIdx], order: tempOrder };
    saveMediaOverrides(sorted);
  };

  const handleAltChange = (item: AssetItem, alt: string) => {
    const updated = assets.map((a) => (a.id === item.id ? { ...a, alt } : a));
    saveMediaOverrides(updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-text-primary">
            Media & Slot Image Manager
          </h1>
          <p className="text-sm text-text-secondary">
            Upload, replace, delete, or reorder images per slot. Files are compressed client-side (max 1600px, quality 0.8) and update the public site instantly.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            resetMediaOverrides();
            showToast({ tone: 'info', title: 'Restored default manifest images' });
          }}
        >
          <RotateCcw className="w-4 h-4" aria-hidden="true" />
          Reset Defaults
        </Button>
      </div>

      <div className="flex sm:flex-wrap gap-2 overflow-x-auto no-scrollbar pb-1">
        {['all', 'hero', 'room-ac-king', 'room-ac-twin', 'room-nonac', 'room-sharing', 'restaurant', 'lobby', 'exterior', 'gallery'].map(
          (cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setFilterCat(cat)}
              className={`min-h-[38px] px-3 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 cursor-pointer border ${
                filterCat === cat
                  ? 'bg-action-primary text-text-inverse border-action-primary'
                  : 'bg-surface-raised text-text-primary border-border-subtle hover:bg-surface-muted'
              }`}
            >
              {cat}
            </button>
          )
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {visible.map((item) => {
          const kb = item.sizeBytes ? Math.round(item.sizeBytes / 1024) : null;
          return (
            <div
              key={item.id}
              className="p-4 rounded-xl bg-surface-raised border border-border-subtle shadow-card space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-mono text-xs text-text-accent">{item.slot}</p>
                  <h2 className="font-semibold text-text-primary">{item.label}</h2>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    aria-label={`Move ${item.label} earlier`}
                    onClick={() => handleMove(item, -1)}
                    className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded border border-border-subtle hover:bg-surface-muted cursor-pointer"
                  >
                    <ArrowUp className="w-4 h-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    aria-label={`Move ${item.label} later`}
                    onClick={() => handleMove(item, 1)}
                    className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded border border-border-subtle hover:bg-surface-muted cursor-pointer"
                  >
                    <ArrowDown className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              </div>

              <div className="aspect-[16/9] rounded-lg overflow-hidden border border-border-subtle">
                <SmartImage asset={item} fallbackTitle={item.label} className="w-full h-full" />
              </div>

              {kb !== null && kb > 500 && (
                <p className="text-xs text-status-warning flex items-center gap-1.5 font-medium">
                  <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
                  Stored size is {kb} KB (above 500 KB recommended limit).
                </p>
              )}

              <div>
                <label htmlFor={`alt-${item.id}`} className="block text-xs font-medium text-text-secondary mb-1">
                  Descriptive Alt Text
                </label>
                <input
                  id={`alt-${item.id}`}
                  type="text"
                  value={item.alt}
                  onChange={(e) => handleAltChange(item, e.target.value)}
                  className="w-full min-h-[38px] px-3 rounded-lg bg-surface-base border border-border-subtle text-xs"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border-subtle">
                <label className="inline-flex items-center gap-2 min-h-[40px] px-3.5 rounded-lg bg-action-primary text-text-inverse text-xs font-medium cursor-pointer hover:bg-action-primary-hover">
                  <Upload className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{item.src ? 'Replace Image' : 'Upload Image'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleUploadReplace(item, file);
                    }}
                  />
                </label>

                {item.src && (
                  <Button variant="ghost" size="sm" onClick={() => handleClearSlot(item)}>
                    <Trash2 className="w-4 h-4 text-status-error" aria-hidden="true" />
                    Remove
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function AdminContentPage() {
  useDocumentMeta('Site Content Editor · Hotel Ramniwas Admin', 'Edit hero copy, dining description, and contact information.');

  const { state, repo } = useHotelData();
  const { showToast } = useToast();
  const [form, setForm] = useState(state.siteContent);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    repo.updateSiteContent(form);
    showToast({
      tone: 'success',
      title: 'Site content published',
      description: 'Public pages now reflect your updated text and contact details.',
    });
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-text-primary">
          Public Site Content Editor
        </h1>
        <p className="text-sm text-text-secondary">
          Update headlines, dining copy, and reception contact details without editing code.
        </p>
      </div>

      <form
        onSubmit={handleSave}
        className="p-6 rounded-2xl bg-surface-raised border border-border-subtle shadow-card space-y-4"
      >
        <InputField
          label="Hero Headline"
          value={form.heroHeadline}
          onChange={(e) => setForm({ ...form, heroHeadline: e.target.value })}
        />
        <TextareaField
          label="Hero Subheadline"
          value={form.heroSubheadline}
          onChange={(e) => setForm({ ...form, heroSubheadline: e.target.value })}
        />
        <TextareaField
          label="Pure Vegetarian Dining Highlight"
          value={form.diningHighlight}
          onChange={(e) => setForm({ ...form, diningHighlight: e.target.value })}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField
            label="Primary Phone"
            value={form.phonePrimary}
            onChange={(e) => setForm({ ...form, phonePrimary: e.target.value })}
          />
          <InputField
            label="Secondary Phone"
            value={form.phoneSecondary}
            onChange={(e) => setForm({ ...form, phoneSecondary: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField
            label="Check-in Time"
            value={form.checkInTime}
            onChange={(e) => setForm({ ...form, checkInTime: e.target.value })}
          />
          <InputField
            label="Check-out Time"
            value={form.checkOutTime}
            onChange={(e) => setForm({ ...form, checkOutTime: e.target.value })}
          />
        </div>
        <InputField
          label="Street Address"
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
        />
        <div className="pt-2 flex justify-end">
          <Button type="submit" variant="primary" size="lg">
            Save & Publish Content
          </Button>
        </div>
      </form>
    </div>
  );
}
