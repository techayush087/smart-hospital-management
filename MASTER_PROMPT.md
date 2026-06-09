# MASTER PROMPT
# Smart Hospital Appointment and Patient Management System
# Instructions for Claude Code (Senior Architect Engineer Agent)

**Version:** 1.0.0  
**Project:** Smart Hospital Appointment and Patient Management System (SHAPMS)  
**Tech Stack:** Angular 21, NgRx 19, TypeScript 5, Angular Material 19, SCSS, Lottie Web, Jasmine/Karma, Cypress

---

## YOUR ROLE

You are a **Senior Architect Engineer** with 20 years of experience. You are building a production-grade Angular 21 healthcare SPA that will be evaluated by:

1. **Another Senior Architect Engineer** — will review every file for correctness, reliability, and optimization. He will flag anything substandard for rework.
2. **Senior QA Engineer** — will verify all features work as specified and all tests pass.
3. **Senior Security Engineer** — will audit for vulnerabilities, data leakage, and access control.
4. **Senior UI/UX Designer** — will reject any UI that looks AI-generated or inconsistent. Will verify no inline styles exist, all theming flows through theme.css, all icons are Material Icons.

**You must build everything in one session.** Each commit counts as one "day" in the timeline. Complete all 5 days' work in sequential commits.

---

## ABSOLUTE RULES — NEVER VIOLATE THESE

```
1.  NO inline styles — style="" is forbidden in every .html template. Zero exceptions.
2.  NO hardcoded color, font, or spacing values in .scss files.
3.  ALL visual tokens must reference var(--*) CSS variables from src/styles/theme.css.
4.  NO duplicate functions — if a utility already exists in utils/ or helpers/, USE IT.
5.  NO emoji used as icons anywhere — use Material Icons (mat-icon) exclusively.
6.  ALL components must have ChangeDetectionStrategy.OnPush.
7.  ALL ngFor must have trackBy.
8.  NgRx is ONLY for Appointment Catalog + Slot Availability — not auth, not doctors, not patient records.
9.  All colors and theme changes go through theme.css ONLY.
10. NO component SCSS may set a color/size/spacing without referencing a CSS variable.
11. The UI must look hand-crafted by professional designers — not like any AI template.
12. Every public service method must have a corresponding unit test.
13. Every custom validator must have a unit test covering valid and invalid cases.
14. Every pipe must have a unit test.
15. E2E tests must cover: login, register, book appointment, reschedule, cancel, admin schedule update.
```

---

## PROJECT SETUP (COMMIT 1 — Day 1)

### Step 1: Generate the Angular 21 Project

```bash
ng new smart-hospital \
  --routing=true \
  --style=scss \
  --standalone=true \
  --strict=true \
  --ssr=false

cd smart-hospital

# Install dependencies
npm install @ngrx/store @ngrx/effects @ngrx/entity @ngrx/store-devtools
npm install @angular/material @angular/cdk
npm install ngx-lottie lottie-web
npm install json-server --save-dev
npm install cypress --save-dev
npm install @ngrx/schematics --save-dev
```

### Step 2: Create theme.css

Create `src/styles/theme.css` with ALL tokens exactly as specified in DESIGN.md Section 2.

Create `src/styles/variables.scss`, `src/styles/global.scss`, `src/styles/animations.scss`, `src/styles/mixins.scss`.

Update `angular.json` styles array:
```json
"styles": [
  "src/styles/theme.css",
  "src/styles/global.scss",
  "src/styles/animations.scss",
  "src/styles/variables.scss",
  "src/styles/mixins.scss",
  "src/styles.scss"
]
```

### Step 3: Scaffold the full directory structure

Create every directory as defined in LLD.md Section 1. Create `.gitkeep` in empty directories.

### Step 4: Create all data models/interfaces

Create all interfaces defined in LLD.md Section 11 in `src/app/core/models/`:
- `user.model.ts`
- `doctor.model.ts`
- `appointment.model.ts`
- `time-slot.model.ts`
- `prescription.model.ts`
- `notification.model.ts`
- `form-field-config.model.ts`
- `index.ts` (barrel export)

### Step 5: Create all utilities and helpers

Implement ALL functions defined in LLD.md Section 16 in their respective files:

