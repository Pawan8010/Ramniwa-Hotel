# Hotel Ramniwas · Jalgaon (Est. 1975)

Production web platform, direct booking engine, and property operations dashboard for **Hotel Ramniwas** (`228, Station Rd, Navi Peth, Jaikisan Wadi, Jalgaon, Maharashtra 425001`).

## Running Locally

```bash
npm install
npm run dev
```

The development server starts on `http://localhost:3000`.

To run type-checking and production build:

```bash
npm run lint
npm run build
```

## Demo Admin Credentials (`/admin`)

- **URL:** `/admin`
- **Email:** `admin@ramniwas.in`
- **Password:** `Ramniwas@1975`

## Changing Design Tokens & Colours

All colours, typography, spacing, shadows, radii, and motion timings are defined as semantic CSS variables in `src/styles/tokens.css` and mapped into Tailwind v4 `@theme` in `src/index.css`.

- Edit `--color-surface-strong` (`#5B1220`), `--color-surface-base` (`#FAF5EB`), or `--color-action-accent` (`#C9A24B`) in `src/styles/tokens.css` to re-theme the entire site without modifying any component files.
- Keep `color.text.primary` / `color.text.secondary` pairs at >= 4.5:1 WCAG AA contrast. Never place gold (`#8A6A1F` / `#C9A24B`) as small body text on cream (`#FAF5EB`).

## Replacing the Hero Video

1. Open `src/data/assets.ts` and locate the `hero-video` entry in `DEFAULT_ASSETS`.
2. Replace `src` with your MP4/WebM path (for example `/videos/ramniwas-hero.mp4` placed in `public/videos/`).
3. Ensure `hero-poster` points to your fallback poster image in `/public/images/`.

## Adding or Replacing Images

### Option A: Static Assets (`/public/images` + `src/data/assets.ts`)
1. Save new image files into `public/images/` (WebP/JPEG recommended).
2. Register or update the slot entry in `src/data/assets.ts` (`src`, `alt`, `width`, `height`, `focalPoint`).

### Option B: Live via Admin Media Manager (`/admin/media`)
1. Log into `/admin` and navigate to **Media Manager** (`/admin/media`).
2. Click **Upload Image** or **Replace Image** on any slot (`hero-poster`, `room-ac-king-*`, `room-ac-twin-*`, `room-nonac-*`, `room-sharing-*`, `restaurant-*`, `lobby-*`, `exterior-*`, `gallery-*`).
3. Images are automatically resized to max 1600px wide and compressed at 0.8 quality in `localStorage`, updating all public pages instantaneously. Slots larger than 500 KB display an optimization warning.

## Connecting a Real Backend

The data layer is isolated behind `HotelRepository` in `src/data/repo.ts`:

- **Database (Firebase / Supabase):** Implement the `HotelRepository` interface in a new adapter (e.g., `FirestoreHotelRepository` or `SupabaseHotelRepository`) and export it as `hotelRepo` from `src/data/repo.ts`.
- **Payments (Razorpay):** In `src/pages/BookPage.tsx` (Step 4), replace the UPI QR / Pay-at-Hotel confirmation handler with `window.Razorpay` order verification before calling `repo.createBooking(...)`.
- **WhatsApp Business API:** Update `buildWhatsAppConfirmationUrl` or trigger a server-side webhook inside `createBooking` / `updateBookingStatus` in `src/data/repo.ts` to dispatch automated template messages on confirmation and checkout.
