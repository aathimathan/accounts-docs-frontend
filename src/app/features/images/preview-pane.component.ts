import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageBundle } from '../../shared/models/image';

@Component({
  standalone: true,
  selector: 'app-preview-pane',
  imports: [CommonModule],
  template: `
  <div class="p-3">
    <ng-container *ngIf="isPdf(bundle.image.previewUrl); else img">
      <embed [src]="bundle.image.previewUrl" type="application/pdf" class="w-full h-[80vh] border rounded" />
    </ng-container>
    <ng-template #img>
      <img [src]="bundle.image.previewUrl" class="max-h-[80vh] object-contain mx-auto" />
    </ng-template>
  </div>
  `
})
export class PreviewPaneComponent {
  @Input() bundle!: ImageBundle;
  isPdf(u?: string | null) { return (u || '').toLowerCase().endsWith('.pdf'); }
}