**utils/date.utils.ts** — toISODate, isToday, addDays, formatDisplayDate, getDateRange, isDateInPast, minutesToDurationString

**utils/form.utils.ts** — markAllAsTouched, getFormErrors, patchFormSafely, buildFormGroupFromConfig

**utils/string.utils.ts** — capitalize, slugify, truncate, initials

**utils/array.utils.ts** — groupBy, uniqueBy, sortByDate

**utils/http.utils.ts** — buildQueryParams, handleApiError

**helpers/appointment.helpers.ts** — isSlotAvailable, getNextAvailableDate, groupSlotsByDate, appointmentConflicts

**helpers/doctor.helpers.ts** — filterDoctors, sortDoctorsByRating, getDoctorDisplayName

**helpers/form-config.helpers.ts** — buildAppointmentFormFromConfig, getValidatorsForField

### Step 6: Create Core services

Implement `core/services/`:
- `api.service.ts` — base HTTP wrapper with get/post/put/patch/delete
- `auth.service.ts` — login/logout/register/getCurrentUser Signal/hasRole
- `session.service.ts` — sessionStorage token management (no localStorage)
- `notification.service.ts` — Signal-based notification store

Implement `core/interceptors/`:
- `auth-token.interceptor.ts` — inject Bearer token from SessionService
- `error-handler.interceptor.ts` — normalize 401/403/5xx errors

Implement `core/guards/`:
- `auth.guard.ts` — redirect to /auth/login if not authenticated
- `role.guard.ts` — check route data.roles against current user role

### Step 7: Create all custom validators

Implement in `shared/validators/`:
- `age-restriction.validator.ts` — ValidatorFn factory, takes min/max
- `future-date.validator.ts` — rejects past dates
- `appointment-overlap.validator.ts` — checks against existing slots array
- `medical-detail-required.validator.ts` — required fields based on config

### Step 8: Create all custom pipes

Implement in `shared/pipes/`:
- `time-slot.pipe.ts` — ISO datetime → "10:30 AM – 11:00 AM"
- `age.pipe.ts` — dateOfBirth → "34 years old"
- `appointment-status.pipe.ts` — 'confirmed' → 'Confirmed'
- `relative-date.pipe.ts` — date → 'Today', 'Yesterday', or formatted date
- `truncate.pipe.ts` — string | truncate:50 → truncated string

### Step 9: Create all custom directives

Implement in `shared/directives/`:
- `autofocus.directive.ts`
- `role-access.directive.ts` (structural — *appRoleAccess)
- `highlight.directive.ts`
- `tooltip.directive.ts`

### Step 10: Create all shared components

Implement in `shared/components/` (full implementations, not stubs):
- `app-button/` — with variants: primary, secondary, danger, ghost; sizes: sm, md, lg; loading state
- `app-card/` — elevated and flat variants
- `app-modal/` — portal overlay, ESC to close, trap focus
- `app-loader/` — Lottie animation overlay with message
- `app-badge/` — status badge with color variants
- `app-avatar/` — image with fallback initials
- `search-bar/` — debounced search with clear button
- `empty-state/` — Lottie + title + description + optional action button
- `page-header/` — title + breadcrumbs + back button
- `notification-toast/` — bottom-right stack, auto-dismiss, progress bar

### Step 11: Create app.config.ts, app.routes.ts, app.component.ts

```typescript
// app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideHttpClient(withInterceptors([authTokenInterceptor, errorHandlerInterceptor])),
    provideAnimations(),
    provideStore(),
    provideEffects(),
    provideStoreDevtools({ maxAge: 25, logOnly: !isDevMode() }),
    provideLottieOptions({ player: () => import('lottie-web') })
  ]
};
```

### Step 12: Create auth routes and screens with bottom App Shell

Create full auth screens:
- `LoginComponent` — split layout, Reactive Form, Material Icons
- `RegisterComponent` — multi-section Reactive Form, all custom validators applied
- `ProfileComponent` — Reactive Form + Template-Driven preferences section

### Step 13: Create db.json for JSON Server

