import { Routes } from '@angular/router';
import { landingRoutes } from './features/landing/landing.routes';

export const routes: Routes = [
  {
    path: 'pharmacies',
    loadComponent: () =>
      import('./features/pharmacies/pharmacies').then((m) => m.Pharmacies),
  },
  {
    path: 'appointment',
    loadComponent: () =>
      import('./features/appointment/appointment').then((m) => m.Appointment),
  },
  {
    path: '',
    loadChildren: () =>
      import('./features/landing/landing.routes').then((m) => m.landingRoutes),
  },
];
