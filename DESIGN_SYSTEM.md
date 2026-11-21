# Resend-Inspired Tokenized Design System Specification

> **Design Intent**: Deliver a precision, token-driven dark-obsidian interface system pairing crisp `Inter` typography, electric `#00A3FF` highlights, and WCAG 2.2 AA contrast with smooth GPU-composited motion across every marketing, booking, and operations surface.

---

## 1. Context and Goals

- **Scope**: Marketing site, multi-step booking flow, guest self-service portal, and staff admin dashboard.
- **Audience**: Guests, families, business travellers, and hotel operations staff.
- **Architecture**: CSS Custom Properties (`src/styles/tokens.css`) mapped directly into Tailwind CSS v4 `@theme` (`src/index.css`) so zero raw hex values appear inside components.
- **Density Baseline**: Supports high-craft marketing density targets (`links: 56`, `buttons: 51`, `lists: 9`, `inputs: 3`, `navigation: 3`, `tables: 3`) with clean single-line controls and predictable wrapping.

---

## 2. Design Tokens and Foundations

### Color Tokens (Semantic Only)
- `color.surface.base`: `#000000` (primary obsidian canvas)
- `color.surface.raised`: `#0A0D12` (elevated card/panel surface)
- `color.surface.muted`: `#12171F` (subtle segmented surface)
- `color.surface.mist`: `#D6EBFD` / `color.surface.ice`: `#D3EDF8` (high-emphasis accent chips/cards paired strictly with dark ink `#05070A`)
- `color.text.primary`: `#F0F0F0` (18.9:1 on `#000000`)
- `color.text.secondary`: `#A1A4A5` (8.3:1 on `#000000`)
- `color.text.tertiary`: `#FCFDFF`
- `color.text.inverse`: `#05070A` (16.8:1 on `#D6EBFD`, 8.08:1 on `#00A3FF`)
- `color.text.accent`: `#00A3FF` (8.08:1 on `#000000`)
- `color.action.primary`: `#00A3FF` (hover `#38B9FF`)

### Typography Scale
- **Font Stack**: `'Inter', ui-sans-serif, system-ui, sans-serif` (plus `'JetBrains Mono'` for booking IDs and tabular codes).
- **Scale**: `xs=12px`, `sm=14px`, `md=16px` (`line-height: 24px`), `lg=18px`, `xl=20px`, `2xl=24px`, `3xl=56px`, `4xl=76.8px`.
- **Numerals**: All prices, dates, counts, and metrics **must** apply `font-variant-numeric: tabular-nums`.

### Spacing, Radius, Shadow & Motion
- **Spacing**: `space.1=1px`, `space.2=2px`, `space.3=4px`, `space.4=5px`, `space.5=6px`, `space.6=8px`, `space.7=10px`, `space.8=12px` (plus harmonic layout steps).
- **Radii**: `xs=4px`, `sm=6px`, `md=8px`, `lg=16px`, `xl=24px`, `full=9999px`.
- **Motion**: `instant=150ms`, `fast=200ms`, `normal=500ms` with `cubic-bezier(0.22, 1, 0.36, 1)`. All transitions **must** animate only `transform`, `opacity`, or `filter` and disable under `prefers-reduced-motion: reduce`.

---

## 3. Component-Level Rules

Every interactive component **must** implement all seven states: **default**, **hover**, **focus-visible** (`2px` solid `--color-border-focus`, `2px` offset), **active**, **disabled**, **loading** (`aria-busy` + spinner), and **error**.

1. **Buttons (`primary`, `accent`, `secondary`, `ghost`, `icon`)**
   - Minimum `44px × 44px` touch target (`40px` compact).
   - Keyboard: `Enter` and `Space` activate; `disabled` suppresses all click handlers.
   - Primary `#00A3FF` surface **must** use `#05070A` dark ink text to maintain `>8:1` contrast.
2. **Navigation & Drawers**
   - Top bar **must** follow the 3-zone contract: Brand Wordmark — 5 concise single-line links — 1 primary CTA.
   - Mobile drawer **must** trap focus, close on `Escape`, and restore focus to trigger.
3. **Form Inputs & Date Range Picker**
   - Every input **must** have a visible `<label>` and `aria-describedby` error/helper linkage.
   - Calendar picker **must** support Left/Right/Up/Down arrow navigation across dates and announce unavailable/past dates to screen readers.
4. **Cards, Carousels, Lightbox & Tables**
   - Room sliders **must** support keyboard Left/Right arrows, drag/swipe, and pause on hover/focus.
   - Tables **must** provide sticky headers, sortable columns, mobile card fallbacks, and empty/loading/error states.

---

## 4. Accessibility Acceptance Criteria (Testable)

- **Contrast**: Every text/background pair **must** achieve $\ge 4.5:1$ (body) and $\ge 3:1$ (large text / UI controls), including hero scrims.
- **Focus**: Tabbing through every interactive element **must** display an unobstructed `2px` `#00A3FF` focus ring.
- **Keyboard-Only**: Complete booking flow, room filtering, lightbox navigation, and admin actions **must** operate without a pointer.
- **Motion & Media**: Background hero video **must** provide a visible Pause/Play button; reduced-motion media query **must** disable non-essential motion.

---

## 5. Content and Tone Standards

- Tone is concise, confident, and implementation-focused.
- Buttons **must** describe the exact outcome: `"Book Direct Now"`, `"Check Availability"`, `"Call the Front Desk"`, never `"Click here"` or `"Submit"`.
- Error messages **must** explain the fix clearly: `"Check-out must be after check-in."`

---

## 6. Anti-Patterns and Prohibited Implementations

- Do **not** render white text on `#00A3FF` or `#D6EBFD` surfaces (fails WCAG AA contrast).
- Do **not** hardcode raw hex values inside React components.
- Do **not** hide or remove `:focus-visible` outlines.
- Do **not** wrap static metadata in pill boxes; separate metadata with clean typographic `·` delimiters.

---

## 7. QA Checklist

- [ ] All semantic tokens loaded from `src/styles/tokens.css` and `@theme`
- [ ] All 7 interactive states verified across Buttons, Inputs, Tabs, Modals, and Pickers
- [ ] Zero WCAG 2.2 AA contrast failures across dark obsidian and bright cyan surfaces
- [ ] Keyboard-only pass on Home, Rooms, Book, and Admin routes
- [ ] Responsive layout verified at `320px`, `768px`, and `1440px` with zero horizontal overflow
- [ ] Reduced-motion mode verified
