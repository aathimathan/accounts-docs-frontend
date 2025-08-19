import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UploadService } from './upload.service';
import { HttpEventType } from '@angular/common/http';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-upload',
  imports: [CommonModule],
  template: `
    <div class="h-full grid grid-rows-[auto,1fr,auto]">
      <div class="px-3 py-2 bg-white border-b flex items-center gap-2">
        <button class="px-3 py-1.5 rounded border text-sm" (click)="fileInput.click()">Choose Files</button>
        <input #fileInput type="file" class="hidden" multiple (change)="onFiles($event); fileInput.value='';" />
        <div class="text-xs text-gray-500">or drag & drop below</div>
        <button class="px-3 py-1.5 rounded border text-sm" (click)="dirInput.click()">Folder Upload</button>
        <input #dirInput type="file" class="hidden" webkitdirectory multiple (change)="onDir($event); dirInput.value='';" />
        <div class="ml-auto text-xs text-gray-500">
          Processed: <span>{{processed}}</span> • Failed: <span>{{failed}}</span>
        </div>
      </div>

      <div class="m-4 border-2 border-dashed rounded bg-white flex-1 flex items-center justify-center text-gray-500"
           (dragenter)="$event.preventDefault()" (dragover)="$event.preventDefault()" (dragleave)="$event.preventDefault()"
           (drop)="onDrop($event)">
        Drop files here
      </div>

      <div class="p-4 overflow-auto">
        <table class="w-full text-sm">
          <thead class="border-b">
            <tr class="[&>th]:text-left [&>th]:px-2 [&>th]:py-1">
              <th>File</th><th>Status</th><th>Progress</th><th>ETA</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let j of jobs; trackBy: trackById" class="[&>td]:px-2 [&>td]:py-2 border-b">
              <td>{{j.name}}</td>
              <td>
                {{j.status}}
                <span *ngIf="j.error" class="text-red-600 ml-1">- {{j.error}}</span>
              </td>
              <td>
                <div class="h-2 bg-gray-200 rounded overflow-hidden w-56">
                  <div [class.bg-red-500]="j.status==='failed'" [class.bg-blue-600]="j.status!=='failed'" class="h-full" [style.width.%]="j.progress"></div>
                </div>
              </td>
              <td>{{j.eta||'--'}}</td>
              <td class="whitespace-nowrap">
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
  private readonly maxConcurrent = 2; // reduce concurrency to avoid OCR/HTTP throttling
  private pumpScheduled = false;

  get processed() { return this.jobs.filter(j => j.status === 'processed').length; }
  get failed() { return this.jobs.filter(j => j.status === 'failed').length; }
  trackById = (_: number, j: any) => j.id;

  onFiles(e: any) {
    const files: File[] = Array.from(e.target.files || []);
    if (files.length) this.addJobs(files);
  }

  onDrop(e: DragEvent) {
    e.preventDefault();
    const files = Array.from(e.dataTransfer?.files || []);
    if (files.length) this.addJobs(files as File[]);
  }

  onDir(e: any) {
    const files: File[] = Array.from(e.target?.files || []);
    if (files.length) this.addJobs(files);
  }

  addJobs(files: File[]) {
    const now = Date.now();
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      this.jobs.unshift({
        id: `${now}-${i}-${Math.random()}`,
        name: f.name,
        size: f.size,
        status: 'queued',
        progress: 0,
        eta: '--',
        error: null,
        sub: null,
        file: f
      });
    }
    this.schedulePump();
  }

  private startUpload(job: any) {
    this.inFlight++;
    job.status = 'uploading';
    job.progress = 0;
    job.error = null;
    job.eta = '--';

    job.sub = this.up.upload(job.file).pipe(
      catchError((err: any) => {
        job.status = 'failed';
        job.error = (err?.error?.error || err?.message || 'Upload failed');
        return of(null); // allow finalize to run
      }),
      finalize(() => {
        // ALWAYS run after success or error
        job.sub = null;
        this.inFlight = Math.max(0, this.inFlight - 1);
        this.schedulePump();
      })
    ).subscribe(event => {
      if (!event) return;
      if (event.type === HttpEventType.UploadProgress && event.total) {
        job.progress = Math.round((event.loaded / event.total) * 100);
      } else if (event.type === HttpEventType.Response) {
        job.progress = 100;
        job.status = 'processed';
      }
    });
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
    setTimeout(() => this.pumpQueue(), 50);
  }

  retry(job: any) {
    if (job.sub) { try { job.sub.unsubscribe(); } catch { } }
    job.status = 'queued';
    job.error = null;
    job.progress = 0;
    this.schedulePump();
  }

  cancel(job: any) {
    try { job.sub?.unsubscribe?.(); } catch { }
    if (job.status === 'uploading') {
      this.inFlight = Math.max(0, this.inFlight - 1);
      this.schedulePump();
    }
    job.status = 'failed';
    job.error = 'Canceled';
  }
}
