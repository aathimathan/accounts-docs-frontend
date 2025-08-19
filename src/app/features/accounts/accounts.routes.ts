import { Routes } from '@angular/router';

export const ACCOUNTS_ROUTES: Routes = [
    { path: '', redirectTo: 'trial-balance', pathMatch: 'full' },
    { path: 'trial-balance', loadComponent: () => import('./trial-balance.component').then(m => m.TrialBalanceComponent) },
];
