import { TimeSlotPipe } from './time-slot.pipe';

describe('TimeSlotPipe', () => {
  const pipe = new TimeSlotPipe();

  it('renders a start and end time joined by an en-dash', () => {
    const result = pipe.transform('2026-06-09T09:00:00.000Z', '2026-06-09T09:30:00.000Z');
    expect(result).toContain('–');
    expect(result.length).toBeGreaterThan(0);
  });

  it('renders only the start time when no end is provided', () => {
    const result = pipe.transform('2026-06-09T09:00:00.000Z');
    expect(result).not.toContain('–');
    expect(result.length).toBeGreaterThan(0);
  });
});
