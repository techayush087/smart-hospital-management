/**
 * Global test setup. Provides a no-op ngx-lottie player so any component that
 * renders <ng-lottie> (loader, empty-state) instantiates cleanly in TestBed
 * without each spec wiring it, and without the real player trying to fetch and
 * animate JSON in jsdom (which throws async noise).
 */
import { TestBed } from '@angular/core/testing';
import { provideLottieOptions } from 'ngx-lottie';
import { beforeEach } from 'vitest';

// Minimal stub matching the lottie-web player surface ngx-lottie touches.
const lottiePlayerStub = {
  loadAnimation: () => ({
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    destroy: () => undefined,
    play: () => undefined,
    stop: () => undefined,
    pause: () => undefined,
    setSpeed: () => undefined,
    setDirection: () => undefined,
    goToAndStop: () => undefined,
  }),
  setQuality: () => undefined,
};

beforeEach(() => {
  TestBed.configureTestingModule({
    providers: [provideLottieOptions({ player: () => lottiePlayerStub as never })],
  });
});