```json
{
  "users": [
    { "id": "u1", "firstName": "John", "lastName": "Doe", "email": "patient@test.com",
      "password": "hashed_password", "role": "customer", "dateOfBirth": "1990-05-15",
      "phone": "+1234567890", "bloodGroup": "O+", "allergies": ["Penicillin"] },
    { "id": "u2", "firstName": "Admin", "lastName": "User", "email": "admin@test.com",
      "password": "hashed_password", "role": "admin", "dateOfBirth": "1985-03-20",
      "phone": "+0987654321" }
  ],
  "doctors": [
    { "id": "d1", "name": "Dr. Sarah Chen", "specialization": "Cardiology",
      "experience": 12, "consultationType": "both", "location": "City Hospital, Manhattan",
      "rating": 4.9, "reviewCount": 247, "consultationFee": 150,
      "bio": "Specialist in interventional cardiology with extensive ICU experience.",
      "languages": ["English", "Mandarin"] },
    { "id": "d2", "name": "Dr. Roy Patel", "specialization": "General Medicine",
      "experience": 8, "consultationType": "both", "location": "Metro Clinic, Brooklyn",
      "rating": 4.7, "reviewCount": 183, "consultationFee": 100,
      "bio": "Compassionate general practitioner focused on preventive care.",
      "languages": ["English", "Hindi"] }
  ],
  "slots": [],
  "appointments": [],
  "prescriptions": [],
  "notifications": [],
  "schedules": []
}
```

Add to `package.json` scripts:
```json
"mock-api": "json-server --watch db.json --port 3000 --routes routes.json"
```

---

## COMMIT 2 — Day 2: Appointment Booking + Doctor Search

### Doctor Feature

Implement complete `features/doctors/`:

**DoctorService:**
```typescript
getDoctors(filters?: DoctorFilter): Observable<Doctor[]>
getDoctorById(id: string): Observable<Doctor>
getAvailableSlots(doctorId: string, date: string): Observable<TimeSlot[]>
searchDoctors(query: string): Observable<Doctor[]>
```
Use `filterDoctors()` from `doctor.helpers.ts` for client-side filter application.

**DoctorListComponent:** OnPush, filter sidebar, debounced search bar, skeleton loading, EmptyState when 0 results with Lottie animation.

**DoctorCardComponent:** Horizontal card layout (see DESIGN.md 6.2). Avatar, name, specialization, experience, location, next available, consultation type badges, Book button.

**DoctorDetailComponent:** Full profile, rating, available slot grid for date browsing. Dispatches `loadDoctorSlots` NgRx action on date selection.

**DoctorFilterComponent:** All filter controls as Signals. Emits filter changes via Output.

### NgRx Store: Appointment Catalog

Implement COMPLETE NgRx feature:

**store/appointment-catalog/actions/appointment-catalog.actions.ts**
All actions as defined in LLD.md Section 10.

**store/appointment-catalog/reducers/appointment-catalog.reducer.ts**
EntityAdapter-based reducer. Handle all success/failure/loading states.

**store/appointment-catalog/selectors/appointment-catalog.selectors.ts**
All selectors: selectAvailableSlots, selectSelectedSlot, selectUpcomingAppointments, selectBookingInProgress, selectSlotsLoading.

**store/appointment-catalog/effects/appointment-catalog.effects.ts**
loadDoctorSlots$, bookSlot$, cancelAppointment$, rescheduleAppointment$ effects.
Use switchMap for loads, exhaustMap for bookSlot (prevent double-submit), mergeMap for cancel.
Effects call NotificationService on success for user feedback.

### Appointment Feature

**AppointmentService:**
```typescript
getAppointments(patientId: string): Observable<Appointment[]>
bookAppointment(booking: BookingRequest): Observable<Appointment>
cancelAppointment(id: string): Observable<void>
rescheduleAppointment(id: string, newSlot: TimeSlot): Observable<Appointment>
getAppointmentById(id: string): Observable<Appointment>
```

**BookingWizardComponent:** 3-step wizard.
- Signal: `currentStep = signal<1|2|3>(1)`
- Step 1: `StepSelectSlotComponent` — date picker, slot grid from NgRx selectAvailableSlots
- Step 2: `StepPatientDetailsComponent` — dynamic form built from `APPOINTMENT_FORM_CONFIG` using `buildAppointmentFormFromConfig()` from helpers
- Step 3: `StepConfirmationComponent` — summary, dispatch bookSlot on confirm

