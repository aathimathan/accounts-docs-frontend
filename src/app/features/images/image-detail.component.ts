import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImagesService } from './images.service';
import { ImageBundle } from '../../shared/models/image';
import { PreviewPaneComponent } from './preview-pane.component';
import { DataPaneComponent } from './data-pane.component';
import { OcrPaneComponent } from './ocr-pane.component';
import { HistoryPaneComponent } from './history-pane.component';
import { ExportService } from '../exports/export.service';

type Tab = 'preview' | 'data' | 'ocr' | 'history';

@Component({
  standalone: true,
  selector: 'app-image-detail',
  imports: [CommonModule, PreviewPaneComponent, DataPaneComponent, OcrPaneComponent, HistoryPaneComponent],
  template: `
  <div class="h-full grid grid-rows-[auto,1fr]">
    <div class="px-3 border-b bg-white flex items-center justify-between">
      <div class="flex gap-3">
        <button class="px-3 py-2 text-sm hover:bg-gray-100 rounded" [ngClass]="{'bg-gray-200': tab()==='preview'}" (click)="tab.set('preview')">Preview</button>
        <button class="px-3 py-2 text-sm hover:bg-gray-100 rounded" [ngClass]="{'bg-gray-200': tab()==='data'}" (click)="tab.set('data')">Data</button>
        <button class="px-3 py-2 text-sm hover:bg-gray-100 rounded" [ngClass]="{'bg-gray-200': tab()==='ocr'}" (click)="tab.set('ocr')">OCR</button>
        <button class="px-3 py-2 text-sm hover:bg-gray-100 rounded" [ngClass]="{'bg-gray-200': tab()==='history'}" (click)="tab.set('history')">History</button>
      </div>
      <div class="flex items-center gap-2 text-sm">
        <div class="hidden md:block">{{bundle()?.image?.originalFilename}}</div>
        <button class="px-3 py-1.5 rounded bg-blue-600 text-white" (click)="export()">Export to QB</button>
      </div>
    </div>

    <div class="overflow-auto">
      <app-preview-pane *ngIf="tab()==='preview' && bundle()" [bundle]="bundle()!" />
      <app-data-pane *ngIf="tab()==='data' && bundle()" [bundle]="bundle()!" (save)="save($event)" />
      <app-ocr-pane *ngIf="tab()==='ocr' && bundle()" [ocr]="bundle()!.ocr" />
      <app-history-pane *ngIf="tab()==='history' && bundle()" [audit]="bundle()!.audit" />
    </div>
  </div>
  `
})
export class ImageDetailComponent {
  private api = inject(ImagesService);
  private exports = inject(ExportService);
  @Input() set imageId(v: string | null) { if (v) this.load(v); }
  @Output() exportQB = new EventEmitter<string>();

  tab = signal<Tab>('preview');
  bundle = signal<ImageBundle | null>(null);
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
