import {InsuranceComponent} from './insurance.component';

export const routes = [
    {
        path: '',
        component: InsuranceComponent,
    },
    {
        path: '**',
        redirectTo: '',
    }
];