**AppointmentListComponent:** Separates upcoming vs past appointments. AppointmentStatusPipe for badges. RelativeDatePipe for dates.

**RescheduleModalComponent:** AppModal wrapper, date + slot selection, dispatches rescheduleAppointment action.

---

## COMMIT 3 — Day 3: Patient Records + Notifications + Dynamic Forms

### Patient Records Feature

**PatientRecordsService:**
```typescript
getVisitHistory(patientId: string): Observable<VisitRecord[]>
getPrescriptions(patientId: string): Observable<Prescription[]>
getMedicalNotes(visitId: string): Observable<MedicalNote[]>
getMedicalTimeline(patientId: string): Observable<TimelineEvent[]>
```

**PatientDashboardComponent:** Stat cards, upcoming appointments (compact list), quick action buttons.

**VisitHistoryComponent:** Tabular list of visits. AppointmentStatusPipe. RelativeDatePipe. Pagination.

**PrescriptionViewComponent:** Cards per prescription. Medication list with dosage/frequency. Print-friendly layout.

**MedicalTimelineComponent:** Left-border vertical timeline (see DESIGN.md 6.5). TrackBy visitId. OnPush. Uses RelativeDatePipe + AppointmentStatusPipe.

### Notification Feature

**NotificationListComponent:** Full notification list, mark-all-as-read button, empty state with Lottie.

**NotificationItemComponent:** Icon by type, relative date, read/unread visual distinction, click to mark read.

**NotificationToastComponent:** Global toast outlet — bottom-right stack, auto-dismiss 4s, progress bar animation, manual close with Material close icon.

### Dynamic Form Enhancement

In `StepPatientDetailsComponent`, implement full dynamic form rendering:
```html
<!-- Render each FormFieldConfig as appropriate input type -->
<ng-container *ngFor="let field of formConfig; trackBy: trackByKey">
  <ng-container [ngSwitch]="field.type">
    <app-form-field-text *ngSwitchCase="'text'" ... />
    <app-form-field-select *ngSwitchCase="'select'" ... />
    <app-form-field-textarea *ngSwitchCase="'textarea'" ... />
    <app-form-field-date *ngSwitchCase="'date'" ... />
  </ng-container>
</ng-container>
```

All validation errors surface via `getFormErrors()` from `form.utils.ts`.

---

## COMMIT 4 — Day 4: Admin Module + Signals + Test Setup

### Admin Feature

**AdminService:**
```typescript
getDoctorSchedules(): Observable<DoctorSchedule[]>
updateDoctorSchedule(id: string, s: DoctorSchedule): Observable<DoctorSchedule>
createSlot(slot: AppointmentSlot): Observable<AppointmentSlot>
deleteSlot(slotId: string): Observable<void>
getPatientRecords(filters?: PatientFilter): Observable<PatientRecord[]>
updateConsultationStatus(id: string, status: ConsultationStatus): Observable<void>
getDashboardStats(): Observable<DashboardStats>
getAppointmentReport(range: DateRange): Observable<ReportData>
```

**AdminDashboardComponent:** KPI stat cards, appointment trend chart (use Angular Material or a simple SVG chart), specialty distribution, recent activity table.

**ScheduleManagerComponent:** Date-based calendar view of doctor slots. Add/edit/delete slot actions. Confirmation modal before delete.

**PatientRecordsAdminComponent:** Searchable, filterable patient table. Update consultation status with dropdown. Pagination.

**ReportsComponent:** Date range picker, appointment count by status chart, export placeholder.

### Signal Usage Audit

Review all components. Ensure these use Signals (not BehaviorSubject):
- `AuthService.currentUser` — signal
- `NotificationService.notifications` — signal
- `BookingWizardComponent.currentStep` — signal
- `DoctorFilterComponent.activeFilters` — signal
- Loading flags in components that don't use NgRx — signal

### Unit Tests

Write unit tests for EVERY:

**Validators:**
```typescript
// age-restriction.validator.spec.ts
describe('ageRestrictionValidator', () => {
  it('should return null for valid age')
  it('should return error for age below minimum')
  it('should return error for age above maximum')
  it('should return error for invalid date')
})
```

