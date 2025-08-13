import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    standalone: true,
    selector: 'app-ocr-pane',
    imports: [CommonModule],
    template: `
  <div class="p-3">
    <pre class="bg-gray-900 text-gray-100 p-3 rounded overflow-auto text-xs">{{ ocr | json }}</pre>
  </div>
  `
})
export class OcrPaneComponent {
    @Input() ocr: any;
}
