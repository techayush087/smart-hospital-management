import { TimeSlot, Appointment } from '../../core/models';
import {
  isSlotAvailable,
  getNextAvailableDate,
  groupSlotsByDate,
  appointmentConflicts,
} from './appointment.helpers';

function makeSlot(overrides: Partial<TimeSlot> = {}): TimeSlot {
  return {
    id: 's1',
    doctorId: 'd1',
    startTime: '2026-06-10T09:00:00Z',
    endTime: '2026-06-10T09:30:00Z',
    isAvailable: true,
    type: 'in-person',
    ...overrides,
  };
}

function makeAppointment(overrides: Partial<Appointment> = {}): Appointment {
  return {
    id: 'a1',
    patientId: 'p1',
    doctorId: 'd1',
    scheduledAt: '2026-06-10T09:00:00Z',
    duration: 30,
    type: 'in-person',
    status: 'confirmed',
    reason: 'Checkup',
    createdAt: '2026-06-01T00:00:00Z',
    updatedAt: '2026-06-01T00:00:00Z',
    ...overrides,
  };
}

describe('appointment.helpers', () => {
  describe('isSlotAvailable', () => {
    it('returns true for a free slot with no active appointments', () => {
      expect(isSlotAvailable(makeSlot(), [])).toBe(true);
    });

    it('returns false for a slot flagged unavailable', () => {
      expect(isSlotAvailable(makeSlot({ isAvailable: false }), [])).toBe(false);
    });

    it('returns false when an active appointment occupies the slot', () => {
      const slot = makeSlot({ startTime: '2026-06-10T09:00:00Z' });
      const appt = makeAppointment({ scheduledAt: '2026-06-10T09:00:00Z', status: 'confirmed' });
      expect(isSlotAvailable(slot, [appt])).toBe(false);
    });

    it('returns true when only a cancelled appointment occupies the slot', () => {
      const slot = makeSlot({ startTime: '2026-06-10T09:00:00Z' });
      const cancelled = makeAppointment({ scheduledAt: '2026-06-10T09:00:00Z', status: 'cancelled' });
      expect(isSlotAvailable(slot, [cancelled])).toBe(true);
    });
  });

  describe('getNextAvailableDate', () => {
    it('returns the ISO date of the earliest available slot', () => {
      const slots: TimeSlot[] = [
        makeSlot({ id: 's1', startTime: '2026-06-12T09:00:00Z', isAvailable: true }),
        makeSlot({ id: 's2', startTime: '2026-06-10T09:00:00Z', isAvailable: true }),
        makeSlot({ id: 's3', startTime: '2026-06-09T09:00:00Z', isAvailable: false }),
      ];
      expect(getNextAvailableDate(slots)).toBe('2026-06-10');
    });

    it('returns null when no slots are available', () => {
      expect(getNextAvailableDate([makeSlot({ isAvailable: false })])).toBeNull();
    });
  });

  describe('groupSlotsByDate', () => {
    it('groups slots by their calendar day', () => {
      const slots: TimeSlot[] = [
        makeSlot({ id: 's1', startTime: '2026-06-10T09:00:00Z' }),
        makeSlot({ id: 's2', startTime: '2026-06-10T10:00:00Z' }),
        makeSlot({ id: 's3', startTime: '2026-06-11T09:00:00Z' }),
      ];

      const grouped = groupSlotsByDate(slots);

      expect(Object.keys(grouped).sort()).toEqual(['2026-06-10', '2026-06-11']);
      expect(grouped['2026-06-10'].map((s) => s.id)).toEqual(['s1', 's2']);
      expect(grouped['2026-06-11'].map((s) => s.id)).toEqual(['s3']);
    });
  });

  describe('appointmentConflicts', () => {
    it('returns true when a non-cancelled appointment matches the slot time', () => {
      const slot = makeSlot({ startTime: '2026-06-10T09:00:00Z' });
      const appt = makeAppointment({ scheduledAt: '2026-06-10T09:00:00Z', status: 'confirmed' });
      expect(appointmentConflicts(slot, [appt])).toBe(true);
    });

    it('returns false when only a cancelled appointment matches', () => {
      const slot = makeSlot({ startTime: '2026-06-10T09:00:00Z' });
      const appt = makeAppointment({ scheduledAt: '2026-06-10T09:00:00Z', status: 'cancelled' });
      expect(appointmentConflicts(slot, [appt])).toBe(false);
    });

    it('returns false when no appointment matches the slot time', () => {
      const slot = makeSlot({ startTime: '2026-06-10T09:00:00Z' });
      const appt = makeAppointment({ scheduledAt: '2026-06-11T09:00:00Z' });
      expect(appointmentConflicts(slot, [appt])).toBe(false);
    });
  });
});
