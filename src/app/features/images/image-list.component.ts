import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageRow } from '../../shared/models/image';

@Component({
  standalone: true,
  selector: 'app-image-list',
  imports: [CommonModule],
  template: `
  <div class="h-full flex flex-col">
    <div class="p-2 border-b bg-white flex gap-2">
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
    </div>

    <div class="overflow-auto">
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
  </div>
  `
})
export class ImageListComponent {
  @Input() rows: ImageRow[] = [];
  @Input() total = 0;
  @Output() select = new EventEmitter<string>();
  @Output() filtersChange = new EventEmitter<any>();
  selectedId: string | null = null;

  emitFilters(patch: any) { this.filtersChange.emit(patch); }
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
}
