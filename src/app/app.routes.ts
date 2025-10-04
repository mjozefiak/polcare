import {Routes} from '@angular/router';

export const routes: Routes = [
  {
    path: 'insurance',
    loadChildren: () => import('./features/insurance/insurance.routes').then(m => m.routes)
  },
  {
    path: 'pharmacies',
    loadComponent: () => import('./features/pharmacies/pharmacies').then(m => m.Pharmacies),
  },
  {
    path: 'appointment',
    loadComponent: () => import('./features/appointment/appointment').then(m => m.Appointment),
  },
];
