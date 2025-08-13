import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageRow } from '../../shared/models/image';

@Component({
  standalone: true,
  selector: 'app-image-list',
  imports: [CommonModule],
  template: `
  <div class="h-full min-h-0 flex flex-col">
    <div class="p-2 border-b bg-white flex flex-wrap gap-2 items-center">
      <input class="input" placeholder="Search…" (input)="emitFilters({q: $any($event.target).value})" />
      <input type="date" class="input" (change)="emitFilters({date: $any($event.target).value})" />
      <select class="input" (change)="emitFilters({doc_type: $any($event.target).value})">
        <option value="">All Types</option>
        <option>Invoice</option><option>Packing List</option><option>Receipt</option>
      </select>
      <select class="input" (change)="emitFilters({status: $any($event.target).value})">
        <option value="">Any Status</option><option>new</option><option>processing</option>
        <option>ready</option><option>error</option><option>reviewed</option>
      </select>
      <div class="ml-2 flex items-center gap-1" *ngIf="chips.length">
        <span class="chip cursor-pointer" *ngFor="let c of chips" (click)="clearChip(c.key)">{{c.label}}: {{c.value}} ✕</span>
      </div>
      <div class="ml-auto flex items-center gap-2">
        <button class="px-3 py-1.5 rounded border text-sm" (click)="refresh.emit()">Refresh</button>
        <button class="px-3 py-1.5 rounded border text-sm" (click)="bulkEdit.emit()">Bulk Edit</button>
      </div>
    </div>

  <div class="p-3 space-y-2" *ngIf="loading">
      <div class="h-6 bg-gray-200/70 animate-pulse rounded"></div>
      <div class="h-6 bg-gray-200/70 animate-pulse rounded"></div>
      <div class="h-6 bg-gray-200/70 animate-pulse rounded"></div>
    </div>
  <div class="overflow-y-auto overflow-x-hidden min-h-0" [class.hidden]="loading">
      <table class="w-full text-sm">
        <thead class="sticky top-0 bg-gray-50 border-b">
          <tr class="[&>th]:text-left [&>th]:px-3 [&>th]:py-2">
            <th>File</th><th>Type</th><th>Total</th><th>Status</th><th>Date</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let r of rows; let i = index"
              (click)="selectRow(r.id)"
              [class.bg-blue-50]="r.id===selectedId"
              class="cursor-pointer border-b hover:bg-gray-50 [&>td]:px-3 [&>td]:py-2">
            <td class="truncate">{{r.originalFilename}}</td>
            <td>{{r.docType||'—'}}</td>
            <td>{{r.totalAmount ?? '—'}}</td>
            <td>
              <span class="px-2 py-0.5 rounded text-xs" [class]="badgeClass(r.status)">{{r.status}}</span>
            </td>
            <td>{{r.uploadedAt | date:'short'}}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="mt-auto sticky bottom-0 bg-white border-t p-2 flex items-center justify-between">
      <div class="text-xs text-gray-500">Rows per page: {{pageSize}}</div>
      <div class="flex items-center gap-2">
        <button class="px-2 py-1 border rounded text-xs" (click)="prevPage()">Prev</button>
        <div class="text-xs text-gray-500">{{page}} / {{pages}}</div>
        <button class="px-2 py-1 border rounded text-xs" (click)="nextPage()">Next</button>
      </div>
    </div>
  </div>
  `
})
export class ImageListComponent {
  @Input() rows: ImageRow[] = [];
  @Input() total = 0;
  @Input() loading = false;
  @Output() select = new EventEmitter<string>();
  @Output() filtersChange = new EventEmitter<any>();
  @Output() refresh = new EventEmitter<void>();
  @Output() bulkEdit = new EventEmitter<void>();
  selectedId: string | null = null;
  page = 1; pageSize = 50; get pages() { return Math.max(1, Math.ceil(this.total / this.pageSize)); }
  chips: { key: string; label: string; value: string }[] = [];

  emitFilters(patch: any) {
    const entries = Object.entries(patch).filter(([, v]) => !!v) as [string, string][];
    entries.forEach(([k, v]) => this.upsertChip(k, v));
    this.filtersChange.emit(patch);
  }
  upsertChip(key: string, value: string) {
    const labelMap: any = { q: 'Search', date: 'Date', doc_type: 'Type', status: 'Status' };
    const i = this.chips.findIndex(c => c.key === key);
    if (i >= 0) this.chips[i] = { key, label: labelMap[key] || key, value };
    else this.chips.push({ key, label: labelMap[key] || key, value });
  }
  clearChip(key: string) {
    this.chips = this.chips.filter(c => c.key !== key);
    this.filtersChange.emit({ [key]: '' });
  }
  badgeClass(s?: string) { return s === 'error' ? 'bg-red-100 text-red-700' : s === 'ready' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'; }

  @HostListener('document:keydown', ['$event'])
  onKeys(ev: KeyboardEvent) {
    if (!this.rows.length) return;
    const idx = this.rows.findIndex(r => r.id === this.selectedId);
    if (ev.key === 'ArrowDown') {
      const ni = Math.min((idx < 0 ? 0 : idx + 1), this.rows.length - 1);
      const id = this.rows[ni].id; this.selectedId = id; this.select.emit(id);
    }
    if (ev.key === 'ArrowUp') {
      const pi = Math.max((idx < 0 ? 0 : idx - 1), 0);
      const id = this.rows[pi].id; this.selectedId = id; this.select.emit(id);
    }
  }

  selectRow(id: string) { this.selectedId = id; this.select.emit(id); }
  prevPage() { if (this.page > 1) { this.page--; this.filtersChange.emit({ page: this.page, size: this.pageSize }); } }
  nextPage() { if (this.page < this.pages) { this.page++; this.filtersChange.emit({ page: this.page, size: this.pageSize }); } }
}
