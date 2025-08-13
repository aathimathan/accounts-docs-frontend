import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExportService } from './export.service';
import { ExportJob } from '../../shared/models/export';

@Component({
    standalone: true,
    selector: 'app-export-queue',
    imports: [CommonModule],
    template: `
  <div class="p-4">
    <h2 class="text-lg font-semibold mb-3">Export Queue</h2>
    <table class="w-full text-sm">
      <thead class="border-b"><tr class="[&>th]:text-left [&>th]:px-2 [&>th]:py-1">
        <th>ID</th><th>Image</th><th>Target</th><th>Status</th><th>Updated</th><th>Error</th>
      </tr></thead>
      <tbody>
        <tr *ngFor="let j of jobs()" class="border-b [&>td]:px-2 [&>td]:py-1">
          <td>{{j.id}}</td><td>{{j.imageId}}</td><td>{{j.target}}</td><td>{{j.status}}</td>
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
    constructor() { effect(() => this.load()); }
    load() { this.svc.list().subscribe(r => this.jobs.set(r.items)); }
}
