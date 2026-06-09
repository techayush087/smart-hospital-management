import { Directive, Input, ElementRef, OnChanges, inject } from '@angular/core';

@Directive({ selector: '[appHighlight]', standalone: true })
export class HighlightDirective implements OnChanges {
  @Input('appHighlight') term = '';
  @Input() text = '';
  private el = inject<ElementRef<HTMLElement>>(ElementRef);

  ngOnChanges(): void {
    const host = this.el.nativeElement;
    host.replaceChildren();
    if (!this.term) {
      host.appendChild(document.createTextNode(this.text));
      return;
    }
    const re = new RegExp(`(${this.term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'ig');
    this.text.split(re).forEach((part, i) => {
      if (!part) return;
      if (i % 2 === 1) {
        const mark = document.createElement('mark');
        mark.textContent = part;
        host.appendChild(mark);
      } else {
        host.appendChild(document.createTextNode(part));
      }
    });
  }
}
