import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TooltipDirective } from './tooltip.directive';

@Component({
  standalone: true,
  imports: [TooltipDirective],
  template: `<button appTooltip="hi">x</button>`,
})
class HostComponent {}

describe('TooltipDirective', () => {
  let fixture: ComponentFixture<HostComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HostComponent],
    });
    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
  });

  it('compiles and attaches the directive instance to the host', () => {
    const el: DebugElement = fixture.debugElement.query(By.directive(TooltipDirective));
    expect(el).not.toBeNull();
    expect(el.injector.get(TooltipDirective)).toBeTruthy();
  });
});
