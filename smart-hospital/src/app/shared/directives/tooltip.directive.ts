import { Directive } from '@angular/core';
import { MatTooltip } from '@angular/material/tooltip';

@Directive({
  selector: '[appTooltip]',
  standalone: true,
  hostDirectives: [{ directive: MatTooltip, inputs: ['matTooltip: appTooltip'] }],
})
export class TooltipDirective {}
