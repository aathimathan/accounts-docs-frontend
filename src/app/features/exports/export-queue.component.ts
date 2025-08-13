import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExportService } from './export.service';
import { ExportJob } from '../../shared/models/export';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  standalone: true,
  selector: 'app-export-queue',
  imports: [CommonModule, LucideAngularModule],
  template: `
  <div class="p-4">
    <div class="mb-3 flex items-center gap-2">
      <select class="input" (change)="onFilter($any($event.target).value)">
        <option value="">All</option><option>queued</option><option>sent</option><option>failed</option>
      </select>
      <button class="px-3 py-1.5 rounded border text-sm inline-flex items-center gap-2" (click)="load()">
        <i-lucide name="refresh-ccw" class="w-4 h-4"></i-lucide>
        <span>Refresh</span>
      </button>
    </div>
    <table class="w-full text-sm">
      <thead class="border-b"><tr class="[&>th]:text-left [&>th]:px-2 [&>th]:py-1">
        <th>ID</th><th>Image</th><th>Target</th><th>Status</th><th>Updated</th><th>Error</th>
      </tr></thead>
      <tbody>
        <tr *ngFor="let j of filteredJobs()" class="border-b [&>td]:px-2 [&>td]:py-1">
          <td>{{j.id}}</td><td>{{j.imageId}}</td><td>{{j.target}}</td>
          <td>
            <span class="badge inline-flex items-center gap-1" [ngClass]="{
              'badge-processing': j.status==='queued',
              'badge-ready': j.status==='sent',
              'badge-error': j.status==='failed'
            }">
              <i-lucide [name]="j.status==='queued' ? 'loader' : j.status==='sent' ? 'check-circle' : 'alert-triangle'" class="w-4 h-4"></i-lucide>
              <span>{{j.status}}</span>
            </span>
          </td>
          <td>{{j.updatedAt | date:'short'}}</td><td class="text-red-600">{{j.error}}</td>
        </tr>
      </tbody>
    </table>
  </div>
  `
})
export class ExportQueueComponent {
  private svc = inject(ExportService);
  jobs = signal<ExportJob[]>([]);
  statusFilter = signal<string>('');

  constructor() { effect(() => this.load()); }

  load() {
    this.svc.list().subscribe((r: { items: ExportJob[] }) => this.jobs.set(r.items));
  }

  onFilter(v: string) { this.statusFilter.set(v); }
  filteredJobs() { const f = this.statusFilter(); return f ? this.jobs().filter(j => j.status === f) : this.jobs(); }
}