**Pipes:**
```typescript
// time-slot.pipe.spec.ts
// age.pipe.spec.ts
// appointment-status.pipe.spec.ts
// relative-date.pipe.spec.ts
// truncate.pipe.spec.ts
```

**Utils:**
```typescript
// date.utils.spec.ts — test every exported function
// form.utils.spec.ts — test markAllAsTouched, getFormErrors
// array.utils.spec.ts — test groupBy, uniqueBy, sortByDate
```

**Services:**
```typescript
// auth.service.spec.ts — HttpClientTestingModule, test login/logout/register
// notification.service.spec.ts — test add/markAsRead/markAllAsRead/clear
// doctor.service.spec.ts — test getDoctors, getAvailableSlots
// appointment.service.spec.ts — test bookAppointment, cancelAppointment
```

**NgRx:**
```typescript
// appointment-catalog.reducer.spec.ts — test all state transitions
// appointment-catalog.selectors.spec.ts — test selectors with mock state
```

---

## COMMIT 5 — Day 5: E2E Tests + Bug Fixes + Final Verification

### E2E Tests (Cypress)

Create `cypress/e2e/` with these test files:

**auth/login.cy.ts:**
```typescript
describe('Login', () => {
  it('should log in as patient')
  it('should log in as admin')
  it('should show error for invalid credentials')
  it('should redirect to patient dashboard after login')
})
```

**auth/register.cy.ts:**
```typescript
describe('Register', () => {
  it('should register a new patient account')
  it('should show age validation error')
  it('should show password mismatch error')
  it('should redirect to login after registration')
})
```

**appointment/book-appointment.cy.ts:**
```typescript
describe('Book Appointment', () => {
  beforeEach(() => cy.login('patient@test.com', 'password'))
  it('should browse doctors and open booking wizard')
  it('should select a slot')
  it('should complete patient details dynamic form')
  it('should confirm and book appointment')
  it('should show booking confirmation')
})
```

**appointment/reschedule.cy.ts + cancel.cy.ts**

**admin/schedule-update.cy.ts:**
```typescript
describe('Admin Schedule', () => {
  beforeEach(() => cy.login('admin@test.com', 'password'))
  it('should view doctor schedules')
  it('should add a new slot')
  it('should update consultation status')
})
```

Create `cypress/support/commands.ts`:
```typescript
Cypress.Commands.add('login', (email, password) => {
  cy.visit('/auth/login')
  cy.get('[data-cy="email"]').type(email)
  cy.get('[data-cy="password"]').type(password)
  cy.get('[data-cy="submit"]').click()
  cy.url().should('not.include', '/auth/login')
})
```

Add `data-cy` attributes to all interactive elements in templates:
```html
<input data-cy="email" ... />
<button data-cy="submit" ... />
```

### Final Verification Checklist

Before marking complete, verify:

**Code Quality:**
- [ ] Zero inline `style=""` attributes in any .html file (run: `grep -r 'style="' src/app`)
- [ ] Zero hardcoded hex colors in .scss files (run: `grep -rn '#[0-9A-Fa-f]\{3,6\}' src/app --include="*.scss"`)
- [ ] All components have `changeDetection: ChangeDetectionStrategy.OnPush`
- [ ] All ngFor have `trackBy`
- [ ] No duplicate utility functions (each function exists in exactly one file)

**Features:**
- [ ] Registration with Reactive Forms and all custom validators works
- [ ] Login/logout works, session clears on logout
- [ ] Doctor listing with search and filter works
- [ ] Booking wizard 3-step flow works end-to-end
- [ ] NgRx store for appointments: load, book, cancel, reschedule
- [ ] Profile with Template-Driven preferences section works
- [ ] Visit history + prescriptions + medical timeline render correctly
- [ ] Admin dashboard with stats renders
- [ ] Schedule management CRUD works
- [ ] Notifications appear on booking/cancel/reschedule
- [ ] Role-based routing: customers cannot access /admin, admins see full system

**UI/UX:**
- [ ] No element looks AI-generated or template-based
- [ ] Lottie animations appear for loading and empty states
- [ ] Route transitions animate smoothly
- [ ] Toast notifications stack correctly
- [ ] Responsive: sidebar collapses on mobile

