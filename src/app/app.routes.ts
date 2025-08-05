import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: 'upload',
        loadComponent: () =>
            import('./upload/upload.component').then(m => m.UploadComponent)
    },
    {
        path: 'mass-upload',
        loadComponent: () =>
            import('./mass-upload/mass-upload.component').then(m => m.MassUploadComponent)
    },
    {
        path: 'images',
        loadComponent: () =>
            import('./imagelist/imagelist.component').then(m => m.ImagelistComponent)
    },
    { path: '', redirectTo: '/upload', pathMatch: 'full' }
];
