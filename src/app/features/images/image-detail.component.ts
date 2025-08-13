import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImagesService } from './images.service';
import { ExportService } from '../exports/export.service';
import { ImageBundle } from '../../shared/models/image';
import { PreviewPaneComponent } from './preview-pane.component';
import { DataPaneComponent } from './data-pane.component';
import { OcrPaneComponent } from './ocr-pane.component';
import { HistoryPaneComponent } from './history-pane.component';

@Component({
  standalone: true,
  selector: 'app-image-detail',
  imports: [CommonModule, PreviewPaneComponent, DataPaneComponent, OcrPaneComponent, HistoryPaneComponent],
  template: `
  <ng-container *ngIf="bundle() as b; else noSelection">
    <!-- Summary bar -->
    <div class="px-4 py-2 bg-white border-b flex items-center justify-between">
      <div class="flex flex-col gap-1">
        <div class="font-medium truncate">{{ b.image.originalFilename }}</div>
        <div class="flex gap-1 text-xs text-gray-500">
          <span *ngIf="b.normalized?.customer" class="badge">Cust: {{ b.normalized.customer }}</span>
          <span *ngIf="b.normalized?.lines?.length" class="badge">Lines: {{ b.normalized.lines.length }}</span>
          <span *ngIf="b.normalized?.total" class="badge">Total: {{ b.normalized.total | currency:'USD' }}</span>
        </div>
      </div>
      <button class="btn" (click)="export()">Export to QB</button>
    </div>

    <!-- Tabs -->
    <div class="border-b bg-gray-50 flex items-center gap-1 px-4">
      <button [class.active]="tab() === 'preview'" (click)="tab.set('preview')" class="tab-btn">
        <svg class="w-4 h-4"><!-- eye icon --></svg><span>Preview</span>
      </button>
      <button [class.active]="tab() === 'data'" (click)="tab.set('data')" class="tab-btn">
        <svg class="w-4 h-4"><!-- pencil icon --></svg><span>Data</span>
      </button>
      <button [class.active]="tab() === 'ocr'" (click)="tab.set('ocr')" class="tab-btn">
        <svg class="w-4 h-4"><!-- code icon --></svg><span>OCR</span>
      </button>
      <button [class.active]="tab() === 'history'" (click)="tab.set('history')" class="tab-btn">
        <svg class="w-4 h-4"><!-- clock icon --></svg><span>History</span>
      </button>
    </div>

    <!-- Tab content -->
    <div class="h-[calc(100%-4.5rem)] overflow-auto">
      <app-preview-pane *ngIf="tab()==='preview'" [bundle]="b"></app-preview-pane>
      <app-data-pane *ngIf="tab()==='data'" [bundle]="b" (save)="save($event)"></app-data-pane>
      <app-ocr-pane *ngIf="tab()==='ocr'" [ocr]="b.ocr"></app-ocr-pane>
      <app-history-pane *ngIf="tab()==='history'" [audit]="b.audit"></app-history-pane>
    </div>
  </ng-container>
  <ng-template #noSelection>
    <div class="h-full flex items-center justify-center text-gray-400">Select an image to view details</div>
  </ng-template>
  `,
  styles: [`
    .badge { @apply badge bg-gray-100 text-gray-700; }
    .tab-btn { @apply flex items-center gap-1 px-3 py-2 text-sm rounded transition-colors; }
    .tab-btn.active, .tab-btn:hover { @apply bg-white text-gray-900; }
  `]
})
export class ImageDetailComponent {
  private api = inject(ImagesService);
  private exports = inject(ExportService);
  @Input() set imageId(v: string | null) { if (v) this.load(v); }
  @Output() exportQB = new EventEmitter<string>();

  bundle = signal<ImageBundle | null>(null);
  tab = signal<'preview' | 'data' | 'ocr' | 'history'>('preview');
  currentId: string | null = null;

  load(id: string) {
    this.currentId = id;
    this.api.get(id).subscribe(b => this.bundle.set(b));
  }
  save(normalized: any) {
    if (!this.currentId) return;
    this.api.saveNormalized(this.currentId, normalized).subscribe(() => this.load(this.currentId!));
  }
  export() {
    if (!this.currentId) return;
    this.exports.createQB(this.currentId).subscribe(() => this.exportQB.emit(this.currentId!));
  }
}
