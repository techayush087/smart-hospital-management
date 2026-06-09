# Low Level Design (LLD)
# Smart Hospital Appointment and Patient Management System

**Version:** 1.0.0  
**Status:** Approved  
**Authors:** Senior Architecture Team  
**Last Updated:** 2026-06-09

---

## Table of Contents

1. [Project Structure](#1-project-structure)
2. [Core Module Design](#2-core-module-design)
3. [Shared Module Design](#3-shared-module-design)
4. [Feature Module: Auth](#4-feature-module-auth)
5. [Feature Module: Doctors](#5-feature-module-doctors)
6. [Feature Module: Appointment (NgRx)](#6-feature-module-appointment-ngrx)
7. [Feature Module: Patient Records](#7-feature-module-patient-records)
8. [Feature Module: Admin](#8-feature-module-admin)
9. [Feature Module: Notifications](#9-feature-module-notifications)
10. [NgRx Store Design](#10-ngrx-store-design)
11. [Data Models / Interfaces](#11-data-models--interfaces)
12. [Routing Design](#12-routing-design)
13. [Forms Design](#13-forms-design)
14. [Custom Directives](#14-custom-directives)
15. [Custom Pipes](#15-custom-pipes)
16. [Helpers and Utils Design](#16-helpers-and-utils-design)
17. [HTTP Layer Design](#17-http-layer-design)
18. [Testing Strategy](#18-testing-strategy)

---

## 1. Project Structure

```
smart-hospital/
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── guards/
│   │   │   │   ├── auth.guard.ts
│   │   │   │   └── role.guard.ts
│   │   │   ├── interceptors/
│   │   │   │   ├── auth-token.interceptor.ts
│   │   │   │   └── error-handler.interceptor.ts
│   │   │   ├── services/
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── api.service.ts
│   │   │   │   ├── notification.service.ts
│   │   │   │   └── session.service.ts
│   │   │   └── core.providers.ts
│   │   │
│   │   ├── shared/
│   │   │   ├── components/
│   │   │   │   ├── button/
│   │   │   │   ├── card/
│   │   │   │   ├── modal/
│   │   │   │   ├── loader/
│   │   │   │   ├── badge/
│   │   │   │   ├── avatar/
│   │   │   │   ├── search-bar/
│   │   │   │   ├── empty-state/
│   │   │   │   ├── page-header/
│   │   │   │   └── notification-toast/
│   │   │   ├── directives/
│   │   │   │   ├── autofocus.directive.ts
│   │   │   │   ├── role-access.directive.ts
│   │   │   │   ├── highlight.directive.ts
│   │   │   │   └── tooltip.directive.ts
│   │   │   ├── pipes/
│   │   │   │   ├── time-slot.pipe.ts
│   │   │   │   ├── age.pipe.ts
│   │   │   │   ├── appointment-status.pipe.ts
│   │   │   │   ├── relative-date.pipe.ts
│   │   │   │   └── truncate.pipe.ts
│   │   │   ├── validators/
│   │   │   │   ├── age-restriction.validator.ts
│   │   │   │   ├── future-date.validator.ts
│   │   │   │   ├── appointment-overlap.validator.ts
│   │   │   │   └── medical-detail-required.validator.ts
│   │   │   ├── utils/
│   │   │   │   ├── date.utils.ts
│   │   │   │   ├── string.utils.ts
│   │   │   │   ├── form.utils.ts
│   │   │   │   ├── array.utils.ts
│   │   │   │   └── http.utils.ts
│   │   │   └── helpers/
│   │   │       ├── appointment.helpers.ts
│   │   │       ├── doctor.helpers.ts
│   │   │       ├── notification.helpers.ts
│   │   │       └── form-config.helpers.ts
│   │   │
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   │   ├── components/
│   │   │   │   │   ├── login/
│   │   │   │   │   ├── register/
│   │   │   │   │   └── profile/
│   │   │   │   ├── services/
│   │   │   │   │   └── auth-form.service.ts
│   │   │   │   └── auth.routes.ts
│   │   │   │
│   │   │   ├── doctors/
│   │   │   │   ├── components/
│   │   │   │   │   ├── doctor-list/
│   │   │   │   │   ├── doctor-card/
│   │   │   │   │   ├── doctor-detail/
│   │   │   │   │   └── doctor-filter/
│   │   │   │   ├── services/
│   │   │   │   │   └── doctor.service.ts
│   │   │   │   └── doctors.routes.ts
│   │   │   │
│   │   │   ├── appointment/
│   │   │   │   ├── components/
│   │   │   │   │   ├── appointment-list/
│   │   │   │   │   ├── booking-wizard/
│   │   │   │   │   │   ├── step-select-slot/
│   │   │   │   │   │   ├── step-patient-details/
│   │   │   │   │   │   └── step-confirmation/
│   │   │   │   │   ├── appointment-detail/
│   │   │   │   │   └── reschedule-modal/
│   │   │   │   ├── services/
│   │   │   │   │   └── appointment.service.ts
│   │   │   │   └── appointment.routes.ts
│   │   │   │
│   │   │   ├── patient/
│   │   │   │   ├── components/
│   │   │   │   │   ├── patient-dashboard/
│   │   │   │   │   ├── visit-history/
│   │   │   │   │   ├── prescription-view/
│   │   │   │   │   └── medical-timeline/
│   │   │   │   ├── services/
│   │   │   │   │   └── patient-records.service.ts
│   │   │   │   └── patient.routes.ts
│   │   │   │
│   │   │   ├── admin/
│   │   │   │   ├── components/
│   │   │   │   │   ├── admin-dashboard/
│   │   │   │   │   ├── schedule-manager/
│   │   │   │   │   ├── patient-records-admin/
│   │   │   │   │   └── reports/
│   │   │   │   ├── services/
│   │   │   │   │   └── admin.service.ts
│   │   │   │   └── admin.routes.ts
│   │   │   │
│   │   │   └── notifications/
│   │   │       ├── components/
│   │   │       │   ├── notification-list/
│   │   │       │   └── notification-item/
│   │   │       └── notifications.routes.ts
│   │   │
│   │   ├── store/
│   │   │   └── appointment-catalog/
│   │   │       ├── actions/
│   │   │       │   └── appointment-catalog.actions.ts
│   │   │       ├── reducers/
│   │   │       │   └── appointment-catalog.reducer.ts
│   │   │       ├── selectors/
│   │   │       │   └── appointment-catalog.selectors.ts
│   │   │       ├── effects/
│   │   │       │   └── appointment-catalog.effects.ts
│   │   │       └── index.ts
│   │   │
│   │   ├── app.component.ts
│   │   ├── app.config.ts
│   │   └── app.routes.ts
│   │
│   ├── assets/
│   │   ├── animations/         ← Lottie JSON files
│   │   ├── icons/              ← SVG icons (supplemental)
│   │   └── images/
│   │
│   └── styles/
│       ├── theme.css           ← ALL colors, typography, spacing tokens
│       ├── variables.scss      ← SCSS variables referencing theme tokens
│       ├── global.scss         ← Reset + base typography
│       ├── animations.scss     ← Reusable animation keyframes
│       └── mixins.scss         ← Reusable SCSS mixins
│
├── db.json                     ← JSON Server mock data
├── angular.json
├── tsconfig.json
└── package.json
```

---

## 2. Core Module Design

### 2.1 AuthService

```typescript
// core/services/auth.service.ts
export class AuthService {
  private currentUser = signal<User | null>(null);
  private isAuthenticated = computed(() => !!this.currentUser());

  login(credentials: LoginDto): Observable<AuthResponse>
  logout(): void
  register(data: RegisterDto): Observable<AuthResponse>
  refreshToken(): Observable<AuthResponse>
  hasRole(role: UserRole): boolean
  getCurrentUser(): Signal<User | null>
}
```

### 2.2 ApiService

```typescript
// core/services/api.service.ts
// Base abstraction — all feature services extend or inject this
export class ApiService {
  get<T>(endpoint: string, params?: HttpParams): Observable<T>
  post<T>(endpoint: string, body: unknown): Observable<T>
  put<T>(endpoint: string, body: unknown): Observable<T>
  patch<T>(endpoint: string, body: Partial<unknown>): Observable<T>
  delete<T>(endpoint: string): Observable<T>
}
```

### 2.3 AuthGuard

```typescript
// core/guards/auth.guard.ts
export const authGuard: CanActivateFn = (route, state) => {
  // Redirect to /auth/login if not authenticated
  // Uses inject(AuthService)
}

// core/guards/role.guard.ts
export const roleGuard: CanActivateFn = (route, state) => {
  // Check route data { roles: ['admin'] } against current user role
}
```

### 2.4 Interceptors

```typescript
// core/interceptors/auth-token.interceptor.ts
// Attaches Bearer token from SessionService to every outgoing request

// core/interceptors/error-handler.interceptor.ts
// Normalizes API errors, triggers NotificationService for user feedback
// Handles 401 → auto-logout, 403 → redirect, 500 → toast error
```

---

## 3. Shared Module Design

### 3.1 Reusable Components

| Component | Inputs | Outputs | Notes |
|-----------|--------|---------|-------|
| `AppButtonComponent` | `label`, `variant`, `loading`, `disabled` | `clicked` | Primary/Secondary/Danger variants |
| `AppCardComponent` | `title`, `subtitle`, `elevated` | — | Semantic card wrapper |
| `AppModalComponent` | `title`, `open` | `closed` | Portal-based overlay |
| `AppLoaderComponent` | `fullscreen`, `message` | — | Lottie animation overlay |
| `AppBadgeComponent` | `text`, `color` | — | Status badges |
| `AppAvatarComponent` | `src`, `name`, `size` | — | Fallback initials |
| `SearchBarComponent` | `placeholder`, `value` | `search`, `clear` | Debounced search |
| `EmptyStateComponent` | `title`, `description`, `icon` | `action` | Zero-data states |
| `PageHeaderComponent` | `title`, `breadcrumbs` | `back` | Consistent page headers |
| `NotificationToastComponent` | — | — | Global toast outlet |

### 3.2 Validators

```typescript
// shared/validators/age-restriction.validator.ts
export function ageRestrictionValidator(min: number, max: number): ValidatorFn

// shared/validators/future-date.validator.ts
export function futureDateValidator(): ValidatorFn

// shared/validators/appointment-overlap.validator.ts
export function appointmentOverlapValidator(existingSlots: TimeSlot[]): ValidatorFn

// shared/validators/medical-detail-required.validator.ts
export function medicalDetailRequiredValidator(fields: string[]): ValidatorFn
```

---

## 4. Feature Module: Auth

### Components

**RegisterComponent** — Reactive Form
```
Fields: firstName, lastName, email, password, confirmPassword,
        dateOfBirth, phone, role, bloodGroup, allergies, existingConditions
Validators: ageRestriction(18, 100), email pattern, password match
```

**LoginComponent** — Reactive Form
```
Fields: email, password, rememberMe
```

**ProfileComponent** — Template-Driven Form (preferences section)
```
Reactive section: name, contact, medical summary
Template-driven section: notificationPreferences, reminderSettings
```

---

## 5. Feature Module: Doctors

### DoctorService

```typescript
export class DoctorService {
  getDoctors(filters?: DoctorFilter): Observable<Doctor[]>
  getDoctorById(id: string): Observable<Doctor>
  getAvailableSlots(doctorId: string, date: string): Observable<TimeSlot[]>
  searchDoctors(query: string): Observable<Doctor[]>
}
```

### DoctorFilter Interface

```typescript
interface DoctorFilter {
  specialization?: string;
  location?: string;
  availability?: string;        // date string
  consultationType?: 'in-person' | 'virtual' | 'both';
  minRating?: number;
}
```

---

## 6. Feature Module: Appointment (NgRx)

Full NgRx implementation for this module. See Section 10 for store details.

### BookingWizardComponent

Multi-step form with signal-based step tracking:
```
Step 1: Select Doctor Slot (from NgRx store)
Step 2: Patient Details (dynamic form from config metadata)
Step 3: Confirmation + Submit
```

Dynamic form generation from config:
```typescript
// helpers/form-config.helpers.ts
export function buildAppointmentFormFromConfig(config: FormFieldConfig[]): FormGroup
```

---

## 7. Feature Module: Patient Records

### PatientRecordsService

```typescript
export class PatientRecordsService {
  getVisitHistory(patientId: string): Observable<VisitRecord[]>
  getPrescriptions(patientId: string): Observable<Prescription[]>
  getMedicalNotes(visitId: string): Observable<MedicalNote[]>
  getMedicalTimeline(patientId: string): Observable<TimelineEvent[]>
}
```

### MedicalTimelineComponent

- Uses `RelativeDatePipe` and `AppointmentStatusPipe`
- `OnPush` with track by `visitId`
- Virtualized list for large histories

---

## 8. Feature Module: Admin

### AdminService

```typescript
export class AdminService {
  // Doctor Schedule
  getDoctorSchedules(): Observable<DoctorSchedule[]>
  updateDoctorSchedule(id: string, schedule: DoctorSchedule): Observable<DoctorSchedule>
  createSlot(slot: AppointmentSlot): Observable<AppointmentSlot>
  deleteSlot(slotId: string): Observable<void>

  // Patient Records
  getPatientRecords(filters?: PatientFilter): Observable<PatientRecord[]>
  updateConsultationStatus(appointmentId: string, status: ConsultationStatus): Observable<void>

  // Reports
  getDashboardStats(): Observable<DashboardStats>
  getAppointmentReport(dateRange: DateRange): Observable<ReportData>
}
```

---

## 9. Feature Module: Notifications

### NotificationService (Core)

```typescript
export class NotificationService {
  private notifications = signal<Notification[]>([]);
  unreadCount = computed(() => this.notifications().filter(n => !n.read).length);

  getNotifications(): Signal<Notification[]>
  markAsRead(id: string): void
  markAllAsRead(): void
  addNotification(notification: Notification): void  // called internally by other services
  clearAll(): void
}
```

---

## 10. NgRx Store Design

**Scope:** Appointment Catalog + Slot Availability ONLY

### Actions

```typescript
// store/appointment-catalog/actions/appointment-catalog.actions.ts

// Load Actions
export const loadDoctorSlots = createAction('[Appointment] Load Doctor Slots', props<{ doctorId: string; date: string }>())
export const loadDoctorSlotsSuccess = createAction('[Appointment] Load Doctor Slots Success', props<{ slots: TimeSlot[] }>())
export const loadDoctorSlotsFailure = createAction('[Appointment] Load Doctor Slots Failure', props<{ error: string }>())

// Booking Actions
export const bookSlot = createAction('[Appointment] Book Slot', props<{ booking: BookingRequest }>())
export const bookSlotSuccess = createAction('[Appointment] Book Slot Success', props<{ appointment: Appointment }>())
export const bookSlotFailure = createAction('[Appointment] Book Slot Failure', props<{ error: string }>())

// Catalog Actions
export const loadAppointmentCatalog = createAction('[Appointment] Load Catalog')
export const loadAppointmentCatalogSuccess = createAction('[Appointment] Load Catalog Success', props<{ appointments: Appointment[] }>())
export const cancelAppointment = createAction('[Appointment] Cancel', props<{ appointmentId: string }>())
export const rescheduleAppointment = createAction('[Appointment] Reschedule', props<{ appointmentId: string; newSlot: TimeSlot }>())
export const selectSlot = createAction('[Appointment] Select Slot', props<{ slot: TimeSlot }>())
export const clearSelectedSlot = createAction('[Appointment] Clear Selected Slot')
```

### State Interface

```typescript
// NgRx Entity for Appointments
interface AppointmentCatalogState extends EntityState<Appointment> {
  selectedSlot: TimeSlot | null;
  availableSlots: TimeSlot[];
  slotsLoading: boolean;
  catalogLoading: boolean;
  bookingInProgress: boolean;
  error: string | null;
}

const appointmentAdapter = createEntityAdapter<Appointment>({
  selectId: (a) => a.id,
  sortComparer: (a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
});
```

### Selectors

```typescript
export const selectCatalogState = createFeatureSelector<AppointmentCatalogState>('appointmentCatalog');
export const { selectAll, selectEntities, selectIds, selectTotal } = appointmentAdapter.getSelectors(selectCatalogState);
export const selectAvailableSlots = createSelector(selectCatalogState, s => s.availableSlots);
export const selectSelectedSlot = createSelector(selectCatalogState, s => s.selectedSlot);
export const selectBookingInProgress = createSelector(selectCatalogState, s => s.bookingInProgress);
export const selectSlotsLoading = createSelector(selectCatalogState, s => s.slotsLoading);
export const selectUpcomingAppointments = createSelector(selectAll, appointments => 
  appointments.filter(a => new Date(a.scheduledAt) > new Date() && a.status !== 'cancelled')
);
```

### Effects

```typescript
loadDoctorSlots$ = createEffect(() =>
  this.actions$.pipe(
    ofType(loadDoctorSlots),
    switchMap(({ doctorId, date }) =>
      this.appointmentService.getAvailableSlots(doctorId, date).pipe(
        map(slots => loadDoctorSlotsSuccess({ slots })),
        catchError(error => of(loadDoctorSlotsFailure({ error: error.message })))
      )
    )
  )
);

bookSlot$ = createEffect(() =>
  this.actions$.pipe(
    ofType(bookSlot),
    exhaustMap(({ booking }) =>
      this.appointmentService.bookAppointment(booking).pipe(
        map(appointment => bookSlotSuccess({ appointment })),
        tap(() => this.notificationService.addNotification({ type: 'success', message: 'Appointment booked!' })),
        catchError(error => of(bookSlotFailure({ error: error.message })))
      )
    )
  )
);
```

---

## 11. Data Models / Interfaces

```typescript
// core/models/user.model.ts
interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'customer' | 'admin';
  dateOfBirth: string;
  phone: string;
  bloodGroup?: string;
  allergies?: string[];
  existingConditions?: string[];
  avatar?: string;
  createdAt: string;
}

// core/models/doctor.model.ts
interface Doctor {
  id: string;
  name: string;
  specialization: string;
  experience: number;            // years
  consultationType: 'in-person' | 'virtual' | 'both';
  location: string;
  rating: number;
  reviewCount: number;
  avatar?: string;
  bio: string;
  languages: string[];
  consultationFee: number;
}

// core/models/appointment.model.ts
interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  doctor?: Doctor;
  scheduledAt: string;           // ISO datetime
  duration: number;              // minutes
  type: 'in-person' | 'virtual';
  status: AppointmentStatus;
  reason: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled' | 'no-show';

// core/models/time-slot.model.ts
interface TimeSlot {
  id: string;
  doctorId: string;
  startTime: string;             // ISO datetime
  endTime: string;
  isAvailable: boolean;
  type: 'in-person' | 'virtual';
}

// core/models/prescription.model.ts
interface Prescription {
  id: string;
  appointmentId: string;
  medications: Medication[];
  instructions: string;
  issuedAt: string;
  validUntil?: string;
}

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

// core/models/notification.model.ts
interface Notification {
  id: string;
  userId: string;
  type: 'confirmation' | 'reminder' | 'cancellation' | 'reschedule' | 'admin-alert';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  relatedEntityId?: string;
}

// core/models/form-field-config.model.ts
interface FormFieldConfig {
  key: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'textarea' | 'checkbox' | 'number';
  required: boolean;
  validators?: string[];
  options?: { label: string; value: string }[];
  placeholder?: string;
  defaultValue?: unknown;
}
```

---

## 12. Routing Design

```typescript
// app.routes.ts
export const routes: Routes = [
  { path: '', redirectTo: '/auth/login', pathMatch: 'full' },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes')
  },
  {
    path: 'patient',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['customer'] },
    loadChildren: () => import('./features/patient/patient.routes')
  },
  {
    path: 'doctors',
    canActivate: [authGuard],
    loadChildren: () => import('./features/doctors/doctors.routes')
  },
  {
    path: 'appointments',
    canActivate: [authGuard],
    loadChildren: () => import('./features/appointment/appointment.routes')
  },
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin'] },
    loadChildren: () => import('./features/admin/admin.routes')
  },
  {
    path: 'notifications',
    canActivate: [authGuard],
    loadChildren: () => import('./features/notifications/notifications.routes')
  },
  { path: '**', component: NotFoundComponent }
];
```

---

## 13. Forms Design

### Reactive Forms (Registration + Booking)

```typescript
// Registration form built in RegisterComponent
this.registerForm = this.fb.group({
  firstName: ['', [Validators.required, Validators.minLength(2)]],
  lastName:  ['', [Validators.required]],
  email:     ['', [Validators.required, Validators.email]],
  password:  ['', [Validators.required, Validators.minLength(8)]],
  confirmPassword: ['', Validators.required],
  dateOfBirth: ['', [Validators.required, ageRestrictionValidator(18, 100)]],
  phone:     ['', [Validators.required, Validators.pattern(/^\+?[0-9]{10,15}$/)]],
  role:      ['customer', Validators.required],
  bloodGroup: [''],
  allergies: [''],
  existingConditions: ['']
}, { validators: passwordMatchValidator });
```

### Template-Driven Forms (Profile Preferences)

```html
<!-- Used in profile-preferences.component.html -->
<form #prefsForm="ngForm" (ngSubmit)="savePreferences(prefsForm)">
  <input name="emailReminders" [(ngModel)]="preferences.emailReminders" type="checkbox" />
  <input name="smsReminders" [(ngModel)]="preferences.smsReminders" type="checkbox" />
  <input name="reminderLeadTime" [(ngModel)]="preferences.reminderLeadTime"
         name="reminderLeadTime" required min="1" max="72" type="number" />
</form>
```

### Dynamic Form (Booking Step 2)

```typescript
// helpers/form-config.helpers.ts
// Config drives the form — no hardcoded fields
const APPOINTMENT_FORM_CONFIG: FormFieldConfig[] = [
  { key: 'reason', label: 'Reason for Visit', type: 'textarea', required: true },
  { key: 'consultationType', label: 'Consultation Type', type: 'select', required: true,
    options: [{ label: 'In Person', value: 'in-person' }, { label: 'Virtual', value: 'virtual' }] },
  { key: 'insuranceId', label: 'Insurance ID', type: 'text', required: false },
  { key: 'urgency', label: 'Urgency Level', type: 'select', required: true,
    options: [{ label: 'Routine', value: 'routine' }, { label: 'Urgent', value: 'urgent' }] }
];
```

---

## 14. Custom Directives

```typescript
// shared/directives/autofocus.directive.ts
// Auto-focuses form inputs on view init

// shared/directives/role-access.directive.ts
// *appRoleAccess="['admin']" — structurally removes elements for unauthorized roles

// shared/directives/highlight.directive.ts
// Highlights matching text in search results

// shared/directives/tooltip.directive.ts
// Material-style tooltip on hover (wraps MatTooltip with cleaner API)
```

---

## 15. Custom Pipes

```typescript
// shared/pipes/time-slot.pipe.ts
// Transforms ISO datetime → "10:30 AM – 11:00 AM"

// shared/pipes/age.pipe.ts
// Transforms dateOfBirth string → "34 years old"

// shared/pipes/appointment-status.pipe.ts
// 'confirmed' → 'Confirmed' with optional CSS class suffix

// shared/pipes/relative-date.pipe.ts
// '2026-06-08' → 'Yesterday', '2026-06-09' → 'Today', else date string

// shared/pipes/truncate.pipe.ts
// 'Long text...' | truncate:50 → 'Long text truncated...'
```

---

## 16. Helpers and Utils Design

**Rule:** No utility function shall be duplicated. If logic is needed in two places, it lives in utils/helpers only.

```typescript
// shared/utils/date.utils.ts
export function toISODate(date: Date): string
export function isToday(dateStr: string): boolean
export function addDays(date: Date, days: number): Date
export function formatDisplayDate(dateStr: string, format?: string): string
export function getDateRange(start: string, end: string): string[]
export function isDateInPast(dateStr: string): boolean
export function minutesToDurationString(minutes: number): string

// shared/utils/form.utils.ts
export function markAllAsTouched(form: FormGroup): void
export function getFormErrors(form: FormGroup): Record<string, string[]>
export function patchFormSafely(form: FormGroup, data: Partial<unknown>): void
export function buildFormGroupFromConfig(config: FormFieldConfig[], fb: FormBuilder): FormGroup

// shared/utils/string.utils.ts
export function capitalize(str: string): string
export function slugify(str: string): string
export function truncate(str: string, max: number): string
export function initials(fullName: string): string

// shared/utils/array.utils.ts
export function groupBy<T>(arr: T[], key: keyof T): Record<string, T[]>
export function uniqueBy<T>(arr: T[], key: keyof T): T[]
export function sortByDate<T>(arr: T[], key: keyof T, dir?: 'asc' | 'desc'): T[]

// shared/utils/http.utils.ts
export function buildQueryParams(filters: Record<string, unknown>): HttpParams
export function handleApiError(error: HttpErrorResponse): string

// shared/helpers/appointment.helpers.ts
export function isSlotAvailable(slot: TimeSlot, existingAppointments: Appointment[]): boolean
export function getNextAvailableDate(slots: TimeSlot[]): string | null
export function groupSlotsByDate(slots: TimeSlot[]): Record<string, TimeSlot[]>
export function appointmentConflicts(newSlot: TimeSlot, existing: Appointment[]): boolean

// shared/helpers/doctor.helpers.ts
export function filterDoctors(doctors: Doctor[], filter: DoctorFilter): Doctor[]
export function sortDoctorsByRating(doctors: Doctor[]): Doctor[]
export function getDoctorDisplayName(doctor: Doctor): string

// shared/helpers/form-config.helpers.ts
export function buildAppointmentFormFromConfig(config: FormFieldConfig[]): FormGroup
export function getValidatorsForField(field: FormFieldConfig): ValidatorFn[]
```

---

## 17. HTTP Layer Design

### Base URL Configuration

```typescript
// environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  wsUrl: 'ws://localhost:3000'
};
```

### API Endpoints

| Feature | Method | Endpoint |
|---------|--------|----------|
| Auth | POST | `/api/auth/login` |
| Auth | POST | `/api/auth/register` |
| Auth | POST | `/api/auth/refresh` |
| Doctors | GET | `/api/doctors` |
| Doctors | GET | `/api/doctors/:id` |
| Doctors | GET | `/api/doctors/:id/slots?date=` |
| Appointments | GET | `/api/appointments?patientId=` |
| Appointments | POST | `/api/appointments` |
| Appointments | PUT | `/api/appointments/:id` |
| Appointments | DELETE | `/api/appointments/:id` |
| Patient | GET | `/api/patients/:id/visits` |
| Patient | GET | `/api/patients/:id/prescriptions` |
| Admin | GET | `/api/admin/schedules` |
| Admin | PUT | `/api/admin/schedules/:id` |
| Admin | GET | `/api/admin/reports` |
| Notifications | GET | `/api/notifications?userId=` |
| Notifications | PATCH | `/api/notifications/:id/read` |

---

## 18. Testing Strategy

### Unit Tests (Jasmine + Karma)

- All services: mocked HttpClient via `HttpClientTestingModule`
- All custom validators: pure function tests
- All pipes: transform input → expected output
- All directives: `TestBed` with host component
- Key components: existence, rendering, form submission behavior

### Integration Tests

- Appointment booking flow: slot selection → patient details → confirm → success
- Doctor search filter: filter change → service call → list update
- Profile management: form change → service save → success feedback

### E2E Tests (Cypress)

```
cypress/e2e/
├── auth/
│   ├── login.cy.ts
│   └── register.cy.ts
├── appointment/
│   ├── book-appointment.cy.ts
│   ├── reschedule.cy.ts
│   └── cancel.cy.ts
├── admin/
│   └── schedule-update.cy.ts
└── patient/
    └── view-history.cy.ts
```
