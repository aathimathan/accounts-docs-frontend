import { Component, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImagesService } from './images.service';
import { ImageListComponent } from './image-list.component';
import { ImageDetailComponent } from './image-detail.component';
import { ImageRow } from '../../shared/models/image';
import { ExportService } from '../exports/export.service';

@Component({
  standalone: true,
  selector: 'app-images-page',
  imports: [CommonModule, ImageListComponent, ImageDetailComponent],
  template: `
  <div class="h-full grid grid-rows-[auto,1fr]">
    <!-- Toolbar -->
    <div class="bg-white shadow-sm border-b px-4 py-3 flex flex-wrap items-center gap-2">
      <div class="flex items-center gap-1">
        <svg class="w-5 h-5 text-gray-500"><!-- search icon --></svg>
        <input placeholder="Search…" class="input w-48" (input)="onFilter({q: $any($event.target).value})">
      </div>
      <div class="flex items-center gap-1">
        <svg class="w-5 h-5 text-gray-500"><!-- calendar icon --></svg>
        <input type="date" class="input" (change)="onFilter({date: $any($event.target).value})">
      </div>
      <select class="input" (change)="onFilter({doc_type: $any($event.target).value})">
        <option value="">All Types</option><option>Invoice</option><option>Packing List</option><option>Receipt</option>
      </select>
      <select class="input" (change)="onFilter({status: $any($event.target).value})">
        <option value="">Any Status</option><option>new</option><option>processing</option><option>ready</option><option>error</option><option>reviewed</option>
      </select>
      <!-- Filter chips -->
      <div class="flex flex-wrap items-center gap-1 ml-2">
        <span *ngIf="params().q" class="badge">Search: {{params().q}} <button (click)="clearField('q')">×</button></span>
        <span *ngIf="params().date" class="badge">Date: {{params().date}} <button (click)="clearField('date')">×</button></span>
        <span *ngIf="params().doc_type" class="badge">Type: {{params().doc_type}} <button (click)="clearField('doc_type')">×</button></span>
        <span *ngIf="params().status" class="badge">Status: {{params().status}} <button (click)="clearField('status')">×</button></span>
      </div>
      <div class="ml-auto flex items-center gap-2" *ngIf="selected().length">
        <button class="btn" (click)="bulkExport()">Export Selected ({{selected().length}})</button>
        <button class="btn" style="background-color: var(--color-border); color: var(--color-text)" (click)="clearSelection()">Clear</button>
        <button class="btn btn-danger" (click)="deleteSelected()">Delete Selected</button>
      </div>
    </div>

    <!-- Split view -->
   <div class="grid grid-cols-[minmax(500px,600px)_1fr] h-full min-h-0">
      <div class="h-full overflow-y-auto">
      <app-image-list
        class="border-r h-full"
        [rows]="rows()"
        [total]="total()"
        (select)="onSelect($event)"
        (filtersChange)="onFilter($event)"
        (selectionChange)="selected.set($event)">
      </app-image-list>
     </div>

  <app-image-detail class="min-w-0 min-h-0 h-full" [imageId]="selectedId()" (exportQB)="onExport($event)"></app-image-detail>
    </div>
  </div>
  `
})
export class ImagesPageComponent {
  private api = inject(ImagesService);
  private exports = inject(ExportService);

  rows = signal<ImageRow[]>([]);
  total = signal(0);
  selectedId = signal<string | null>(null);
  selected = signal<string[]>([]);
  params = signal<{ date?: string; doc_type?: string; q?: string; status?: string; page: number; size: number }>({ page: 1, size: 50 });

  constructor() {
    effect(() => {
      this.api.list(this.params()).subscribe(({ items, total }) => {
        this.rows.set(items);
        this.total.set(total);
        if (!this.selectedId() && items.length) this.selectedId.set(items[0].id);
      });
    });
  }
  onFilter(p: any) { this.params.update(s => ({ ...s, ...p, page: 1 })); }
  clearField(k: string) { this.params.update(s => { const o = { ...s }; delete (o as any)[k]; return o; }); }
  onSelect(id: string) { this.selectedId.set(id); }
  clearSelection() { this.selected.set([]); }
  deleteSelected() {
    const ids = this.selected();
    if (!ids.length) return;
    if (!confirm(`Delete ${ids.length} file(s)? This cannot be undone.`)) return;
    this.api.deleteMany(ids).subscribe({
      next: () => {
        // Refresh list, clear selection
        this.selected.set([]);
        // trigger a reload by updating params (same values) to retrigger effect
        this.params.update(s => ({ ...s }));
      }
    });
  }
  bulkExport() {
    const ids = this.selected();
    if (ids.length) this.exports.bulkQB(ids).subscribe(() => this.selected.set([]));
  }
  onExport(_: string) { }
}
