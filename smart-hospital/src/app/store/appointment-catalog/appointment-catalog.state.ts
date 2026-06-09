import { EntityState, createEntityAdapter } from '@ngrx/entity';
import { Appointment, TimeSlot } from '../../core/models';

export interface AppointmentCatalogState extends EntityState<Appointment> {
  selectedSlot: TimeSlot | null;
  availableSlots: TimeSlot[];
  slotsLoading: boolean;
  catalogLoading: boolean;
  bookingInProgress: boolean;
  error: string | null;
}

export const appointmentAdapter = createEntityAdapter<Appointment>({
  selectId: (a) => a.id,
  sortComparer: (a, b) =>
    new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
});

export const initialAppointmentCatalogState: AppointmentCatalogState =
  appointmentAdapter.getInitialState({
    selectedSlot: null,
    availableSlots: [],
    slotsLoading: false,
    catalogLoading: false,
    bookingInProgress: false,
    error: null,
  });
