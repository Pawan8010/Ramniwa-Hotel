import type { AssetItem, AssetSlotKey } from '../types/hotel';

const MEDIA_STORAGE_KEY = 'ramniwas_media_overrides_v1';

/**
 * Single source of truth for every image and video slot across the application.
 * Uploaded photos are stored in /public/images keeping exact file names.
 * Slots without an uploaded photo (such as restaurant-* or room-sharing-*)
 * intentionally leave `src: ''` so SmartImage renders a bespoke maroon-gold
 * heritage placeholder until an image is uploaded via /admin/media or /public/images.
 */
export const DEFAULT_ASSETS: AssetItem[] = [
  {
    id: 'asset-hero-video',
    slot: 'hero-video',
    category: 'hero',
    label: 'Hero Background Video',
    src: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/c/c0/Indian_Railways_train_approaching.webm/Indian_Railways_train_approaching.webm.480p.vp9.webm',
    alt: 'Ambient heritage hospitality and Jalgaon arrival video',
    width: 1280,
    height: 720,
    focalPoint: '50% 50%',
    order: 0,
    isVideo: true,
  },
  {
    id: 'asset-hero-poster',
    slot: 'hero-poster',
    category: 'hero',
    label: 'Hero Poster & Facade Banner',
    src: '/images/30768148974e50885d4962023be714b7_2d344b92.jpg',
    alt: 'Hotel Ramniwas entrance marquee with bilingual Devanagari and English signage at 228 Station Road, Jalgaon',
    width: 1024,
    height: 575,
    focalPoint: '50% 55%',
    order: 1,
  },
  {
    id: 'asset-exterior-1',
    slot: 'exterior-1',
    category: 'exterior',
    label: 'Hotel Building Facade (4 Floors)',
    src: '/images/download_f980dc3c.jpg',
    alt: 'Four-storey exterior facade of Hotel Ramniwas showing terracotta jali motif and Station Road entrance',
    width: 480,
    height: 640,
    focalPoint: '50% 45%',
    order: 2,
  },
  {
    id: 'asset-exterior-2',
    slot: 'exterior-2',
    category: 'exterior',
    label: 'Entrance Signage Close-up',
    src: '/images/1_190e4257.jpg',
    alt: 'Front entrance columns and illuminated lobby of Hotel Ramniwas',
    width: 312,
    height: 175,
    focalPoint: '50% 50%',
    order: 3,
  },
  {
    id: 'asset-room-ac-king-1',
    slot: 'room-ac-king-1',
    category: 'room-ac-king',
    label: 'AC Deluxe King — Seating & Bed',
    src: '/images/unnamed__2__b5a115fc.jpg',
    alt: 'AC Deluxe King room with upholstered headboard, wall-mounted TV, and window seating table',
    width: 512,
    height: 512,
    focalPoint: '50% 55%',
    order: 4,
  },
  {
    id: 'asset-room-ac-king-2',
    slot: 'room-ac-king-2',
    category: 'room-ac-king',
    label: 'AC Deluxe King — Wardrobe & Desk',
    src: '/images/unnamed__3__dc4c3c2a.jpg',
    alt: 'AC Deluxe King room showing wooden wardrobe, bedside landline phone, and crisp white linens',
    width: 512,
    height: 512,
    focalPoint: '50% 50%',
    order: 5,
  },
  {
    id: 'asset-room-ac-king-3',
    slot: 'room-ac-king-3',
    category: 'room-ac-king',
    label: 'AC Deluxe King — Cove Lighting View',
    src: '/images/unnamed_0e133d3a.jpg',
    alt: 'Spacious AC Deluxe King room with warm cove lighting, ceiling fan, and blackout drapes',
    width: 512,
    height: 512,
    focalPoint: '50% 50%',
    order: 6,
  },
  {
    id: 'asset-room-ac-king-4',
    slot: 'room-ac-king-4',
    category: 'room-ac-king',
    label: 'AC Deluxe King — Bedside Detail',
    src: '/images/unnamed__4__ce779275.jpg',
    alt: 'AC Deluxe King bed with plush maroon blanket, reading lamp, and bedside charging sockets',
    width: 512,
    height: 512,
    focalPoint: '50% 55%',
    order: 7,
  },
  {
    id: 'asset-room-ac-king-5',
    slot: 'room-ac-king-5',
    category: 'room-ac-king',
    label: 'AC Deluxe King — Evening Ambiance',
    src: '/images/16091978_9_eac891b3.jpg',
    alt: 'Warm evening lighting inside AC Deluxe King room with dining table and television',
    width: 312,
    height: 175,
    focalPoint: '50% 50%',
    order: 8,
  },
  {
    id: 'asset-room-ac-twin-1',
    slot: 'room-ac-twin-1',
    category: 'room-ac-twin',
    label: 'AC Deluxe Twin — Two Single Beds',
    src: '/images/3_75dd9e7b.jpg',
    alt: 'AC Deluxe Twin room featuring two single beds, tufted leather headboards, and warm bedside sconce',
    width: 1000,
    height: 562,
    focalPoint: '50% 55%',
    order: 9,
  },
  {
    id: 'asset-room-ac-twin-2',
    slot: 'room-ac-twin-2',
    category: 'room-ac-twin',
    label: 'AC Deluxe Twin — Alternate Angle',
    src: '/images/2_d11c1479.jpg',
    alt: 'AC Deluxe Twin room with full-length curtains, power outlets, and intercom phone between beds',
    width: 1000,
    height: 562,
    focalPoint: '50% 55%',
    order: 10,
  },
  {
    id: 'asset-room-nonac-1',
    slot: 'room-nonac-1',
    category: 'room-nonac',
    label: 'Deluxe Non-AC Room',
    src: '/images/00013548_1_68c9b799.jpg',
    alt: 'Clean Deluxe Non-AC room with fresh cotton bedding, bedside table, and warm wall lighting',
    width: 330,
    height: 330,
    focalPoint: '50% 55%',
    order: 11,
  },
  {
    id: 'asset-room-sharing-1',
    slot: 'room-sharing-1',
    category: 'room-sharing',
    label: 'Solo & Sharing Dormitory',
    src: '',
    alt: 'Sharing and solo transit dormitory beds at Hotel Ramniwas',
    width: 800,
    height: 500,
    focalPoint: '50% 50%',
    order: 12,
  },
  {
    id: 'asset-lobby-1',
    slot: 'lobby-1',
    category: 'lobby',
    label: '24-Hour Front Desk & Reception',
    src: '/images/50518091_2_bff6bf46.jpg',
    alt: 'Hotel Ramniwas 24-hour reception desk with warm stone cladding, CCTV security, and elevator access',
    width: 1000,
    height: 562,
    focalPoint: '50% 50%',
    order: 13,
  },
  {
    id: 'asset-lobby-2',
    slot: 'lobby-2',
    category: 'lobby',
    label: 'Reception Lounge Counter',
    src: '/images/16091978_2_dbe9d9e1.jpg',
    alt: 'Mosaic-tiled reception counter under warm pendant lighting in the ground-floor lobby',
    width: 312,
    height: 175,
    focalPoint: '50% 50%',
    order: 14,
  },
  {
    id: 'asset-gallery-lift',
    slot: 'gallery-lift',
    category: 'gallery',
    label: 'Passenger Elevator Access (All 4 Floors)',
    src: '/images/50518091_3_301f3aa5.jpg',
    alt: 'Stainless steel passenger lift serving all four floors at Hotel Ramniwas',
    width: 1000,
    height: 562,
    focalPoint: '50% 50%',
    order: 15,
  },
  {
    id: 'asset-restaurant-1',
    slot: 'restaurant-1',
    category: 'restaurant',
    label: 'Pure Vegetarian Dining Hall',
    src: '',
    alt: 'Pure vegetarian family dining hall serving Khandesh thalis, breakfast, and high tea',
    width: 900,
    height: 600,
    focalPoint: '50% 50%',
    order: 16,
  },
  {
    id: 'asset-restaurant-2',
    slot: 'restaurant-2',
    category: 'restaurant',
    label: 'In-Room Dining & Fresh Morning Tea',
    src: '',
    alt: 'Freshly prepared vegetarian breakfast and filter coffee served via 24-hour room service',
    width: 900,
    height: 600,
    focalPoint: '50% 50%',
    order: 17,
  },
];

