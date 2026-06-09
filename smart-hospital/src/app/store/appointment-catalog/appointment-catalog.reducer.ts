import { createReducer, on } from '@ngrx/store';
import {
  appointmentAdapter,
  initialAppointmentCatalogState,
} from './appointment-catalog.state';
import * as A from './appointment-catalog.actions';

export const appointmentCatalogReducer = createReducer(
  initialAppointmentCatalogState,
  on(A.loadDoctorSlots, (s) => ({ ...s, slotsLoading: true, error: null })),
  on(A.loadDoctorSlotsSuccess, (s, { slots }) => ({
    ...s,
    availableSlots: slots,
    slotsLoading: false,
  })),
  on(A.loadDoctorSlotsFailure, (s, { error }) => ({
    ...s,
    slotsLoading: false,
    error,
  })),
  on(A.selectSlot, (s, { slot }) => ({ ...s, selectedSlot: slot })),
  on(A.clearSelectedSlot, (s) => ({ ...s, selectedSlot: null })),
  on(A.bookSlot, (s) => ({ ...s, bookingInProgress: true, error: null })),
  on(A.bookSlotSuccess, (s, { appointment }) =>
    appointmentAdapter.upsertOne(appointment, {
      ...s,
      bookingInProgress: false,
      selectedSlot: null,
    }),
  ),
  on(A.bookSlotFailure, (s, { error }) => ({
    ...s,
    bookingInProgress: false,
    error,
  })),
  on(A.loadAppointmentCatalog, (s) => ({ ...s, catalogLoading: true })),
  on(A.loadAppointmentCatalogSuccess, (s, { appointments }) =>
    appointmentAdapter.setAll(appointments, { ...s, catalogLoading: false }),
  ),
  on(A.loadAppointmentCatalogFailure, (s, { error }) => ({
    ...s,
    catalogLoading: false,
    error,
  })),
  on(A.cancelAppointmentSuccess, (s, { appointment }) =>
    appointmentAdapter.upsertOne(appointment, s),
  ),
  on(A.rescheduleAppointmentSuccess, (s, { appointment }) =>
    appointmentAdapter.upsertOne(appointment, s),
  ),
);
