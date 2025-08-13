import { Component, EventEmitter, HostListener, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageRow } from '../../shared/models/image';

@Component({
  standalone: true,
  selector: 'app-image-list',
  imports: [CommonModule],
  template: `
  <div class="h-full flex flex-col">
    <!-- Table -->
    <div class="flex-1 overflow-auto relative">
      <table class="w-full text-sm">
        <thead class="sticky top-0 bg-gray-100 border-b shadow-sm">
          <tr>
            <th class="w-8 py-2 px-3">
              <input type="checkbox" [checked]="allChecked()" (change)="toggleAll($event)">
            </th>
            <th class="py-2 px-3 text-left">File</th>
            <th class="py-2 px-3 text-left">Type</th>
            <th class="py-2 px-3 text-left">Total</th>
            <th class="py-2 px-3 text-left">Status</th>
            <th class="py-2 px-3 text-left">Date</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let r of rows" (click)="selectRow(r.id)"
              [class.bg-blue-50]="r.id===selectedId"
              class="border-b hover:bg-gray-50 transition-colors">
            <td class="py-1.5 px-3" (click)="$event.stopPropagation()">
              <input type="checkbox" [checked]="selected.has(r.id)" (change)="toggleRow(r.id,$event)">
            </td>
            <td class="py-1.5 px-3 truncate">{{r.originalFilename}}</td>
            <td class="py-1.5 px-3">{{r.docType||'—'}}</td>
            <td class="py-1.5 px-3">{{r.totalAmount ?? '—'}}</td>
            <td class="py-1.5 px-3">
              <span class="badge" [ngClass]="badgeClass(r.status)">{{r.status}}</span>
            </td>
            <td class="py-1.5 px-3">{{ r.uploadedAt | date:'short' }}</td>
          </tr>
        </tbody>
      </table>
      <!-- Skeleton -->
      <div *ngIf="!rows?.length" class="p-4 space-y-2">
        <div class="h-6 bg-gray-200 animate-pulse rounded"></div>
        <div class="h-6 bg-gray-200 animate-pulse rounded"></div>
        <div class="h-6 bg-gray-200 animate-pulse rounded"></div>
      </div>
    </div>
    <!-- Footer -->
    <div class="border-t bg-gray-50 px-3 py-2 text-xs flex items-center justify-between">
      <div>{{rows.length}} row(s)</div>
      <div *ngIf="selected.size" class="flex items-center gap-2">
        <span>{{selected.size}} selected</span>
        <button class="px-2 py-1 border rounded text-xs" (click)="emitSelection()">Export</button>
        <button class="px-2 py-1 border rounded text-xs" (click)="clearSelection()">Clear</button>
      </div>
    </div>
  </div>
  `,
  styles: [`
    .badge.ready{ @apply badge badge--ready; }
    .badge.processing{ @apply badge badge--processing; }
    .badge.error{ @apply badge badge--error; }
    .badge.reviewed{ @apply badge badge--reviewed; }
  `]
})
export class ImageListComponent implements OnChanges {
  @Input() rows: ImageRow[] = [];
  @Input() total = 0;
  @Output() select = new EventEmitter<string>();
  @Output() filtersChange = new EventEmitter<any>();
  @Output() selectionChange = new EventEmitter<string[]>();

  selectedId: string | null = null;
  selected = new Set<string>();

  ngOnChanges(ch: SimpleChanges) {
    if (ch['rows']) {
      const visible = new Set(this.rows.map(r => r.id));
      this.selected.forEach(id => { if (!visible.has(id)) this.selected.delete(id); });
    }
  }
  badgeClass(s?: string) { return s || 'reviewed'; }
  emitSelection() { this.selectionChange.emit([...this.selected]); }
  clearSelection() { this.selected.clear(); this.emitSelection(); }
  toggleRow(id: string, ev: any) { ev.target.checked ? this.selected.add(id) : this.selected.delete(id); this.emitSelection(); }
  toggleAll(ev: any) { ev.target.checked ? this.rows.forEach(r => this.selected.add(r.id)) : this.selected.clear(); this.emitSelection(); }
  allChecked() { return this.rows.length > 0 && this.rows.every(r => this.selected.has(r.id)); }

  selectRow(id: string) { this.selectedId = id; this.select.emit(id); }

  @HostListener('document:keydown', ['$event'])
  onKeys(ev: KeyboardEvent) {
    if (!this.rows.length) return;
    const idx = this.rows.findIndex(r => r.id === this.selectedId);
    if (ev.key === 'ArrowDown') { const ni = Math.min(idx + 1, this.rows.length - 1); this.selectedId = this.rows[ni].id; this.select.emit(this.selectedId); }
    if (ev.key === 'ArrowUp') { const pi = Math.max(idx - 1, 0); this.selectedId = this.rows[pi].id; this.select.emit(this.selectedId); }
    if ((ev.ctrlKey || ev.metaKey) && ev.key.toLowerCase() === 'a') { ev.preventDefault(); this.rows.forEach(r => this.selected.add(r.id)); this.emitSelection(); }
  }
}
