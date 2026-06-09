import * as S from './appointment-catalog.selectors';
import {
  appointmentAdapter,
  initialAppointmentCatalogState,
  AppointmentCatalogState,
} from './appointment-catalog.state';
import { Appointment, TimeSlot } from '../../core/models';

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
  id: string,
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

const future = '2030-01-01T09:00:00.000Z';
const past = '2020-01-01T09:00:00.000Z';

function buildState(
  appointments: Appointment[],
  overrides: Partial<AppointmentCatalogState> = {},
): AppointmentCatalogState {
  return appointmentAdapter.setAll(appointments, {
    ...initialAppointmentCatalogState,
    ...overrides,
  });
}

describe('appointment-catalog selectors', () => {
  it('selectAvailableSlots passes through the availableSlots field', () => {
    const slots = [makeSlot('s1'), makeSlot('s2')];
    const state = buildState([], { availableSlots: slots });
    expect(S.selectAvailableSlots.projector(state)).toEqual(slots);
  });

  it('selectSelectedSlot returns the selected slot', () => {
    const slot = makeSlot('s9');
    const state = buildState([], { selectedSlot: slot });
    expect(S.selectSelectedSlot.projector(state)).toEqual(slot);
  });

  it('selectBookingInProgress / loading flags pass through', () => {
    const state = buildState([], {
      bookingInProgress: true,
      slotsLoading: true,
      catalogLoading: true,
    });
    expect(S.selectBookingInProgress.projector(state)).toBe(true);
    expect(S.selectSlotsLoading.projector(state)).toBe(true);
    expect(S.selectCatalogLoading.projector(state)).toBe(true);
  });

  it('selectUpcomingAppointments excludes past and cancelled appointments', () => {
    const futureConfirmed = makeAppointment('a1', {
      scheduledAt: future,
      status: 'confirmed',
    });
    const pastCompleted = makeAppointment('a2', {
      scheduledAt: past,
      status: 'completed',
    });
    const futureCancelled = makeAppointment('a3', {
      scheduledAt: future,
      status: 'cancelled',
    });
    const all = [futureConfirmed, pastCompleted, futureCancelled];

    const upcoming = S.selectUpcomingAppointments.projector(all);
    expect(upcoming.map((a) => a.id)).toEqual(['a1']);
  });

  it('selectPastAppointments includes past and completed appointments', () => {
    const futureConfirmed = makeAppointment('a1', {
      scheduledAt: future,
      status: 'confirmed',
    });
    const pastCompleted = makeAppointment('a2', {
      scheduledAt: past,
      status: 'completed',
    });
    const futureCompleted = makeAppointment('a4', {
      scheduledAt: future,
      status: 'completed',
    });
    const all = [futureConfirmed, pastCompleted, futureCompleted];

    const pastList = S.selectPastAppointments.projector(all);
    expect(pastList.map((a) => a.id).sort()).toEqual(['a2', 'a4']);
  });

  it('selectAllAppointments returns entities built via the adapter', () => {
    const state = buildState([
      makeAppointment('a1', { scheduledAt: '2026-06-10T09:00:00.000Z' }),
      makeAppointment('a2', { scheduledAt: '2026-06-09T09:00:00.000Z' }),
    ]);
    const all = S.selectAllAppointments.projector(state);
    // adapter sorts ascending by scheduledAt
    expect(all.map((a) => a.id)).toEqual(['a2', 'a1']);
  });
});
