import { Component, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImagesService } from '../images/images.service';
import { ExportService } from '../exports/export.service';
import { StatsService } from '../../shared/services/stats.service';
import { ExportJob } from '../../shared/models/export';

@Component({
  standalone: true,
  selector: 'app-dashboard',
  imports: [CommonModule],
  template: `
    <div class="p-4 grid gap-4">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div class="bg-white rounded border p-4"><div class="text-xs text-gray-500">New Today</div><div class="text-2xl font-semibold">{{mNew()}}</div></div>
        <div class="bg-white rounded border p-4"><div class="text-xs text-gray-500">Needs Review</div><div class="text-2xl font-semibold">{{mReview()}}</div></div>
        <div class="bg-white rounded border p-4"><div class="text-xs text-gray-500">Exported (24h)</div><div class="text-2xl font-semibold">{{mExported()}}</div></div>
        <div class="bg-white rounded border p-4"><div class="text-xs text-gray-500">Failed</div><div class="text-2xl font-semibold">{{mFailed()}}</div></div>
      </div>

      <div class="grid md:grid-cols-2 gap-4">
        <div class="bg-white rounded border p-4">
          <div class="font-semibold mb-2">Activity</div>
          <ol class="text-sm space-y-2">
            <li *ngFor="let a of timeline()">
              <div class="text-sm">{{a.msg}}</div>
              <div class="text-xs text-gray-500">{{a.t | date:'short'}}</div>
            </li>
          </ol>
        </div>
        <div class="bg-white rounded border p-4">
          <div class="font-semibold mb-2">Recent Exports</div>
          <table class="w-full text-sm">
            <thead class="border-b"><tr class="[&>th]:text-left [&>th]:px-2 [&>th]:py-1"><th>Job</th><th>Image</th><th>Status</th><th>Updated</th></tr></thead>
            <tbody>
              <tr *ngFor="let j of recentExports()" class="[&>td]:px-2 [&>td]:py-2 border-b">
                <td>{{j.id}}</td><td>{{j.imageId}}</td><td>{{j.status}}</td><td>{{j.updatedAt | date:'short'}}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent {
  private images = inject(ImagesService);
  private exports = inject(ExportService);
  private stats = inject(StatsService);

  mNew = signal<number>(0);
  mReview = signal<number>(0);
  mExported = signal<number>(0);
  mFailed = signal<number>(0);

  timeline = signal<{ t: string; msg: string }[]>([]);
  recentExports = signal<ExportJob[]>([]);

  constructor() {
    // Prefer aggregated stats endpoint when available
    this.stats.get().subscribe(({ totals, recentImages, recentExports }) => {
      this.mNew.set(recentImages.filter((x: any) => Date.now() - new Date(x.uploaded_at).getTime() < 864e5).length);
      this.mReview.set(totals?.needsReview || 0);
      this.mExported.set(totals?.exported24 || 0);
      this.mFailed.set(totals?.failed || 0);
      const acts = (recentImages || []).slice(0, 3).map((r: any) => ({ t: r.uploaded_at, msg: `Uploaded ${r.original_filename}` }));
      this.timeline.set(acts);
      const recent = (recentExports || []).map((j: any) => ({
        id: String(j.id), imageId: String(j.image_id), target: j.target || 'qb', status: j.status,
        createdAt: j.created_at || j.updated_at, updatedAt: j.updated_at
      }));
      this.recentExports.set(recent);
      this.timeline.update(tl => [...recent.slice(0, 3).map(j => ({ t: j.updatedAt, msg: `Export ${j.id} → ${j.status}` })), ...acts].sort((a, b) => +new Date(b.t) - +new Date(a.t)).slice(0, 6));
    }, _ => {
      // Fallback to previous behavior if stats endpoint fails
      this.images.list({ page: 1, size: 5 }).subscribe(({ items }) => {
        const now = Date.now();
        this.mNew.set(items.filter(x => now - new Date(x.uploadedAt).getTime() < 864e5).length);
        this.mReview.set(items.filter(x => x.status === 'ready').length);
        const acts2 = items.slice(0, 3).map(r => ({ t: r.uploadedAt, msg: `Uploaded ${r.originalFilename}` }));
        this.timeline.set(acts2);
      });
      this.exports.list().subscribe(({ items }) => {
        const now = Date.now();
        this.mExported.set(items.filter(x => x.status === 'sent' && now - new Date(x.updatedAt).getTime() < 864e5).length);
        this.mFailed.set(items.filter(x => x.status === 'failed').length);
        const recent = [...items].sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt)).slice(0, 5);
        this.recentExports.set(recent as any);
        this.timeline.update(tl => [...(recent as any).slice(0, 3).map((j: any) => ({ t: j.updatedAt, msg: `Export ${j.id} → ${j.status}` })), ...tl].sort((a, b) => +new Date(b.t) - +new Date(a.t)).slice(0, 6));
      });
    });
  }
}
