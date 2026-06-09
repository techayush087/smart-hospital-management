import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppBadgeComponent } from './badge.component';

describe('AppBadgeComponent', () => {
  let fixture: ComponentFixture<AppBadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppBadgeComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(AppBadgeComponent);
  });

  it('renders the text and the status modifier class', () => {
    fixture.componentRef.setInput('text', 'Confirmed');
    fixture.componentRef.setInput('status', 'confirmed');
    fixture.detectChanges();

    const badge = fixture.nativeElement.querySelector('.app-badge') as HTMLElement;
    expect(badge.textContent).toContain('Confirmed');
    expect(badge.classList).toContain('app-badge--confirmed');
  });
});
