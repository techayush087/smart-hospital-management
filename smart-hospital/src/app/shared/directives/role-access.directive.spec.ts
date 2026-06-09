import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RoleAccessDirective } from './role-access.directive';
import { AuthService } from '../../core/services/auth.service';

@Component({
  standalone: true,
  imports: [RoleAccessDirective],
  template: `<div *appRoleAccess="roles">secret</div>`,
})
class HostComponent {
  roles: string[] = ['admin'];
}

function configure(role: string): ComponentFixture<HostComponent> {
  TestBed.configureTestingModule({
    imports: [HostComponent],
    providers: [
      {
        provide: AuthService,
        useValue: { getCurrentUser: () => () => ({ role }) },
      },
    ],
  });
  return TestBed.createComponent(HostComponent);
}

describe('RoleAccessDirective', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('renders the content when the user role is allowed', () => {
    const fixture = configure('admin');
    fixture.detectChanges();
    const div: HTMLElement | null = fixture.nativeElement.querySelector('div');
    expect(div).not.toBeNull();
    expect(div!.textContent).toContain('secret');
  });

  it('hides the content when the user role is not allowed', () => {
    const fixture = configure('customer');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('div')).toBeNull();
  });
});
