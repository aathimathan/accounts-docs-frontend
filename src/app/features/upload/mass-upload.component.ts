import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UploadService } from './upload.service';

@Component({
    standalone: true,
    selector: 'app-mass-upload',
    imports: [CommonModule],
    template: `
  <div class="p-6 max-w-xl">
    <input type="file" multiple (change)="onFiles($event)" />
    <div class="mt-3 text-sm text-gray-600">Bulk upload (background)</div>
  </div>
  `
})
export class MassUploadComponent {
    private up = inject(UploadService);
    onFiles(e: any) { const files: File[] = Array.from(e.target.files || []); if (files.length) this.up.uploadMany(files).subscribe(); }
}
