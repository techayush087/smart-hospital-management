import { appointmentCatalogReducer } from './appointment-catalog.reducer';
import { initialAppointmentCatalogState } from './appointment-catalog.state';
import * as A from './appointment-catalog.actions';
import { Appointment, TimeSlot, BookingRequest } from '../../core/models';

function makeSlot(id = 's1', overrides: Partial<TimeSlot> = {}): TimeSlot {
  return {
    id,
    doctorId: 'd1',
    startTime: '2026-06-10T09:00:00.000Z',
    endTime: '2026-06-10T09:30:00.000Z',
    isAvailable: true,
    type: 'in-person',
    ...overrides,
  };
}

function makeAppointment(
  id = 'a1',
  overrides: Partial<Appointment> = {},
): Appointment {
  return {
    id,
    patientId: 'p1',
    doctorId: 'd1',
    scheduledAt: '2026-06-10T09:00:00.000Z',
    duration: 30,
    type: 'in-person',
    status: 'confirmed',
    reason: 'Checkup',
    createdAt: '2026-06-01T00:00:00.000Z',
    updatedAt: '2026-06-01T00:00:00.000Z',
    ...overrides,
  };
}

function makeBooking(overrides: Partial<BookingRequest> = {}): BookingRequest {
  return {
    doctorId: 'd1',
    slotId: 's1',
    patientId: 'p1',
    scheduledAt: '2026-06-10T09:00:00.000Z',
    duration: 30,
    type: 'in-person',
    reason: 'Checkup',
    consultationType: 'in-person',
    urgency: 'routine',
    ...overrides,
  };
}

describe('appointmentCatalogReducer', () => {
  it('returns the initial state for an unknown action', () => {
    const state = appointmentCatalogReducer(undefined, { type: '@@init' } as never);
    expect(state).toEqual(initialAppointmentCatalogState);
  });

  it('loadDoctorSlots sets slotsLoading true and clears error', () => {
    const start = { ...initialAppointmentCatalogState, error: 'boom' };
    const state = appointmentCatalogReducer(
      start,
      A.loadDoctorSlots({ doctorId: 'd1', date: '2026-06-10' }),
    );
    expect(state.slotsLoading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('loadDoctorSlotsSuccess sets availableSlots and clears slotsLoading', () => {
    const slots = [makeSlot('s1'), makeSlot('s2')];
    const state = appointmentCatalogReducer(
      { ...initialAppointmentCatalogState, slotsLoading: true },
      A.loadDoctorSlotsSuccess({ slots }),
    );
    expect(state.availableSlots).toEqual(slots);
    expect(state.slotsLoading).toBe(false);
  });

  it('loadDoctorSlotsFailure stores the error and clears slotsLoading', () => {
    const state = appointmentCatalogReducer(
      { ...initialAppointmentCatalogState, slotsLoading: true },
      A.loadDoctorSlotsFailure({ error: 'network' }),
    );
    expect(state.slotsLoading).toBe(false);
    expect(state.error).toBe('network');
  });

  it('selectSlot sets the selected slot', () => {
    const slot = makeSlot('s1');
    const state = appointmentCatalogReducer(
      initialAppointmentCatalogState,
      A.selectSlot({ slot }),
    );
    expect(state.selectedSlot).toEqual(slot);
  });

  it('clearSelectedSlot resets the selected slot to null', () => {
    const start = { ...initialAppointmentCatalogState, selectedSlot: makeSlot() };
    const state = appointmentCatalogReducer(start, A.clearSelectedSlot());
    expect(state.selectedSlot).toBeNull();
  });

  it('bookSlot sets bookingInProgress true and clears error', () => {
    const start = { ...initialAppointmentCatalogState, error: 'boom' };
    const state = appointmentCatalogReducer(
      start,
      A.bookSlot({ booking: makeBooking() }),
    );
    expect(state.bookingInProgress).toBe(true);
    expect(state.error).toBeNull();
  });

  it('bookSlotSuccess upserts the appointment, clears bookingInProgress and selectedSlot', () => {
    const appointment = makeAppointment('a1');
    const start = {
      ...initialAppointmentCatalogState,
      bookingInProgress: true,
      selectedSlot: makeSlot(),
    };
    const state = appointmentCatalogReducer(
      start,
      A.bookSlotSuccess({ appointment }),
    );
    expect(state.ids).toContain('a1');
    expect(state.entities['a1']).toEqual(appointment);
    expect(state.bookingInProgress).toBe(false);
    expect(state.selectedSlot).toBeNull();
  });

  it('bookSlotFailure stores the error and clears bookingInProgress', () => {
    const state = appointmentCatalogReducer(
      { ...initialAppointmentCatalogState, bookingInProgress: true },
      A.bookSlotFailure({ error: 'declined' }),
    );
    expect(state.bookingInProgress).toBe(false);
    expect(state.error).toBe('declined');
  });

  it('loadAppointmentCatalog sets catalogLoading true', () => {
    const state = appointmentCatalogReducer(
      initialAppointmentCatalogState,
      A.loadAppointmentCatalog(),
    );
    expect(state.catalogLoading).toBe(true);
  });

  it('loadAppointmentCatalogSuccess sets all entities and clears catalogLoading', () => {
    const appointments = [makeAppointment('a1'), makeAppointment('a2')];
    const state = appointmentCatalogReducer(
      { ...initialAppointmentCatalogState, catalogLoading: true },
      A.loadAppointmentCatalogSuccess({ appointments }),
    );
    expect(state.ids.length).toBe(2);
    expect(state.catalogLoading).toBe(false);
  });

  it('loadAppointmentCatalogFailure stores the error and clears catalogLoading', () => {
    const state = appointmentCatalogReducer(
      { ...initialAppointmentCatalogState, catalogLoading: true },
      A.loadAppointmentCatalogFailure({ error: 'down' }),
    );
    expect(state.catalogLoading).toBe(false);
    expect(state.error).toBe('down');
  });

  it('cancelAppointmentSuccess updates the appointment status to cancelled', () => {
    const seeded = appointmentCatalogReducer(
      initialAppointmentCatalogState,
      A.loadAppointmentCatalogSuccess({
        appointments: [makeAppointment('a1', { status: 'confirmed' })],
      }),
    );
    const state = appointmentCatalogReducer(
      seeded,
      A.cancelAppointmentSuccess({
        appointment: makeAppointment('a1', { status: 'cancelled' }),
      }),
    );
    expect(state.entities['a1']?.status).toBe('cancelled');
  });

  it('rescheduleAppointmentSuccess updates the appointment', () => {
    const seeded = appointmentCatalogReducer(
      initialAppointmentCatalogState,
      A.loadAppointmentCatalogSuccess({
        appointments: [makeAppointment('a1', { status: 'confirmed' })],
      }),
    );
    const state = appointmentCatalogReducer(
      seeded,
      A.rescheduleAppointmentSuccess({
        appointment: makeAppointment('a1', {
          status: 'rescheduled',
          scheduledAt: '2026-06-12T11:00:00.000Z',
        }),
      }),
    );
    expect(state.entities['a1']?.status).toBe('rescheduled');
    expect(state.entities['a1']?.scheduledAt).toBe('2026-06-12T11:00:00.000Z');
  });
});
