import {Routes} from '@angular/router';

export const routes: Routes = [
  {
    path: 'insurance',
    loadChildren: () => import('./features/insurance/insurance.routes').then(m => m.routes)
  }

];
