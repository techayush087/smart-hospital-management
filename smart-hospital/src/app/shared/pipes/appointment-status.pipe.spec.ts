import { AppointmentStatusPipe } from './appointment-status.pipe';

describe('AppointmentStatusPipe', () => {
  const pipe = new AppointmentStatusPipe();

  it('capitalizes a standard status', () => {
    expect(pipe.transform('confirmed')).toBe('Confirmed');
  });

  it('renders no-show with the hyphenated label', () => {
    expect(pipe.transform('no-show')).toBe('No-show');
  });

  it('capitalizes a pending status', () => {
    expect(pipe.transform('pending')).toBe('Pending');
  });
});
