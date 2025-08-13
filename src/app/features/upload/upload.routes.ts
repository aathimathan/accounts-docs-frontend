import { Routes } from '@angular/router';
import { UploadComponent } from './upload.component';
import { MassUploadComponent } from './mass-upload.component';

export const UPLOAD_ROUTES: Routes = [
    { path: '', component: UploadComponent },
    { path: 'mass', component: MassUploadComponent }
];
