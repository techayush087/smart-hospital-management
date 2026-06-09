import { Directive, Input, TemplateRef, ViewContainerRef, inject } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';

@Directive({ selector: '[appRoleAccess]', standalone: true })
export class RoleAccessDirective {
  private tpl = inject<TemplateRef<unknown>>(TemplateRef);
  private vcr = inject(ViewContainerRef);
  private auth = inject(AuthService);

  @Input() set appRoleAccess(roles: string[]) {
    const user = this.auth.getCurrentUser()();
    this.vcr.clear();
    if (user && roles.includes(user.role)) {
      this.vcr.createEmbeddedView(this.tpl);
    }
  }
}
