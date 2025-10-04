import { Routes } from '@angular/router';
import { landingRoutes } from './features/landing/landing.routes';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./features/landing/landing.routes').then((m) => m.landingRoutes),
  },
];
