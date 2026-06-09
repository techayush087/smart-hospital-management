# High Level Design (HLD)
# Smart Hospital Appointment and Patient Management System

**Version:** 1.0.0  
**Status:** Approved  
**Authors:** Senior Architecture Team  
**Last Updated:** 2026-06-09

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [System Overview](#2-system-overview)
3. [Goals and Non-Goals](#3-goals-and-non-goals)
4. [System Users and Roles](#4-system-users-and-roles)
5. [High-Level Architecture](#5-high-level-architecture)
6. [Module Breakdown](#6-module-breakdown)
7. [Data Flow Overview](#7-data-flow-overview)
8. [Integration Points](#8-integration-points)
9. [State Management Strategy](#9-state-management-strategy)
10. [Security Overview](#10-security-overview)
11. [Performance Strategy](#11-performance-strategy)
12. [Scalability Considerations](#12-scalability-considerations)
13. [Technology Stack](#13-technology-stack)
14. [Risk Assessment](#14-risk-assessment)

---

## 1. Executive Summary

The Smart Hospital Appointment and Patient Management System (SHAPMS) is a production-grade Angular 21 web application designed to digitize and streamline hospital operations. It serves two primary roles: **Patients (Customers)** who self-manage bookings, health records, and communications, and **Administrators** who govern doctor schedules, records, and reporting.

The system is architected for startup viability — built to scale, secure, and extend into a commercial healthcare SaaS product.

---

## 2. System Overview

SHAPMS is a Single Page Application (SPA) built on Angular 21 with a modular-standalone hybrid architecture. It communicates with a RESTful backend via HttpClient, manages domain-level state through NgRx (scoped to Appointment Catalog), and uses Angular Signals for localized reactive UI state.

```
┌─────────────────────────────────────────────────────────────┐
│                      Browser (SPA)                          │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │  Auth Shell │  │ Patient Zone │  │    Admin Zone     │  │
│  └─────────────┘  └──────────────┘  └───────────────────┘  │
│              Angular 21 Standalone + NgRx                   │
└───────────────────────┬─────────────────────────────────────┘
                        │ HTTPS / REST API
┌───────────────────────▼─────────────────────────────────────┐
│                     Backend API Layer                        │
│         (Node.js / Express  OR  Mock JSON Server)           │
└───────────────────────┬─────────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────────┐
│                    Data Persistence Layer                    │
│              PostgreSQL / MongoDB + Redis Cache              │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Goals and Non-Goals

### Goals

- Deliver a fully functional patient-facing appointment booking experience
- Deliver a fully functional admin control panel for hospital operations
- Demonstrate Angular 21 mastery: Signals, NgRx (single model), Forms, Pipes, Directives
- Production-grade code quality: tested, secure, accessible, performant
- Startup-ready codebase with extensibility for billing, telemedicine, and analytics

### Non-Goals

- Real-time video consultation (telemedicine integration is future scope)
- Payment gateway integration (placeholder only)
- Native mobile apps (web-responsive only in this phase)
- Multi-tenant hospital onboarding in Phase 1

---

## 4. System Users and Roles

| Role | Description | Access Level |
|------|-------------|--------------|
| **Guest** | Unauthenticated visitor | Landing page, login, registration only |
| **Customer (Patient)** | Registered patient user | Doctor search, booking, profile, history, prescriptions |
| **Admin** | Hospital administrator | All patient data, doctor schedules, reports, system config |

---

## 5. High-Level Architecture

### 5.1 Frontend Architecture

```
src/
├── app/
│   ├── core/                   ← Singleton services, guards, interceptors
│   ├── shared/                 ← Reusable components, directives, pipes, utils
│   ├── features/
│   │   ├── auth/               ← Login, Register, Profile
│   │   ├── patient/            ← Dashboard, Bookings, History, Prescriptions
│   │   ├── admin/              ← Dashboard, Schedules, Records, Reports
│   │   ├── doctors/            ← Listing, Search, Detail
│   │   └── notifications/      ← Notification center
│   └── store/                  ← NgRx: Appointment Catalog + Slot Availability
```

### 5.2 Angular Architecture Principles

- **Standalone Components** throughout (Angular 21 default)
- **Lazy-loaded routes** per feature module
- **Route Guards** (`AuthGuard`, `RoleGuard`) protecting feature zones
- **HTTP Interceptors** for token injection and error normalization
- **NgRx** scoped exclusively to Appointment Catalog / Slot Availability
- **Angular Signals** for component-local reactive state
- **OnPush Change Detection** applied universally for performance

---

## 6. Module Breakdown

### 6.1 Auth Module
- Registration with Reactive Forms (custom validators: age, required medical fields)
- Login with JWT session management
- Logout with session cleanup
- Profile management with Template-Driven Forms for preferences

### 6.2 Doctor Module
- Doctor listing with specialization, experience, ratings, consultation mode
- Search and filter: specialization, location, availability, consultation type
- Doctor detail view with slot browser

### 6.3 Appointment Module *(NgRx Model)*
- Slot availability browsing (NgRx Entity store)
- Appointment booking workflow (multi-step form with dynamic field generation from config metadata)
- Reschedule and cancel flows
- Appointment status tracking
- Custom validators: future date enforcement, overlap detection

### 6.4 Patient Records Module
- Visit history timeline with custom pipes for date/duration formatting
- Prescription display
- Medical notes and consultation summaries
- Medical history with formatted display using pipes

### 6.5 Admin Module
- Doctor schedule management (CRUD)
- Patient master record reference
- Consultation status updates
- Appointment slot management
- Operational reports and dashboard

### 6.6 Notification Module
- Confirmation alerts on booking
- Reminders for upcoming appointments
- Reschedule and cancellation alerts
- Admin alerts for schedule conflicts

---

## 7. Data Flow Overview

```
User Action
    │
    ▼
Angular Component (Signal / Local State)
    │
    ▼
Feature Service (Business Logic)
    │
    ├──[Appointment Module]──► NgRx Store (Actions → Reducers → Selectors)
    │                                           │
    │                                    NgRx Effects ──► HTTP API
    │
    └──[All other modules]──► Service → HttpClient → REST API
                                                          │
                                                     Backend DB
```

---

## 8. Integration Points

| Integration | Protocol | Direction |
|-------------|----------|-----------|
| REST API (Backend) | HTTPS/JSON | Bidirectional |
| JWT Auth Token | HTTP Header (Bearer) | Outbound per request |
| Notification Service | WebSocket / Polling | Inbound (real-time alerts) |
| Mock JSON Server | HTTP | Dev/Test only |

---

## 9. State Management Strategy

| Feature Area | State Approach | Rationale |
|---|---|---|
| Appointment Catalog + Slot Availability | **NgRx** (actions, reducers, selectors, effects, entities) | Complex shared state, multiple components subscribe to same data |
| Auth session | **Core AuthService + Signal** | Simple boolean/user object, lightweight |
| Doctor search filters | **Component Signal** | UI-local, ephemeral |
| Notification list | **NotificationService + BehaviorSubject** | Shared but simple |
| Form state | **Reactive Forms / Template-Driven Forms** | Angular built-in |
| UI toggles / loading flags | **Angular Signals** | Fine-grained, no overhead |

---

## 10. Security Overview

- JWT-based authentication (access + refresh token pattern)
- Route guards: `AuthGuard` (authenticated), `RoleGuard` (role enforcement)
- HTTP Interceptor for automatic token attachment
- HTTPS enforced in production
- Input sanitization via Angular's built-in DOMSanitizer
- Reactive Form validators reject invalid/malicious input client-side
- Server-side validation as final gate (backend responsibility)
- No sensitive data stored in localStorage (sessionStorage with expiry only)
- Role-based API access control enforced at backend

---

## 11. Performance Strategy

- Lazy-loaded feature modules (initial bundle < 200KB)
- `OnPush` change detection on all components
- `TrackBy` in all `ngFor` loops
- Angular Signals eliminate unnecessary zone-based change detection
- HTTP response caching via interceptor for doctor listing
- Image optimization and lazy loading for doctor profile photos
- Preloading strategy: `PreloadAllModules` (configurable to `QuicklinkPreloadingStrategy`)

---

## 12. Scalability Considerations

- Feature-based folder structure allows independent team ownership
- NgRx feature states are isolated and composable
- Shared utilities and helpers eliminate code duplication
- Backend API abstraction layer (ApiService) allows backend swap without UI changes
- Environment-based configuration (`environment.ts`) for dev/staging/prod

---

## 13. Technology Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Frontend Framework | Angular | 21.x |
| Language | TypeScript | 5.x |
| State Management | NgRx | 19.x |
| UI Component Library | Angular Material | 19.x |
| Icons | Material Icons (Google Fonts) | Latest |
| Styling | SCSS + theme.css (centralized) | — |
| Animation | Lottie Web + Angular Animations | Latest |
| Testing | Jasmine + Karma + Cypress (E2E) | Latest |
| HTTP | Angular HttpClient + RxJS | Built-in |
| Build Tool | Angular CLI + Vite (Angular 21 default) | 21.x |
| Mock API | JSON Server | 0.17.x |

---

## 14. Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| NgRx complexity slowing development | Medium | Medium | Scope NgRx to one model only |
| Bundle size exceeding performance budget | Low | High | Lazy loading + tree shaking |
| Form validation edge cases | Medium | Medium | Comprehensive unit test suite |
| UI consistency degradation | Medium | High | Centralized theme.css + design tokens |
| Security: token leakage | Low | Critical | SessionStorage + interceptor + short expiry |