**Tests:**
- [ ] All unit tests pass (`ng test --watch=false`)
- [ ] E2E tests pass against mock API (`npx cypress run`)

**Security:**
- [ ] Token stored in sessionStorage only (not localStorage)
- [ ] AuthGuard blocks unauthenticated routes
- [ ] RoleGuard blocks wrong-role routes
- [ ] No sensitive data in console.log statements

---

## QUALITY BAR

The reviewing Senior Architect Engineer will reject and require rework if:

1. Any feature is stubbed/not implemented (placeholder TODO left)
2. Any test is empty or only has `expect(true).toBe(true)`
3. Any inline style found in templates
4. NgRx used for anything other than appointment catalog
5. Any signal that should be used is instead a BehaviorSubject
6. Any pipe/util function duplicated in a component
7. Component SCSS contains hardcoded color values
8. Missing OnPush on any component
9. Missing trackBy on any ngFor
10. UI looks like it came from a template generator

The Senior UI/UX Designer will reject if:

1. Any section looks like a default Angular Material template without customization
2. Any emoji used as an icon
3. Spacing/typography is inconsistent across pages
4. No Lottie animations on loading/empty states
5. Color does not match theme.css exactly
6. Mobile layout is broken or not implemented

---

## ENVIRONMENT SETUP

```bash
# Run the full application
npm start                     # ng serve (port 4200)
npm run mock-api              # json-server (port 3000) — run in separate terminal

# Testing
ng test --watch=false         # Unit tests
npx cypress open              # E2E tests (interactive)
npx cypress run               # E2E tests (headless)

# Build
ng build --configuration production
```

---

## FILE NAMING CONVENTIONS

| Type | Convention | Example |
|------|-----------|---------|
| Component | `kebab-case.component.ts` | `doctor-card.component.ts` |
| Service | `kebab-case.service.ts` | `appointment.service.ts` |
| Guard | `kebab-case.guard.ts` | `auth.guard.ts` |
| Interceptor | `kebab-case.interceptor.ts` | `auth-token.interceptor.ts` |
| Pipe | `kebab-case.pipe.ts` | `time-slot.pipe.ts` |
| Directive | `kebab-case.directive.ts` | `role-access.directive.ts` |
| Model/Interface | `kebab-case.model.ts` | `appointment.model.ts` |
| Utils | `kebab-case.utils.ts` | `date.utils.ts` |
| Helpers | `kebab-case.helpers.ts` | `appointment.helpers.ts` |
| Test | `[same-name].spec.ts` | `doctor-card.component.spec.ts` |
| NgRx Actions | `feature-name.actions.ts` | `appointment-catalog.actions.ts` |
| NgRx Reducer | `feature-name.reducer.ts` | `appointment-catalog.reducer.ts` |
| NgRx Selectors | `feature-name.selectors.ts` | `appointment-catalog.selectors.ts` |
| NgRx Effects | `feature-name.effects.ts` | `appointment-catalog.effects.ts` |
| Routes | `feature-name.routes.ts` | `appointment.routes.ts` |
| SCSS per component | `component-name.component.scss` | `doctor-card.component.scss` |

**Class Names:**
- Components: `DoctorCardComponent`
- Services: `AppointmentService`
- Guards: functions `authGuard`, `roleGuard`
- Interceptors: functions `authTokenInterceptor`
- NgRx Actions: camelCase `loadDoctorSlots`, `bookSlot`
- Interfaces: PascalCase `Doctor`, `Appointment`, `TimeSlot`

---

## COMMIT STRATEGY

| Commit | Description |
|--------|-------------|
| `feat: project setup, theme, models, utils, core services` | Day 1 |
| `feat: doctor listing, search, filter, appointment booking, NgRx store` | Day 2 |
| `feat: patient records, notifications, dynamic forms, validators` | Day 3 |
| `feat: admin module, signals audit, unit tests` | Day 4 |
| `feat: e2e tests, final bug fixes, accessibility review` | Day 5 |

---

## FINAL NOTE

This system will be deployed as a commercial healthcare product. Every decision should reflect that gravity:
- Security is not optional
- Accessibility is not optional
- Test coverage is not optional
- Clean, maintainable code is not optional

Build it as if real patients' health data depends on its correctness. Because when this ships as a business, it will.
