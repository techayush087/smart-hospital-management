import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ProfileComponent } from './profile.component';

describe('ProfileComponent', () => {
  let fixture: ComponentFixture<ProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    fixture = TestBed.createComponent(ProfileComponent);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  function byCy(cy: string): HTMLElement {
    return fixture.nativeElement.querySelector(`[data-cy="${cy}"]`);
  }

  it('renders the reactive personal-details section', () => {
    // Reactive control bound via formControlName.
    expect(byCy('profileFirstName')).not.toBeNull();
    expect(fixture.componentInstance.profileForm.get('firstName')).not.toBeNull();
  });

  it('renders the template-driven preferences section with both checkboxes and the number input', () => {
    expect(byCy('emailReminders')).not.toBeNull();
    expect(byCy('smsReminders')).not.toBeNull();
    const lead = byCy('reminderLeadTime') as HTMLInputElement;
    expect(lead).not.toBeNull();
    expect(lead.getAttribute('type')).toBe('number');
  });

  it('stores preferences to a signal when saved', () => {
    expect(fixture.componentInstance.savedPreferences()).toBeNull();
    fixture.componentInstance.savePreferences({ invalid: false } as never);
    expect(fixture.componentInstance.savedPreferences()).not.toBeNull();
    expect(fixture.componentInstance.preferencesSaved()).toBe(true);
  });
});
