import { AbstractControl } from '@angular/forms';
import { TimeSlot } from '../../core/models';
import { appointmentOverlapValidator } from './appointment-overlap.validator';

function controlWith(value: unknown): AbstractControl {
  return { value } as AbstractControl;
}

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

describe('appointmentOverlapValidator', () => {
  const taken = makeSlot({ startTime: '2026-06-10T09:00:00Z', isAvailable: false });
  const free = makeSlot({ id: 's2', startTime: '2026-06-10T10:00:00Z', isAvailable: true });
  const validator = appointmentOverlapValidator([taken, free]);

  it('returns an error when selecting a taken slot start time', () => {
    expect(validator(controlWith('2026-06-10T09:00:00Z'))).toEqual({ appointmentOverlap: true });
  });

  it('returns null when selecting a free slot start time', () => {
    expect(validator(controlWith('2026-06-10T10:00:00Z'))).toBeNull();
  });

  it('returns null for an empty value', () => {
    expect(validator(controlWith(''))).toBeNull();
  });
});
