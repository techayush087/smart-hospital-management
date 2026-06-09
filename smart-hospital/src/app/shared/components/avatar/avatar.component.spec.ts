import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppAvatarComponent } from './avatar.component';

describe('AppAvatarComponent', () => {
  let fixture: ComponentFixture<AppAvatarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppAvatarComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(AppAvatarComponent);
  });

  it('renders the initials when no src is provided', () => {
    fixture.componentRef.setInput('name', 'Sarah Chen');
    fixture.detectChanges();

    const initials = fixture.nativeElement.querySelector('.app-avatar__initials') as HTMLElement;
    expect(initials).not.toBeNull();
    expect(initials.textContent?.trim()).toBe('SC');
    expect(fixture.nativeElement.querySelector('img')).toBeNull();
  });
});
