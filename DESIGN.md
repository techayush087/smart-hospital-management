# Design Document
# Smart Hospital Appointment and Patient Management System

**Version:** 1.0.0  
**Status:** Approved  
**Authors:** Senior UI/UX Design Team + Senior Frontend Architecture Team  
**Last Updated:** 2026-06-09

---

## Table of Contents

1. [Design Philosophy](#1-design-philosophy)
2. [Design System Tokens (theme.css)](#2-design-system-tokens-themecss)
3. [Typography System](#3-typography-system)
4. [Color System](#4-color-system)
5. [Spacing and Grid](#5-spacing-and-grid)
6. [Component Design Specifications](#6-component-design-specifications)
7. [Page-Level UX Specifications](#7-page-level-ux-specifications)
8. [Animation and Motion Design](#8-animation-and-motion-design)
9. [Responsive Design](#9-responsive-design)
10. [Accessibility Standards](#10-accessibility-standards)
11. [Icon System](#11-icon-system)
12. [Form Design Patterns](#12-form-design-patterns)
13. [Empty States and Error States](#13-empty-states-and-error-states)
14. [CSS Architecture Rules](#14-css-architecture-rules)

---

## 1. Design Philosophy

The UI of SHAPMS must communicate trust, clarity, and clinical professionalism. It targets patients who may be anxious, administrators who are time-pressured, and must be immediately legible without onboarding.

**Core Principles:**

- **Human over clinical:** Warm, approachable UI that feels human — not cold hospital software
- **Progressive disclosure:** Show only what the user needs at each step
- **Confidence through clarity:** Large labels, generous whitespace, unambiguous CTAs
- **Speed perception:** Skeleton loaders, instant feedback on interactions, Lottie animations mask waiting
- **Zero AI-look:** No default card grids with equal border radius everywhere, no gradient header banners, no generic hero sections — every layout decision must be intentional

**Anti-patterns to avoid:**
- ❌ Cards with identical height and 8px radius on everything — looks like a shadcn/tailwind template
- ❌ Gradient primary buttons with rounded-full everywhere — looks like a SaaS landing page generator
- ❌ Icon + title + 3 lines of text grid — looks like a ChatGPT output
- ❌ Centered hero with large gradient text — AI landing page hallmark
- ❌ Same component padding on every breakpoint
- ❌ No variation in visual weight between elements

---

## 2. Design System Tokens (theme.css)

```css
/* ============================================================
   theme.css — SINGLE SOURCE OF TRUTH
   All colors, typography, spacing, motion come from here.
   No hardcoded values anywhere else in the codebase.
   ============================================================ */

:root {
  /* ── Brand Colors ── */
  --color-primary:          #1A6FE8;      /* Deep medical blue */
  --color-primary-dark:     #1358C4;
  --color-primary-light:    #EEF4FD;
  --color-primary-hover:    #1561D4;
  --color-secondary:        #0DADA3;      /* Teal accent */
  --color-secondary-dark:   #0A9189;
  --color-secondary-light:  #E6F7F6;

  /* ── Semantic Colors ── */
  --color-success:          #1D9E5A;
  --color-success-bg:       #E8F7EF;
  --color-warning:          #E07B0C;
  --color-warning-bg:       #FEF3E2;
  --color-danger:           #DC3545;
  --color-danger-bg:        #FDECEA;
  --color-info:             #0F72E5;
  --color-info-bg:          #EEF4FD;

  /* ── Neutral Palette ── */
  --color-white:            #FFFFFF;
  --color-background:       #F5F7FB;      /* Page background */
  --color-surface:          #FFFFFF;      /* Card/panel surface */
  --color-surface-alt:      #F0F3F9;      /* Alt surface / sidebar */
  --color-border:           #DDE3EE;
  --color-border-focus:     #1A6FE8;
  --color-divider:          #EDF0F7;

  /* ── Text Colors ── */
  --color-text-primary:     #141C2E;      /* Near black — main headings */
  --color-text-secondary:   #4E5E7A;      /* Secondary labels */
  --color-text-tertiary:    #8C9AB5;      /* Placeholder, captions */
  --color-text-inverse:     #FFFFFF;
  --color-text-link:        #1A6FE8;
  --color-text-link-hover:  #1358C4;

  /* ── Appointment Status Colors ── */
  --color-status-pending:   #E07B0C;
  --color-status-confirmed: #1D9E5A;
  --color-status-completed: #4E5E7A;
  --color-status-cancelled: #DC3545;
  --color-status-rescheduled: #1A6FE8;

  /* ── Typography ── */
  --font-family:            'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-family-mono:       'JetBrains Mono', 'Fira Code', monospace;

  --font-size-xs:           0.75rem;     /* 12px */
  --font-size-sm:           0.875rem;    /* 14px */
  --font-size-base:         1rem;        /* 16px */
  --font-size-md:           1.125rem;    /* 18px */
  --font-size-lg:           1.25rem;     /* 20px */
  --font-size-xl:           1.5rem;      /* 24px */
  --font-size-2xl:          1.875rem;    /* 30px */
  --font-size-3xl:          2.25rem;     /* 36px */

  --font-weight-regular:    400;
  --font-weight-medium:     500;
  --font-weight-semibold:   600;
  --font-weight-bold:       700;

  --line-height-tight:      1.2;
  --line-height-normal:     1.5;
  --line-height-relaxed:    1.7;

  --letter-spacing-tight:   -0.02em;
  --letter-spacing-normal:  0;
  --letter-spacing-wide:    0.04em;
  --letter-spacing-caps:    0.1em;

  /* ── Spacing ── */
  --spacing-1:              0.25rem;     /* 4px */
  --spacing-2:              0.5rem;      /* 8px */
  --spacing-3:              0.75rem;     /* 12px */
  --spacing-4:              1rem;        /* 16px */
  --spacing-5:              1.25rem;     /* 20px */
  --spacing-6:              1.5rem;      /* 24px */
  --spacing-8:              2rem;        /* 32px */
  --spacing-10:             2.5rem;      /* 40px */
  --spacing-12:             3rem;        /* 48px */
  --spacing-16:             4rem;        /* 64px */
  --spacing-20:             5rem;        /* 80px */
  --spacing-24:             6rem;        /* 96px */

  /* ── Border Radius ── */
  --radius-xs:              2px;
  --radius-sm:              4px;
  --radius-md:              8px;
  --radius-lg:              12px;
  --radius-xl:              16px;
  --radius-2xl:             24px;
  --radius-full:            9999px;

  /* ── Shadows ── */
  --shadow-xs:  0 1px 2px rgba(20, 28, 46, 0.06);
  --shadow-sm:  0 2px 4px rgba(20, 28, 46, 0.08);
  --shadow-md:  0 4px 12px rgba(20, 28, 46, 0.10);
  --shadow-lg:  0 8px 24px rgba(20, 28, 46, 0.12);
  --shadow-xl:  0 16px 40px rgba(20, 28, 46, 0.14);
  --shadow-card: 0 2px 8px rgba(20, 28, 46, 0.08);
  --shadow-card-hover: 0 6px 20px rgba(26, 111, 232, 0.14);
  --shadow-input-focus: 0 0 0 3px rgba(26, 111, 232, 0.18);

  /* ── Transitions ── */
  --transition-instant:     80ms ease;
  --transition-fast:        160ms ease;
  --transition-normal:      240ms ease;
  --transition-slow:        400ms ease;
  --transition-spring:      400ms cubic-bezier(0.34, 1.56, 0.64, 1);

  /* ── Z-index layers ── */
  --z-base:                 0;
  --z-raised:               10;
  --z-dropdown:             100;
  --z-sticky:               200;
  --z-overlay:              300;
  --z-modal:                400;
  --z-toast:                500;
  --z-tooltip:              600;
}
```

---

## 3. Typography System

### Type Scale Application

| Token | Size | Weight | Use Case |
|-------|------|--------|----------|
| `--font-size-3xl` | 36px | Bold 700 | Page hero titles |
| `--font-size-2xl` | 30px | Semibold 600 | Page titles (h1) |
| `--font-size-xl` | 24px | Semibold 600 | Section headings (h2) |
| `--font-size-lg` | 20px | Semibold 600 | Card titles (h3) |
| `--font-size-md` | 18px | Medium 500 | Subheadings |
| `--font-size-base` | 16px | Regular 400 | Body text |
| `--font-size-sm` | 14px | Regular 400 | Secondary text, labels |
| `--font-size-xs` | 12px | Regular 400 | Captions, helper text, badges |

### Font: Inter

Import in `index.html`:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/icon?family=Material+Icons+Round" rel="stylesheet">
```

---

## 4. Color System

### Primary Palette Usage

| Color | CSS Variable | Used For |
|-------|-------------|----------|
| Deep Blue `#1A6FE8` | `--color-primary` | CTA buttons, links, active states, focus rings |
| Teal `#0DADA3` | `--color-secondary` | Available slot indicators, health metrics, success accent |
| Near Black `#141C2E` | `--color-text-primary` | All primary headings and critical labels |
| Slate `#4E5E7A` | `--color-text-secondary` | Descriptive text, metadata |
| Page BG `#F5F7FB` | `--color-background` | Application background |
| White `#FFFFFF` | `--color-surface` | Cards, panels, modals |

### Status Color Mapping

```scss
// appointment-status.component.scss (example)
.status-badge {
  &--pending    { background: var(--color-warning-bg); color: var(--color-status-pending); }
  &--confirmed  { background: var(--color-success-bg); color: var(--color-status-confirmed); }
  &--completed  { background: var(--color-surface-alt); color: var(--color-text-secondary); }
  &--cancelled  { background: var(--color-danger-bg); color: var(--color-status-cancelled); }
  &--rescheduled{ background: var(--color-primary-light); color: var(--color-status-rescheduled); }
}
```

---

## 5. Spacing and Grid

### Layout Grid

```
Desktop (≥1280px):    12-column, 24px gutter, 1200px max-width
Tablet (768–1279px):  8-column, 20px gutter
Mobile (<768px):      4-column, 16px gutter
```

### Sidebar Layout (Admin + Patient Zones)

```
┌──────────────────────────────────────────────────────────┐
│ Top Nav (64px)                                           │
├──────────┬───────────────────────────────────────────────┤
│          │                                               │
│ Sidebar  │          Main Content Area                    │
│ (260px)  │          (fluid, max-width 1140px)           │
│          │                                               │
│          │                                               │
└──────────┴───────────────────────────────────────────────┘
```

---

## 6. Component Design Specifications

### 6.1 AppButtonComponent

```
Variants:
  primary   → bg: --color-primary, text: white, hover: --color-primary-hover
  secondary → bg: transparent, border: --color-border, hover: --color-surface-alt
  danger    → bg: --color-danger, text: white
  ghost     → bg: transparent, text: --color-primary, no border

Sizes: sm (32px h, 14px), md (40px h, 15px), lg (48px h, 16px)
Border radius: --radius-md (8px)
Loading state: MatProgressSpinner inside button, text hidden
```

### 6.2 Doctor Card

```
Layout: Horizontal flex card (not vertical icon-title grid)

┌─────────────────────────────────────────────────────┐
│  [Avatar 56px]  Dr. Sarah Chen               [⭐4.9]│
│                 Cardiologist · 12 yrs exp           │
│                 📍 City Hospital, Manhattan          │
│  ─────────────────────────────────────────────────  │
│  [ In-Person ]  [ Virtual ]    Next: Tomorrow 10AM  │
│                               [Book Appointment →]  │
└─────────────────────────────────────────────────────┘

- No rounded avatars with background gradients
- Rating shown as text number + filled star icon, not stars row
- Specialization + experience on same line, subdued color
- CTA aligned right, secondary info left
- Card hover: shadow transitions from --shadow-card to --shadow-card-hover
```

### 6.3 Booking Wizard

```
Stepper: Horizontal step indicators (not Angular Material default)

  1 ──────── 2 ──────── 3
Select Slot  Details   Confirm

- Active step: --color-primary circle + label
- Completed step: checkmark icon
- Inactive: --color-border circle

Slot Grid:
  ┌────────┐ ┌────────┐ ┌────────┐
  │ 9:00AM │ │10:00AM │ │11:00AM │
  └────────┘ └────────┘ └────────┘
  
  Available slot:    border --color-border, hover: --color-primary-light
  Selected slot:     bg --color-primary, text white
  Unavailable slot:  bg --color-surface-alt, text --color-text-tertiary, cursor-not-allowed
```

### 6.4 Notification Toast

```
Position: Bottom-right, stacked, max 3 visible
Width: 360px
Variants: success (green left border), warning (orange), error (red), info (blue)
Auto-dismiss: 4s with progress bar animation
Manual dismiss: × button (Material Close icon)
Entry animation: slideInRight 240ms
Exit animation: slideOutRight 200ms + height collapse
```

### 6.5 Medical Timeline

```
Layout: Left-bordered vertical timeline

  │
  ●  June 5, 2026 · Dr. Sarah Chen · Cardiology
  │  Consultation — Completed
  │  Prescription: Metoprolol 25mg
  │
  ●  May 20, 2026 · Dr. Roy Patel · General Medicine
  │  Follow-up — Completed
  │
  ●  March 12, 2026 · Dr. Aiko Tanaka · Dermatology
     Initial Visit — Completed
     Prescription: Tretinoin 0.025%

- Timeline line: 2px --color-divider
- Dot: 12px circle, color by status
- Date: --font-size-xs, --color-text-tertiary, uppercase
- Doctor name: --font-size-sm, --font-weight-semibold
```

---

## 7. Page-Level UX Specifications

### Login Page

```
Layout: Split — Left: illustration/brand, Right: form
No: full-page gradient background
No: floating card in center of screen (generic)
Form: email + password, remember me checkbox
Google-style input (label floats on focus)
"Forgot Password" as text link below password
CTA: "Sign In" full-width primary button
Link to register below CTA
```

### Patient Dashboard

```
Layout: Top stats row → Upcoming appointments section → Quick actions

Stats row (4 cards, different visual weight):
  - Next Appointment (most prominent, teal accent)
  - Total Visits
  - Active Prescriptions
  - Notifications (count badge)

Upcoming appointments: compact list (not card grid) with time, doctor, status badge
Quick actions: Book New, View History, View Prescriptions — horizontal icon+label buttons
```

### Admin Dashboard

```
Layout: KPI row → Charts row → Recent activity table

KPI row: 4 stat cards (Today's Appointments, Total Patients, Pending Actions, Doctors Available)
Charts: Appointments trend (line chart) + Specialty distribution (donut chart)
Activity table: Recent bookings with status updates, pagination
```

### Doctor Listing

```
Layout: Filter sidebar (left 280px) + Results list (right)

Filter sidebar:
  - Specialization (checkbox group)
  - Location (text search)
  - Availability (date picker)
  - Consultation type (toggle: All / In-Person / Virtual)
  - Rating (star filter)
  - Clear all filters link

Results: Horizontal doctor cards (see 6.2), sorted by relevance
Search bar at top, results count shown
No results: EmptyStateComponent with Lottie animation
```

---

## 8. Animation and Motion Design

### Lottie Animations

| Use Case | File | Trigger |
|----------|------|---------|
| Page loading overlay | `assets/animations/loading-pulse.json` | API call in progress |
| Empty doctor search | `assets/animations/empty-search.json` | 0 results returned |
| Booking success | `assets/animations/booking-success.json` | Appointment confirmed |
| Empty notifications | `assets/animations/empty-inbox.json` | 0 notifications |
| No appointments yet | `assets/animations/calendar-empty.json` | Empty appointment list |

Implementation in AppLoaderComponent and EmptyStateComponent:
```typescript
import { LottieComponent, AnimationOptions } from 'ngx-lottie';

options: AnimationOptions = {
  path: '/assets/animations/loading-pulse.json',
  loop: true,
  autoplay: true
};
```

### Angular Route Animations

```typescript
// app.component.ts
export const routeAnimations = trigger('routeAnimations', [
  transition('* <=> *', [
    query(':enter', [style({ opacity: 0, transform: 'translateY(8px)' })], { optional: true }),
    query(':leave', animateChild(), { optional: true }),
    group([
      query(':leave', [animate('160ms ease', style({ opacity: 0 }))], { optional: true }),
      query(':enter', [animate('240ms ease', style({ opacity: 1, transform: 'translateY(0)' }))], { optional: true })
    ])
  ])
]);
```

### CSS Micro-Interactions (in animations.scss)

```scss
@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes slideInRight {
  from { opacity: 0; transform: translateX(24px); }
  to   { opacity: 1; transform: translateX(0); }
}

@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.95); }
  to   { opacity: 1; transform: scale(1); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.5; }
}

// Skeleton loader animation
@keyframes shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.skeleton {
  background: linear-gradient(90deg,
    var(--color-surface-alt) 25%,
    var(--color-divider) 50%,
    var(--color-surface-alt) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
  border-radius: var(--radius-sm);
}
```

---

## 9. Responsive Design

### Breakpoints (in mixins.scss)

```scss
@mixin respond-to($bp) {
  @if      $bp == 'mobile'  { @media (max-width: 767px)    { @content; } }
  @else if $bp == 'tablet'  { @media (768px to 1279px)     { @content; } }
  @else if $bp == 'desktop' { @media (min-width: 1280px)   { @content; } }
  @else if $bp == 'wide'    { @media (min-width: 1440px)   { @content; } }
}
```

### Mobile Adaptations

- Sidebar collapses to bottom tab bar on mobile
- Doctor cards stack vertically on mobile
- Booking wizard steps shown one at a time (swipe navigation)
- Admin dashboard: chart stack below KPIs, table becomes cards
- Modal: full-screen bottom sheet on mobile

---

## 10. Accessibility Standards

- WCAG 2.1 Level AA minimum compliance
- Color contrast: all text/background combinations ≥ 4.5:1
- Focus rings: 3px `--shadow-input-focus` on all interactive elements
- `aria-label` on all icon-only buttons
- `role="status"` on notification regions
- Keyboard navigation: full tab order, ESC closes modals
- Screen reader: meaningful alt text on all images
- Form errors: `aria-describedby` linking input to error message
- Loading states: `aria-live="polite"` on result containers

---

## 11. Icon System

**Library:** Material Icons Round (Google Fonts CDN)  
**Usage:** `<mat-icon>calendar_today</mat-icon>` or `<span class="material-icons-round">...</span>`

### Standard Icon Assignments

| UI Element | Icon Name |
|------------|-----------|
| Dashboard | `dashboard` |
| Appointments | `calendar_today` |
| Doctors | `medical_services` |
| Prescriptions | `medication` |
| History | `history` |
| Notifications | `notifications` |
| Profile | `person` |
| Settings | `settings` |
| Search | `search` |
| Filter | `tune` |
| Back | `arrow_back` |
| Close / Cancel | `close` |
| Add / New | `add` |
| Edit | `edit` |
| Delete | `delete` |
| Confirm | `check_circle` |
| Warning | `warning` |
| Error | `error` |
| Info | `info` |
| Logout | `logout` |
| Location | `location_on` |
| Clock / Time | `access_time` |
| Phone | `phone` |
| Email | `email` |
| Rating / Star | `star` |
| Virtual consultation | `videocam` |
| In-person | `local_hospital` |
| Admin | `admin_panel_settings` |
| Report | `bar_chart` |
| Schedule | `event_note` |

---

## 12. Form Design Patterns

### Input Fields

```scss
// Float-label pattern (Material Design inspired, not stock Material)
.form-field {
  position: relative;
  margin-bottom: var(--spacing-5);

  &__input {
    width: 100%;
    height: 52px;
    padding: var(--spacing-4) var(--spacing-4) var(--spacing-2);
    border: 1.5px solid var(--color-border);
    border-radius: var(--radius-md);
    font-size: var(--font-size-base);
    color: var(--color-text-primary);
    background: var(--color-surface);
    transition: border-color var(--transition-fast), box-shadow var(--transition-fast);

    &:focus {
      outline: none;
      border-color: var(--color-border-focus);
      box-shadow: var(--shadow-input-focus);
    }

    &.ng-invalid.ng-touched {
      border-color: var(--color-danger);
    }
  }

  &__label {
    position: absolute;
    top: 50%;
    left: var(--spacing-4);
    transform: translateY(-50%);
    font-size: var(--font-size-base);
    color: var(--color-text-tertiary);
    pointer-events: none;
    transition: all var(--transition-fast);
  }

  &__input:focus ~ &__label,
  &__input:not(:placeholder-shown) ~ &__label {
    top: var(--spacing-2);
    transform: none;
    font-size: var(--font-size-xs);
    color: var(--color-primary);
  }

  &__error {
    font-size: var(--font-size-xs);
    color: var(--color-danger);
    margin-top: var(--spacing-1);
    display: flex;
    align-items: center;
    gap: var(--spacing-1);
  }
}
```

---

## 13. Empty States and Error States

### EmptyStateComponent Design

```
┌──────────────────────────────────────┐
│                                      │
│     [Lottie Animation 180px]         │
│                                      │
│     No appointments yet              │  ← --font-size-lg, semibold
│                                      │
│     Book your first appointment      │  ← --font-size-sm, text-secondary
│     with a doctor today.             │
│                                      │
│     [Book Appointment]               │  ← primary button
│                                      │
└──────────────────────────────────────┘
```

### Skeleton Loaders

Doctor list loads with skeleton cards (same dimensions as real cards) with shimmer animation — no spinner in the middle of the page.

---

## 14. CSS Architecture Rules

```
ENFORCED RULES — These will be reviewed by Senior UI/UX Designer:

1. NO inline style="" in any .html template file — zero exceptions
2. NO hardcoded hex/rgb colors in component .scss files
3. ALL colors must reference var(--color-*) from theme.css
4. ALL font sizes must reference var(--font-size-*) from theme.css
5. ALL spacing must reference var(--spacing-*) from theme.css
6. ALL border-radius must reference var(--radius-*) from theme.css
7. ALL shadows must reference var(--shadow-*) from theme.css
8. ALL transitions must reference var(--transition-*) from theme.css
9. Component SCSS only styles that component — no reaching into children
10. BEM naming: .component-name__element--modifier
11. :host { display: block; } on every component
12. No z-index magic numbers — use var(--z-*) tokens

SCSS FILE SIZE RULE:
  If a component SCSS exceeds 150 lines, extract sub-patterns to mixins.scss

THEME MODIFICATION:
  To change a color/font/spacing globally → edit theme.css only
  Never fork a specific color for "this one component"
```
