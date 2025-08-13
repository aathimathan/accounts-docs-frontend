import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', redirectTo: 'images', pathMatch: 'full' },
    { path: 'dashboard', loadChildren: () => import('./features/dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES) },
    { path: 'upload', loadChildren: () => import('./features/upload/upload.routes').then(m => m.UPLOAD_ROUTES) },
    { path: 'exports', loadChildren: () => import('./features/exports/exports.routes').then(m => m.EXPORTS_ROUTES) },
    { path: 'qb', loadChildren: () => import('./features/qb/qb.routes').then(m => m.QB_ROUTES) },
    { path: 'images', loadChildren: () => import('./features/images/images.routes').then(m => m.IMAGES_ROUTES) },
    { path: '**', redirectTo: 'images' }
];
