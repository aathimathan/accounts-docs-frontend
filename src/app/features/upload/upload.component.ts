import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UploadService } from './upload.service';
import { HttpEventType } from '@angular/common/http';

@Component({
  standalone: true,
  selector: 'app-upload',
  imports: [CommonModule],
  template: `
    <div class="h-full grid grid-rows-[auto,1fr]">
      <div class="px-3 py-2 bg-white border-b flex items-center gap-2">
        <button class="px-3 py-1.5 rounded border text-sm" (click)="fileInput.click()">Choose Files</button>
        <input #fileInput type="file" class="hidden" multiple (change)="onFiles($event)" />
        <div class="text-xs text-gray-500">or drag & drop below</div>
        <div class="ml-auto text-xs text-gray-500">Processed: <span>{{processed}}</span> • Failed: <span>{{failed}}</span></div>
      </div>

      <div class="m-4 border-2 border-dashed rounded bg-white flex-1 flex items-center justify-center text-gray-500"
           (dragenter)="$event.preventDefault()" (dragover)="$event.preventDefault()" (dragleave)="$event.preventDefault()"
           (drop)="onDrop($event)">
        Drop files here
      </div>

      <div class="p-4 overflow-auto">
        <table class="w-full text-sm">
          <thead class="border-b"><tr class="[&>th]:text-left [&>th]:px-2 [&>th]:py-1">
            <th>File</th><th>Status</th><th>Progress</th><th>ETA</th><th>Actions</th>
          </tr></thead>
          <tbody>
            <tr *ngFor="let j of jobs" class="[&>td]:px-2 [&>td]:py-2 border-b">
              <td>{{j.name}}</td>
              <td>{{j.status}}</td>
              <td>
                <div class="h-2 bg-gray-200 rounded overflow-hidden w-56">
                  <div [class.bg-red-500]="j.status==='failed'" [class.bg-blue-600]="j.status!=='failed'" class="h-full" [style.width.%]="j.progress"></div>
                </div>
              </td>
              <td>{{j.eta||'--'}}</td>
              <td>
                <button *ngIf="j.status==='failed'" class="px-2 py-1 border rounded text-xs" (click)="retry(j)">Retry</button>
                <button *ngIf="j.status==='uploading'" class="px-2 py-1 border rounded text-xs" (click)="cancel(j)">Cancel</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    `
})
export class UploadComponent {
  private up = inject(UploadService);
  jobs: any[] = [];
  // Concurrency control
  private inFlight = 0;
  private readonly maxConcurrent = 3; // tune as needed
  private pumpScheduled = false;
  get processed() { return this.jobs.filter(j => j.status === 'processed').length; }
  get failed() { return this.jobs.filter(j => j.status === 'failed').length; }

  onFiles(e: any) { const files: File[] = Array.from(e.target.files || []); if (files.length) this.addJobs(files); }
  onDrop(e: DragEvent) { e.preventDefault(); const files = Array.from(e.dataTransfer?.files || []); if (files.length) this.addJobs(files as File[]); }

  addJobs(files: File[]) {
    for (const f of files) {
      this.jobs.unshift({ id: Date.now() + Math.random(), name: f.name, size: f.size, status: 'queued', progress: 0, eta: '--', error: null, timer: null, file: f });
    }
    // start queued with concurrency limiting
    this.schedulePump();
  }

  private startUpload(job: any) {
    this.inFlight++;
    job.status = 'uploading'; job.progress = 0; job.eta = '--';
    const sub = this.up.upload(job.file).subscribe({
      next: (event: any) => {
        if (event.type === HttpEventType.UploadProgress && event.total) {
          job.progress = Math.round((event.loaded / event.total) * 100);
        } else if (event.type === HttpEventType.Response) {
          job.progress = 100; job.status = 'processed';
        }
      },
      error: (err: any) => {
        job.status = 'failed';
        job.error = (err?.error?.error || err?.message || 'Upload failed');
      },
      complete: () => {
        job.sub = null;
        this.inFlight = Math.max(0, this.inFlight - 1);
        this.schedulePump();
      }
    });
    job.sub = sub;
  }

  private pumpQueue() {
    this.pumpScheduled = false;
    while (this.inFlight < this.maxConcurrent) {
      const next = this.jobs.find(j => j.status === 'queued');
      if (!next) break;
      this.startUpload(next);
    }
  }

  private schedulePump() {
    if (this.pumpScheduled) return;
    this.pumpScheduled = true;
    // slight delay to batch rapid queue updates and avoid connection thundering herd
    setTimeout(() => this.pumpQueue(), 50);
  }

  retry(job: any) { job.status = 'queued'; job.error = null; this.schedulePump(); }
  cancel(job: any) {
    try { job.sub?.unsubscribe?.(); } catch { }
    if (job.status === 'uploading') {
      this.inFlight = Math.max(0, this.inFlight - 1);
      this.schedulePump();
    }
    job.status = 'failed'; job.error = 'Canceled';
  }
}
