import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'pharmacies',
    loadComponent: () => import('./features/pharmacies/pharmacies').then(m => m.Pharmacies),
  },
  {
    path: 'appointment',
    loadComponent: () => import('./features/appointment/appointment').then(m => m.Appointment),
  },
];
