import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AutofocusDirective } from './autofocus.directive';

@Component({
  standalone: true,
  imports: [AutofocusDirective],
  template: `<input appAutofocus />`,
})
class HostComponent {}

describe('AutofocusDirective', () => {
  let fixture: ComponentFixture<HostComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
    fixture = TestBed.createComponent(HostComponent);
  });

  it('focuses the host element after view init', async () => {
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    const focusSpy = vi.spyOn(input, 'focus');
    fixture.detectChanges();
    await Promise.resolve();
    expect(focusSpy).toHaveBeenCalled();
  });

  it('makes the input the active element', async () => {
    fixture.detectChanges();
    await Promise.resolve();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    expect(document.activeElement).toBe(input);
  });
});
