import { Component, EventEmitter, HostListener, Input, Output, inject, signal } from '@angular/core';
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
  host: { class: 'block h-full min-h-0' },
  imports: [CommonModule, PreviewPaneComponent, DataPaneComponent, OcrPaneComponent, HistoryPaneComponent],
  template: `
  <div class="h-full grid grid-rows-[auto,1fr]">
    <div class="px-3 border-b bg-white flex items-center justify-between">
      <div class="flex gap-3">
  <button class="px-3 py-2 text-sm hover:bg-gray-100 rounded" [ngClass]="{'tab-active': tab()==='preview'}" (click)="tab.set('preview')">Preview</button>
  <button class="px-3 py-2 text-sm hover:bg-gray-100 rounded" [ngClass]="{'tab-active': tab()==='data'}" (click)="tab.set('data')">Data</button>
  <button class="px-3 py-2 text-sm hover:bg-gray-100 rounded" [ngClass]="{'tab-active': tab()==='ocr'}" (click)="tab.set('ocr')">OCR</button>
  <button class="px-3 py-2 text-sm hover:bg-gray-100 rounded" [ngClass]="{'tab-active': tab()==='history'}" (click)="tab.set('history')">History</button>
      </div>
    <div class="flex items-center gap-3 text-sm">
        <div class="hidden md:block text-gray-600">{{bundle()?.image?.originalFilename}}</div>
        <div class="hidden md:flex items-center gap-2 text-xs text-gray-600" *ngIf="bundle()?.normalized as n">
          <span class="chip" *ngIf="n.customer">Customer: {{n.customer}}</span>
          <span class="chip">Lines: {{(n.lines?.length || n.items?.length || 0)}}</span>
          <span class="chip" *ngIf="n.currency || n.total">Amount: {{n.currency||''}} {{n.total||0}}</span>
        </div>
  <button class="px-3 py-1.5 rounded border disabled:opacity-50" [disabled]="busy()" (click)="reanalyze()">{{ busy() ? 'Re-analyzing…' : 'Re-run analysis' }}</button>
  <button class="px-3 py-1.5 rounded bg-blue-600 text-white" (click)="export()">Export to QB</button>
      </div>
    </div>

  <div class="h-full overflow-hidden min-h-0">
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
  busy = signal(false);
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
    this.exports.createQB(this.currentId).subscribe({
      next: () => this.exportQB.emit(this.currentId!),
      error: (err) => {
        const msg = err?.error?.error || err?.message || 'Export failed';
        this.toast(typeof msg === 'string' ? msg : 'Export failed. Connect QuickBooks in Settings and try again.');
      }
    });
  }

  reanalyze() {
    if (!this.currentId) return;
    this.busy.set(true);
    this.api.reanalyze(this.currentId).subscribe({
      next: b => {
        this.bundle.set(b);
        this.toast('Analysis refreshed');
      },
      error: _ => this.toast('Re-analyze failed'),
      complete: () => this.busy.set(false)
    });
  }

  private toast(msg: string) {
    // minimal inline toast
    const div = document.createElement('div');
    div.textContent = msg;
    div.className = 'fixed bottom-4 right-4 bg-black text-white text-sm px-3 py-2 rounded shadow';
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 2000);
  }

  // Keyboard shortcuts: E to Data, S to Save, X to Export
  @HostListener('document:keydown', ['$event'])
  onKeys(ev: KeyboardEvent) {
    if (!this.bundle()) return;
    const k = ev.key.toLowerCase();
    if (k === 'e') { this.tab.set('data'); ev.preventDefault(); }
    if (k === 'x') { this.export(); ev.preventDefault(); }
    if (k === 's' && this.tab() === 'data') { /* delegate to data pane via save() if needed */ ev.preventDefault(); }
  }
}
