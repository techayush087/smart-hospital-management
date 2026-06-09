import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DoctorCardComponent } from './doctor-card.component';
import { Doctor } from '../../../../core/models';

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

describe('DoctorCardComponent', () => {
  let fixture: ComponentFixture<DoctorCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoctorCardComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(DoctorCardComponent);
  });

  it('renders the doctor name and specialization', () => {
    fixture.componentRef.setInput('doctor', makeDoctor());
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Dr. Alice Smith');
    expect(text).toContain('Cardiology');
  });

  it('emits book with the doctor when the book button is clicked', () => {
    const doctor = makeDoctor();
    fixture.componentRef.setInput('doctor', doctor);
    fixture.detectChanges();

    let emitted: Doctor | undefined;
    fixture.componentInstance.book.subscribe((d) => (emitted = d));

    const button: HTMLElement = fixture.nativeElement.querySelector(
      '[data-cy="book-doctor"] button',
    );
    button.click();

    expect(emitted).toBe(doctor);
  });
});
