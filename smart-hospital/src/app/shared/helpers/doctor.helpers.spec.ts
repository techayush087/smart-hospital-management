import { Doctor, DoctorFilter } from '../../core/models';
import { filterDoctors, sortDoctorsByRating, getDoctorDisplayName } from './doctor.helpers';

function makeDoctor(overrides: Partial<Doctor> = {}): Doctor {
  return {
    id: 'd1',
    name: 'Dr. Alice Smith',
    specialization: 'Cardiology',
    experience: 10,
    consultationType: 'both',
    location: 'New York',
    rating: 4.5,
    reviewCount: 120,
    bio: 'Experienced cardiologist.',
    languages: ['English'],
    consultationFee: 200,
    ...overrides,
  };
}

describe('doctor.helpers', () => {
  describe('filterDoctors', () => {
    it('returns only doctors matching the specialization', () => {
      const cardio = makeDoctor({ id: 'd1', specialization: 'Cardiology' });
      const derma = makeDoctor({ id: 'd2', specialization: 'Dermatology' });
      const filter: DoctorFilter = { specialization: 'Cardiology' };

      const result = filterDoctors([cardio, derma], filter);

      expect(result).toEqual([cardio]);
    });

    it('matches location case-insensitively (substring)', () => {
      const ny = makeDoctor({ id: 'd1', location: 'New York' });
      const la = makeDoctor({ id: 'd2', location: 'Los Angeles' });

      const result = filterDoctors([ny, la], { location: 'new york' });

      expect(result).toEqual([ny]);
    });

    it('excludes doctors below the minimum rating', () => {
      const high = makeDoctor({ id: 'd1', rating: 4.8 });
      const low = makeDoctor({ id: 'd2', rating: 3.2 });

      const result = filterDoctors([high, low], { minRating: 4.0 });

      expect(result).toEqual([high]);
    });

    it('filters by consultationType while keeping "both" doctors', () => {
      const inPerson = makeDoctor({ id: 'd1', consultationType: 'in-person' });
      const virtual = makeDoctor({ id: 'd2', consultationType: 'virtual' });
      const both = makeDoctor({ id: 'd3', consultationType: 'both' });

      const result = filterDoctors([inPerson, virtual, both], { consultationType: 'virtual' });

      expect(result).toEqual([virtual, both]);
    });

    it('returns all doctors for an empty filter', () => {
      const list = [makeDoctor({ id: 'd1' }), makeDoctor({ id: 'd2' })];
      expect(filterDoctors(list, {})).toEqual(list);
    });
  });

  describe('sortDoctorsByRating', () => {
    it('orders doctors by rating descending without mutating the input', () => {
      const a = makeDoctor({ id: 'a', rating: 3.0 });
      const b = makeDoctor({ id: 'b', rating: 5.0 });
      const c = makeDoctor({ id: 'c', rating: 4.0 });
      const input = [a, b, c];

      const result = sortDoctorsByRating(input);

      expect(result.map((d) => d.id)).toEqual(['b', 'c', 'a']);
      // original not mutated
      expect(input.map((d) => d.id)).toEqual(['a', 'b', 'c']);
    });
  });

  describe('getDoctorDisplayName', () => {
    it('returns the doctor name', () => {
      expect(getDoctorDisplayName(makeDoctor({ name: 'Dr. Bob' }))).toBe('Dr. Bob');
    });
  });
});
