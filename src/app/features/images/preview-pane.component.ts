import { Component, Input, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageBundle } from '../../shared/models/image';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  standalone: true,
  selector: 'app-preview-pane',
  imports: [CommonModule, LucideAngularModule],
  template: `
  <div class="h-full p-3 flex flex-col">
    <div class="flex items-center justify-between text-xs text-gray-600 px-3 py-2 border rounded bg-white mb-2">
      <!-- Zoom controls: replace the icons with plain text -->
<div class="flex items-center gap-2">
  <button (click)="zoomOut()" class="px-2 py-1 border rounded text-lg font-bold">–</button>
  <button (click)="zoomIn()"  class="px-2 py-1 border rounded text-lg font-bold">+</button>
  <button (click)="fit()"     class="px-2 py-1 border rounded text-sm">Fit</button>
  <div class="text-sm">{{ zoom() }}%</div>
</div>

      <div>{{zoomLabel()}}</div>
    </div>
    <ng-container *ngIf="pdfSrc(); else other">
      <div class="flex-1 overflow-y-auto overflow-x-hidden">
        <embed [src]="pdfSrc()" type="application/pdf" class="w-full h-full border rounded" />
      </div>
    </ng-container>
    <ng-template #other>
      <ng-container *ngIf="isImage(bundle.image.previewUrl); else download">
        <div class="flex-1 overflow-y-auto overflow-x-hidden">
          <img [src]="bundle.image.previewUrl" alt="Preview" class="max-h-full max-w-full object-contain mx-auto block" [style.transform]="imgTransform()" style="transform-origin:center;" />
        </div>
      </ng-container>
      <ng-template #download>
        <div class="p-4 text-sm text-gray-600 border rounded bg-white">
          Preview not available for this file type.
          <a class="ml-2 text-blue-600 underline" [href]="bundle.image.previewUrl" target="_blank" rel="noopener">Open / Download</a>
        </div>
      </ng-template>
    </ng-template>
  </div>
  `
})
export class PreviewPaneComponent {
  @Input() bundle!: ImageBundle;
  zoom = signal(100);
  zoomLabel = computed(() => `${this.zoom()}%`);
  constructor(private sanitizer: DomSanitizer) { }
  isPdf(u?: string | null) { return /(\.pdf)(\?|#|$)/i.test(u || ''); }
  isImage(u?: string | null) { return /(\.png|\.jpe?g|\.gif|\.webp|\.bmp|\.svg)(\?|#|$)/i.test(u || ''); }



  pdfSrc(): SafeResourceUrl | null {
    const u = this.bundle?.image?.previewUrl ?? '';
    if (!this.isPdf(u)) {
      return null;
    }
    if (u.startsWith('/')) {
      return this.sanitizer.bypassSecurityTrustResourceUrl(u);
    }
    try {
      const url = new URL(u, window.location.origin);
      // If you want to keep same-origin restriction, add: if (url.origin !== window.location.origin) return null;
      return this.sanitizer.bypassSecurityTrustResourceUrl(url.toString());
    } catch {
      return null;
    }
  }




  imgTransform = computed(() => `scale(${this.zoom() / 100})`);
  fit() { this.zoom.set(100); }
  zoomIn() { this.zoom.update(v => Math.min(200, v + 10)); }
  zoomOut() { this.zoom.update(v => Math.max(50, v - 10)); }
}
