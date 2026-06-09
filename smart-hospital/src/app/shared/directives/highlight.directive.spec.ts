import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HighlightDirective } from './highlight.directive';

@Component({
  standalone: true,
  imports: [HighlightDirective],
  template: `<span [appHighlight]="term" [text]="text"></span>`,
})
class HostComponent {
  term = 'Sarah';
  text = 'Dr. Sarah Chen';
}

describe('HighlightDirective', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  let span: HTMLSpanElement;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    span = fixture.nativeElement.querySelector('span');
  });

  it('wraps the matching term in a <mark> element', () => {
    fixture.detectChanges();
    const mark = span.querySelector('mark');
    expect(mark).not.toBeNull();
    expect(mark!.textContent).toBe('Sarah');
  });

  it('preserves the full text content', () => {
    fixture.detectChanges();
    expect(span.textContent).toBe('Dr. Sarah Chen');
  });

  it('renders plain text with no <mark> when term is empty', () => {
    host.term = '';
    fixture.detectChanges();
    expect(span.querySelector('mark')).toBeNull();
    expect(span.textContent).toBe('Dr. Sarah Chen');
  });

  it('highlights every occurrence case-insensitively', () => {
    host.term = 'a';
    host.text = 'aAa';
    fixture.detectChanges();
    expect(span.querySelectorAll('mark').length).toBe(3);
    expect(span.textContent).toBe('aAa');
  });
});