export function getStoredMediaOverrides(): AssetItem[] | null {
  try {
    const raw = localStorage.getItem(MEDIA_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AssetItem[];
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function getMergedAssets(): AssetItem[] {
  const overrides = getStoredMediaOverrides();
  if (!overrides) {
    return [...DEFAULT_ASSETS].sort((a, b) => a.order - b.order);
  }
  const map = new Map<string, AssetItem>();
  for (const item of DEFAULT_ASSETS) {
    map.set(item.id, item);
  }
  for (const item of overrides) {
    map.set(item.id, item);
  }
  return Array.from(map.values()).sort((a, b) => a.order - b.order);
}

export function saveMediaOverrides(items: AssetItem[]): void {
  localStorage.setItem(MEDIA_STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent('ramniwas:media-updated'));
}

export function resetMediaOverrides(): void {
  localStorage.removeItem(MEDIA_STORAGE_KEY);
  window.dispatchEvent(new CustomEvent('ramniwas:media-updated'));
}

export function getAssetBySlot(slot: AssetSlotKey): AssetItem {
  const all = getMergedAssets();
  return (
    all.find((a) => a.slot === slot) ?? {
      id: `fallback-${slot}`,
      slot,
      category: 'gallery',
      label: 'Hotel Ramniwas',
      src: '',
      alt: 'Hotel Ramniwas, Jalgaon',
      width: 800,
      height: 500,
      focalPoint: '50% 50%',
      order: 99,
    }
  );
}

export function getAssetsByCategory(category: AssetItem['category']): AssetItem[] {
  return getMergedAssets().filter((a) => a.category === category);
}

export async function compressImageToDataUrl(
  file: File,
  maxWidth = 1600,
  quality = 0.8
): Promise<{ dataUrl: string; width: number; height: number; sizeBytes: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Unsupported or corrupted image format.'));
      img.onload = () => {
        const scale = img.width > maxWidth ? maxWidth / img.width : 1;
        const targetWidth = Math.round(img.width * scale);
        const targetHeight = Math.round(img.height * scale);

        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context unavailable.'));
          return;
        }
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        const mime = file.type === 'image/png' ? 'image/webp' : 'image/jpeg';
        const dataUrl = canvas.toDataURL(mime, quality);
        const sizeBytes = Math.round((dataUrl.length * 3) / 4);
        resolve({
          dataUrl,
          width: targetWidth,
          height: targetHeight,
          sizeBytes,
        });
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}
