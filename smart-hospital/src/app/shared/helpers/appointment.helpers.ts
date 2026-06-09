import { TimeSlot, Appointment } from '../../core/models';
import { toISODate } from '../utils/date.utils';

/** True when the slot is open and not occupied by an active (non-cancelled) appointment. */
export function isSlotAvailable(slot: TimeSlot, existing: Appointment[]): boolean {
  if (!slot.isAvailable) return false;
  return !existing.some((a) => a.scheduledAt === slot.startTime && a.status !== 'cancelled');
}

/** Returns the ISO date of the earliest available slot, or null when none are available. */
export function getNextAvailableDate(slots: TimeSlot[]): string | null {
  const avail = slots
    .filter((s) => s.isAvailable)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));
  return avail.length ? toISODate(new Date(avail[0].startTime)) : null;
}

/** Groups slots by their calendar day (`YYYY-MM-DD`). */
export function groupSlotsByDate(slots: TimeSlot[]): Record<string, TimeSlot[]> {
  return slots.reduce(
    (acc, s) => {
      const k = toISODate(new Date(s.startTime));
      (acc[k] ??= []).push(s);
      return acc;
    },
    {} as Record<string, TimeSlot[]>,
  );
}

/** True when a non-cancelled appointment occupies the same start time as the new slot. */
export function appointmentConflicts(newSlot: TimeSlot, existing: Appointment[]): boolean {
  return existing.some(
    (a) =>
      a.status !== 'cancelled' &&
      new Date(a.scheduledAt).getTime() === new Date(newSlot.startTime).getTime(),
  );
}
