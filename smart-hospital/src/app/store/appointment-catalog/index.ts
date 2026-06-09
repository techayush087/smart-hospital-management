import {
  EnvironmentProviders,
  makeEnvironmentProviders,
} from '@angular/core';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { appointmentCatalogReducer } from './appointment-catalog.reducer';
import { AppointmentCatalogEffects } from './appointment-catalog.effects';

export function provideAppointmentCatalog(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideState('appointmentCatalog', appointmentCatalogReducer),
    provideEffects(AppointmentCatalogEffects),
  ]);
}

export * from './appointment-catalog.actions';
export * from './appointment-catalog.selectors';
export * from './appointment-catalog.state';
