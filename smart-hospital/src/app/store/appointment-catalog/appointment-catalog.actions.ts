import { createAction, props } from '@ngrx/store';
import { TimeSlot, Appointment, BookingRequest } from '../../core/models';

// Load Doctor Slots
export const loadDoctorSlots = createAction(
  '[Appointment] Load Doctor Slots',
  props<{ doctorId: string; date: string }>(),
);
export const loadDoctorSlotsSuccess = createAction(
  '[Appointment] Load Doctor Slots Success',
  props<{ slots: TimeSlot[] }>(),
);
export const loadDoctorSlotsFailure = createAction(
  '[Appointment] Load Doctor Slots Failure',
  props<{ error: string }>(),
);

// Booking
export const bookSlot = createAction(
  '[Appointment] Book Slot',
  props<{ booking: BookingRequest }>(),
);
export const bookSlotSuccess = createAction(
  '[Appointment] Book Slot Success',
  props<{ appointment: Appointment }>(),
);
export const bookSlotFailure = createAction(
  '[Appointment] Book Slot Failure',
  props<{ error: string }>(),
);

// Catalog
export const loadAppointmentCatalog = createAction(
  '[Appointment] Load Catalog',
);
export const loadAppointmentCatalogSuccess = createAction(
  '[Appointment] Load Catalog Success',
  props<{ appointments: Appointment[] }>(),
);
export const loadAppointmentCatalogFailure = createAction(
  '[Appointment] Load Catalog Failure',
  props<{ error: string }>(),
);

// Cancel
export const cancelAppointment = createAction(
  '[Appointment] Cancel',
  props<{ appointmentId: string }>(),
);
export const cancelAppointmentSuccess = createAction(
  '[Appointment] Cancel Success',
  props<{ appointment: Appointment }>(),
);
export const cancelAppointmentFailure = createAction(
  '[Appointment] Cancel Failure',
  props<{ error: string }>(),
);

// Reschedule
export const rescheduleAppointment = createAction(
  '[Appointment] Reschedule',
  props<{ appointmentId: string; newSlot: TimeSlot }>(),
);
export const rescheduleAppointmentSuccess = createAction(
  '[Appointment] Reschedule Success',
  props<{ appointment: Appointment }>(),
);
export const rescheduleAppointmentFailure = createAction(
  '[Appointment] Reschedule Failure',
  props<{ error: string }>(),
);

// Slot selection
export const selectSlot = createAction(
  '[Appointment] Select Slot',
  props<{ slot: TimeSlot }>(),
);
export const clearSelectedSlot = createAction(
  '[Appointment] Clear Selected Slot',
);
