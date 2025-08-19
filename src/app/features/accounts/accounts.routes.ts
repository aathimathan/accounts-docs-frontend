import { Routes } from '@angular/router';
import { AccountsComponent } from './accounts.component';

export const ACCOUNTS_ROUTES: Routes = [
    {
        path: '',
        component: AccountsComponent,
        children: [
            { path: '', redirectTo: 'trial-balance', pathMatch: 'full' },
            { path: 'trial-balance', loadComponent: () => import('./trial-balance.component').then(m => m.TrialBalanceComponent) },
            { path: 'profit-loss', loadComponent: () => import('./profit-loss.component').then(m => m.ProfitLossComponent) },
        ]
    }
];
