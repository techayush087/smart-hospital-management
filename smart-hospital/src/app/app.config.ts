import {
  ApplicationConfig,
  isDevMode,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { provideLottieOptions } from 'ngx-lottie';
import { routes } from './app.routes';
import { authTokenInterceptor } from './core/interceptors/auth-token.interceptor';
import { errorHandlerInterceptor } from './core/interceptors/error-handler.interceptor';
import { AuthService } from './core/services/auth.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideHttpClient(withInterceptors([authTokenInterceptor, errorHandlerInterceptor])),
    provideAnimations(),
    provideStore(),
    provideEffects(),
    provideStoreDevtools({ maxAge: 25, logOnly: !isDevMode() }),
    provideLottieOptions({ player: () => import('lottie-web') }),
    // Restore the signed-in user from a persisted token before the app renders,
    // so a page refresh keeps the shell's role-based nav and user menu intact.
    provideAppInitializer(() => firstValueFrom(inject(AuthService).restoreSession())),
  ],
};
