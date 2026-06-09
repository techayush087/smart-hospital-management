# Architecture Document
# Smart Hospital Appointment and Patient Management System

**Version:** 1.0.0  
**Status:** Approved  
**Authors:** Senior Architecture Team  
**Last Updated:** 2026-06-09

---

## Table of Contents

1. [Architecture Philosophy](#1-architecture-philosophy)
2. [System Context Diagram](#2-system-context-diagram)
3. [Component Architecture Diagram](#3-component-architecture-diagram)
4. [Use Case Diagram](#4-use-case-diagram)
5. [Angular Module Dependency Graph](#5-angular-module-dependency-graph)
6. [NgRx Data Flow Architecture](#6-ngrx-data-flow-architecture)
7. [Change Detection Architecture](#7-change-detection-architecture)
8. [Routing Architecture](#8-routing-architecture)
9. [Security Architecture](#9-security-architecture)
10. [Styling Architecture](#10-styling-architecture)
11. [Testing Architecture](#11-testing-architecture)
12. [Deployment Architecture](#12-deployment-architecture)
13. [Decision Log](#13-decision-log)

---

## 1. Architecture Philosophy

The system is built on four pillars:

**1. Separation of Concerns**  
Each layer has one responsibility. Core handles cross-cutting concerns. Feature modules own their domain. Shared provides reuse. Store handles predictable state for complex domains only.

**2. Composition over Inheritance**  
Angular standalone components compose behavior through directives, pipes, and injected services rather than class hierarchies.

**3. Minimal State Surface**  
State is managed at the lowest viable scope: component signal → service signal → NgRx. NgRx is used only where shared, async, and complex state intersects (Appointment Catalog only).

**4. Test-First Quality**  
Every public interface is designed to be testable in isolation. Services are mockable, validators are pure functions, pipes are stateless transforms.

---

## 2. System Context Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                         SHAPMS System                           │
│                                                                  │
│  ┌───────────┐    ┌────────────────────────────────────────┐    │
│  │  Patient  │───▶│                                        │    │
│  │  (Browser)│    │       Angular 21 SPA                   │    │
│  └───────────┘    │    (smart-hospital frontend)           │    │
│                   │                                        │    │
│  ┌───────────┐    │  ┌──────────┐  ┌──────────────────┐   │    │
│  │   Admin   │───▶│  │  NgRx    │  │  Angular Signals  │   │    │
│  │  (Browser)│    │  │  Store   │  │  + Services       │   │    │
│  └───────────┘    │  └──────────┘  └──────────────────┘   │    │
│                   └──────────────────┬─────────────────────┘    │
│                                      │ HTTPS REST               │
│                   ┌──────────────────▼─────────────────────┐    │
│                   │         Backend API                      │    │
│                   │   (JSON Server for dev / Node.js prod)  │    │
│                   └──────────────────┬─────────────────────┘    │
│                                      │                          │
│                   ┌──────────────────▼─────────────────────┐    │
│                   │           Data Store                     │    │
│                   │    db.json (dev) / PostgreSQL (prod)     │    │
│                   └─────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────┘
```

---

## 3. Component Architecture Diagram

```
AppComponent (Root Shell)
│
├── CoreModule (Singletons — provided in root)
│   ├── AuthService
│   ├── ApiService
│   ├── NotificationService
│   ├── SessionService
│   ├── AuthGuard
│   ├── RoleGuard
│   ├── AuthTokenInterceptor
│   └── ErrorHandlerInterceptor
│
├── SharedModule (Reusable — standalone imports)
│   ├── AppButtonComponent
│   ├── AppCardComponent
│   ├── AppModalComponent
│   ├── AppLoaderComponent
│   ├── AppBadgeComponent
│   ├── AppAvatarComponent
│   ├── SearchBarComponent
│   ├── EmptyStateComponent
│   ├── PageHeaderComponent
│   ├── NotificationToastComponent
│   ├── Directives: AutofocusDirective, RoleAccessDirective, HighlightDirective, TooltipDirective
│   └── Pipes: TimeSlotPipe, AgePipe, AppointmentStatusPipe, RelativeDatePipe, TruncatePipe
│
├── Feature: Auth (Lazy)
│   ├── LoginComponent           ← Reactive Form
│   ├── RegisterComponent        ← Reactive Form + Custom Validators
│   └── ProfileComponent         ← Reactive + Template-Driven (preferences)
│
├── Feature: Doctors (Lazy)
│   ├── DoctorListComponent      ← OnPush, TrackBy, Signal filters
│   ├── DoctorCardComponent      ← Dumb/presentational
│   ├── DoctorDetailComponent    ← OnPush, loads slots → dispatches NgRx
│   └── DoctorFilterComponent    ← Signal-based filter state, emits to parent
│
├── Feature: Appointment (Lazy + NgRx)
│   ├── AppointmentListComponent ← Selects from NgRx store
│   ├── BookingWizardComponent   ← Multi-step, OnPush, Signal step tracking
│   │   ├── StepSelectSlotComponent     ← NgRx selector: availableSlots
│   │   ├── StepPatientDetailsComponent ← Dynamic form from config
│   │   └── StepConfirmationComponent   ← Summary + dispatch bookSlot action
│   ├── AppointmentDetailComponent
│   └── RescheduleModalComponent  ← dispatches rescheduleAppointment action
│
├── Feature: Patient (Lazy)
│   ├── PatientDashboardComponent
│   ├── VisitHistoryComponent    ← RelativeDatePipe, AppointmentStatusPipe
│   ├── PrescriptionViewComponent
│   └── MedicalTimelineComponent ← Virtualized, track by visitId
│
├── Feature: Admin (Lazy, roleGuard: admin)
│   ├── AdminDashboardComponent  ← Charts, stats
│   ├── ScheduleManagerComponent ← CRUD doctor schedules
│   ├── PatientRecordsAdminComponent
│   └── ReportsComponent
│
├── Feature: Notifications (Lazy)
│   ├── NotificationListComponent
│   └── NotificationItemComponent
│
└── NgRx Store: appointmentCatalog Feature
    ├── Actions: loadDoctorSlots, bookSlot, cancelAppointment, rescheduleAppointment, selectSlot
    ├── Reducer: appointmentCatalogReducer (EntityAdapter)
    ├── Selectors: selectAvailableSlots, selectUpcomingAppointments, selectBookingInProgress
    └── Effects: loadDoctorSlots$, bookSlot$, cancelAppointment$, rescheduleAppointment$
```

---

## 4. Use Case Diagram

```
┌────────────────────────────────────────────────────────────────────┐
│                        SHAPMS System                               │
│                                                                    │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │                    Authentication                            │  │
│  │  • UC-01: Register Account                                   │  │
│  │  • UC-02: Login                                              │  │
│  │  • UC-03: Logout                                             │  │
│  │  • UC-04: Update Profile                                     │  │
│  │  • UC-05: Set Notification Preferences                       │  │
│  └─────────────────────────────────────────────────────────────┘  │
│         ▲ Customer + Admin                                         │
│                                                                    │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │                 Doctor & Appointment (Customer)              │  │
│  │  • UC-06: Browse Doctors                                     │  │
│  │  • UC-07: Search / Filter Doctors                            │  │
│  │  • UC-08: View Doctor Detail + Slots                         │  │
│  │  • UC-09: Book Appointment                                   │  │
│  │  • UC-10: View Appointment History                           │  │
│  │  • UC-11: Cancel Appointment                                 │  │
│  │  • UC-12: Reschedule Appointment                             │  │
│  └─────────────────────────────────────────────────────────────┘  │
│         ▲ Customer only                                            │
│                                                                    │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │                  Patient Health Records (Customer)           │  │
│  │  • UC-13: View Visit History                                 │  │
│  │  • UC-14: View Prescriptions                                 │  │
│  │  • UC-15: View Medical Timeline                              │  │
│  └─────────────────────────────────────────────────────────────┘  │
│         ▲ Customer only                                            │
│                                                                    │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │                  Notifications (Both)                        │  │
│  │  • UC-16: Receive Booking Confirmation                       │  │
│  │  • UC-17: Receive Appointment Reminder                       │  │
│  │  • UC-18: Receive Reschedule / Cancel Alert                  │  │
│  │  • UC-19: Admin Receives Schedule Conflict Alert             │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                    │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │                  Admin Operations                            │  │
│  │  • UC-20: Manage Doctor Schedules                            │  │
│  │  • UC-21: Manage Appointment Slots                           │  │
│  │  • UC-22: View Patient Master Records                        │  │
│  │  • UC-23: Update Consultation Status                         │  │
│  │  • UC-24: View Dashboard Reports                             │  │
│  └─────────────────────────────────────────────────────────────┘  │
│         ▲ Admin only                                               │
└────────────────────────────────────────────────────────────────────┘

Actors:
  👤 Customer (Patient) → UC-01 through UC-18
  🔑 Admin              → UC-01 through UC-05, UC-19 through UC-24
```

---

## 5. Angular Module Dependency Graph

```
app.config.ts
├── provideRouter(routes, withPreloading(PreloadAllModules))
├── provideHttpClient(withInterceptors([authTokenInterceptor, errorHandlerInterceptor]))
├── provideAnimations()
├── provideStore()                          ← NgRx root
├── provideEffects()
└── importProvidersFrom(StoreDevtoolsModule) ← dev only

Feature Routes (lazy) import:
├── auth.routes.ts
│   └── [LoginComponent, RegisterComponent, ProfileComponent]
│       each imports: [ReactiveFormsModule | FormsModule, SharedComponents, SharedPipes, SharedDirectives]
│
├── doctors.routes.ts
│   └── [DoctorListComponent, DoctorCardComponent, DoctorDetailComponent, DoctorFilterComponent]
│       each imports: [SharedComponents, SharedPipes, MaterialModules]
│
├── appointment.routes.ts
│   └── [AppointmentListComponent, BookingWizardComponent, ...]
│       each imports: [StoreModule.forFeature('appointmentCatalog', ...), SharedComponents, ReactiveFormsModule]
│
├── patient.routes.ts
│   └── [PatientDashboardComponent, VisitHistoryComponent, ...]
│       each imports: [SharedComponents, SharedPipes]
│
├── admin.routes.ts
│   └── [AdminDashboardComponent, ScheduleManagerComponent, ...]
│       each imports: [SharedComponents, ReactiveFormsModule, MaterialModules]
│
└── notifications.routes.ts
    └── [NotificationListComponent, NotificationItemComponent]
        each imports: [SharedComponents, SharedPipes]
```

---

## 6. NgRx Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                  Appointment Feature Zone                        │
│                                                                  │
│  BookingWizardComponent                                          │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Step 1: StepSelectSlotComponent                         │   │
│  │    store.select(selectAvailableSlots) ──► renders slots  │   │
│  │    user selects slot ──► dispatch(selectSlot({ slot }))  │   │
│  │                                                          │   │
│  │  Step 2: StepPatientDetailsComponent                     │   │
│  │    Dynamic form from APPOINTMENT_FORM_CONFIG             │   │
│  │    store.select(selectSelectedSlot) ──► display summary  │   │
│  │                                                          │   │
│  │  Step 3: StepConfirmationComponent                       │   │
│  │    dispatch(bookSlot({ booking }))                       │   │
│  │    store.select(selectBookingInProgress) ──► loading UI  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                       │                                          │
│                       ▼ Action                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    NgRx Effects                          │    │
│  │  loadDoctorSlots$ → switchMap → DoctorService.getSlots  │    │
│  │  bookSlot$        → exhaustMap → AppointmentService.book│    │
│  │  cancelAppointment$ → mergeMap → AppointmentService.del │    │
│  └─────────────┬───────────────────────────────────────────┘    │
│                │ Success/Failure Actions                         │
│                ▼                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    NgRx Reducer                          │    │
│  │  appointmentCatalogReducer (EntityAdapter)               │    │
│  │  on(loadDoctorSlotsSuccess) → set availableSlots         │    │
│  │  on(bookSlotSuccess)        → upsertOne to entity        │    │
│  │  on(selectSlot)             → set selectedSlot           │    │
│  └─────────────┬───────────────────────────────────────────┘    │
│                │                                                  │
│                ▼ Store State                                      │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    NgRx Selectors                        │    │
│  │  Components subscribe via store.select()                 │    │
│  │  selectAvailableSlots, selectUpcomingAppointments,       │    │
│  │  selectBookingInProgress, selectSelectedSlot             │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 7. Change Detection Architecture

```
Strategy: ALL components use ChangeDetectionStrategy.OnPush

Benefits:
  - Component only re-renders when:
    1. @Input reference changes
    2. Event originates within component
    3. Async pipe emits new value
    4. Signal changes (automatic)
    5. Manual markForCheck() called

Angular Signals replace zone-triggered detection for:
  - Filter state in DoctorFilterComponent
  - Step tracking in BookingWizardComponent
  - Loading flags in service-connected components
  - Unread notification count in header

RxJS async pipe used for:
  - NgRx store selectors (Observable)
  - HTTP streams before they're needed as signals

Pattern enforced:
  ✓ component.ts: changeDetection: ChangeDetectionStrategy.OnPush
  ✓ Templates: (store.select(...) | async) not manual subscribe
  ✓ No direct DOM manipulation outside Angular lifecycle
  ✓ trackBy in every ngFor
```

---

## 8. Routing Architecture

```
/                           → redirect to /auth/login
/auth/login                 → LoginComponent
/auth/register              → RegisterComponent

[AuthGuard]
/doctors                    → DoctorListComponent
/doctors/:id                → DoctorDetailComponent

[AuthGuard + RoleGuard: customer]
/patient/dashboard          → PatientDashboardComponent
/patient/history            → VisitHistoryComponent
/patient/prescriptions      → PrescriptionViewComponent
/appointments               → AppointmentListComponent
/appointments/book/:docId   → BookingWizardComponent
/appointments/:id           → AppointmentDetailComponent
/notifications              → NotificationListComponent
/profile                    → ProfileComponent

[AuthGuard + RoleGuard: admin]
/admin/dashboard            → AdminDashboardComponent
/admin/schedules            → ScheduleManagerComponent
/admin/records              → PatientRecordsAdminComponent
/admin/reports              → ReportsComponent

**                          → NotFoundComponent
```

---

## 9. Security Architecture

```
Request Flow:
  Component Action
       │
       ▼
  Angular Router → AuthGuard (authenticated?) → RoleGuard (authorized?)
       │                │                              │
       │             Redirect /auth/login         Redirect /403
       ▼
  Feature Component
       │
       ▼
  Service → ApiService.get/post/put/delete
       │
       ▼
  HttpClient → AuthTokenInterceptor (inject Bearer token)
       │
       ▼
  Backend API → validates JWT → validates role → returns data
       │
       ▼
  ErrorHandlerInterceptor
    401 → AuthService.logout() + redirect
    403 → NotificationService.error('Access denied')
    5xx → NotificationService.error('Server error')

Token Storage:
  Access Token  → sessionStorage (expires with tab)
  Refresh Token → httpOnly cookie (backend sets, not accessible via JS)

XSS Prevention:
  - No innerHTML without DomSanitizer.bypassSecurityTrustHtml
  - Angular template binding is safe-by-default
  - No user-controlled content in attribute bindings

CSRF Prevention:
  - SameSite=Strict cookie policy for session cookies
  - Custom request header validation at API level
```

---

## 10. Styling Architecture

```
styles/
├── theme.css           ← SINGLE SOURCE OF TRUTH for design tokens
│   ├── Color Palette   (--color-primary, --color-secondary, --color-danger, ...)
│   ├── Typography      (--font-family, --font-size-*, --font-weight-*)
│   ├── Spacing         (--spacing-xs, --spacing-sm, --spacing-md, --spacing-lg, --spacing-xl)
│   ├── Border Radius   (--radius-sm, --radius-md, --radius-lg, --radius-full)
│   ├── Shadows         (--shadow-sm, --shadow-md, --shadow-lg, --shadow-card)
│   ├── Transitions     (--transition-fast, --transition-normal, --transition-slow)
│   └── Z-index         (--z-dropdown, --z-modal, --z-toast, --z-overlay)
│
├── variables.scss      ← SCSS bridge: maps CSS vars to SCSS vars for mixins
│   └── $primary: var(--color-primary) ...
│
├── global.scss         ← CSS reset, base typography, HTML/body defaults
│
├── animations.scss     ← @keyframes: fadeIn, slideUp, slideDown, scaleIn, pulse
│
└── mixins.scss         ← Reusable SCSS: respond-to (breakpoints), flex-center, truncate

Rules enforced:
  ✗ NO inline styles (style="") anywhere in templates
  ✗ NO hardcoded color/font values in component SCSS
  ✓ All colors via var(--color-*) from theme.css
  ✓ All typography via var(--font-*) from theme.css
  ✓ Component SCSS only contains layout + element-specific structure

Component SCSS structure:
  :host { display: block; }       ← Every component scopes to :host
  .component-name { ... }         ← BEM naming: component-name__element--modifier
  ← No global styles from component SCSS
```

---

## 11. Testing Architecture

```
Unit Tests (Jasmine + Karma)
  ├── Services: TestBed + HttpClientTestingModule
  │   └── Verify HTTP calls, error handling, data transforms
  ├── Pipes: pure function tests, no TestBed needed
  ├── Validators: pure function tests, input → ValidationErrors | null
  ├── Directives: TestBed with minimal host component
  └── Components: TestBed, shallow render, input/output verification

Integration Tests (Jasmine + Karma)
  └── BookingFlowIntegration: step 1 → step 2 → step 3 → store dispatched

E2E Tests (Cypress)
  ├── cy.intercept() mocks API for deterministic tests
  ├── Custom commands: cy.login(), cy.bookAppointment()
  └── Fixtures: test-user.json, test-doctor.json, test-slots.json

Coverage Targets:
  Services:   90%+
  Validators: 100%
  Pipes:      100%
  Components: 75%+
  E2E flows:  All critical user journeys covered
```

---

## 12. Deployment Architecture

```
Development:
  ng serve --open           ← Angular dev server (port 4200)
  json-server db.json       ← Mock API (port 3000)
  
Production Build:
  ng build --configuration production
  Output: dist/smart-hospital/
  Bundle budget: < 500KB initial, < 2MB total

Static Hosting (Production):
  Nginx / Vercel / AWS S3 + CloudFront
  Config: try_files $uri /index.html (SPA routing)

Environment Config:
  environment.ts        ← development (localhost API)
  environment.prod.ts   ← production (real API URL)
```

---

## 13. Decision Log

| Decision | Options Considered | Chosen | Rationale |
|----------|-------------------|--------|-----------|
| State Management | NgRx everywhere vs signals only vs hybrid | Hybrid (NgRx for appointment catalog only) | Project requirement; signals are lighter for simple state |
| Component architecture | NgModules vs Standalone | Standalone (Angular 21 default) | Modern Angular, better tree-shaking, simpler imports |
| Form strategy | All Reactive vs mixed | Mixed (Reactive + Template-Driven) | Project requirement; Template-Driven for simple preference forms |
| Icon library | Material Icons vs FontAwesome vs custom | Material Icons | Consistent with Angular Material, no extra dependency |
| CSS approach | CSS Modules vs BEM + SCSS | BEM + SCSS with global theme.css | Industry standard, centralized theming, no inline styles |
| Change detection | Default vs OnPush | OnPush everywhere | Performance critical for production-grade app |
| Mock backend | Mirage.js vs JSON Server vs MSW | JSON Server | Simple, no code, matches REST API pattern |
| Animation | CSS only vs Angular animations vs Lottie | All three (as appropriate) | Lottie for loading/empty states; Angular animations for route transitions; CSS for micro-interactions |
