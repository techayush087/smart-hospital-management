import { createFeatureSelector, createSelector } from '@ngrx/store';
import {
  AppointmentCatalogState,
  appointmentAdapter,
} from './appointment-catalog.state';

export const selectCatalogState =
  createFeatureSelector<AppointmentCatalogState>('appointmentCatalog');

const adapterSelectors = appointmentAdapter.getSelectors(selectCatalogState);

export const selectAllAppointments = adapterSelectors.selectAll;

export const selectAvailableSlots = createSelector(
  selectCatalogState,
  (s) => s.availableSlots,
);
export const selectSelectedSlot = createSelector(
  selectCatalogState,
  (s) => s.selectedSlot,
);
export const selectBookingInProgress = createSelector(
  selectCatalogState,
  (s) => s.bookingInProgress,
);
export const selectSlotsLoading = createSelector(
  selectCatalogState,
  (s) => s.slotsLoading,
);
export const selectCatalogLoading = createSelector(
  selectCatalogState,
  (s) => s.catalogLoading,
);

export const selectUpcomingAppointments = createSelector(
  selectAllAppointments,
  (list) =>
    list.filter(
      (a) => new Date(a.scheduledAt) > new Date() && a.status !== 'cancelled',
    ),
);

export const selectPastAppointments = createSelector(
  selectAllAppointments,
  (list) =>
    list.filter(
      (a) => new Date(a.scheduledAt) <= new Date() || a.status === 'completed',
    ),
);
