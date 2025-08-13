import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UploadService } from './upload.service';

@Component({
    standalone: true,
    selector: 'app-upload',
    imports: [CommonModule],
    template: `
  <div class="p-6 max-w-xl">
    <input type="file" (change)="onFile($event)" />
    <div class="mt-3 text-sm text-gray-600">Single upload</div>
  </div>
  `
})
export class UploadComponent {
    private up = inject(UploadService);
    onFile(e: any) { const f = e.target.files?.[0]; if (f) this.up.upload(f).subscribe(); }
}
