import { Doctor, DoctorFilter } from '../../core/models';

/** Filters doctors by specialization, location, consultation type, and minimum rating. */
export function filterDoctors(doctors: Doctor[], f: DoctorFilter): Doctor[] {
  return doctors.filter(
    (d) =>
      (!f.specialization || d.specialization === f.specialization) &&
      (!f.location || d.location.toLowerCase().includes(f.location.toLowerCase())) &&
      (!f.consultationType ||
        f.consultationType === 'both' ||
        d.consultationType === f.consultationType ||
        d.consultationType === 'both') &&
      (!f.minRating || d.rating >= f.minRating),
  );
}

/** Returns a new array of doctors sorted by rating, highest first. */
export function sortDoctorsByRating(doctors: Doctor[]): Doctor[] {
  return [...doctors].sort((a, b) => b.rating - a.rating);
}

/** Returns the display name for a doctor. */
export function getDoctorDisplayName(d: Doctor): string {
  return d.name;
}
