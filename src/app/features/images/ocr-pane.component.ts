import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-ocr-pane',
  host: { class: 'block h-full' },
  imports: [CommonModule],
  template: `
  <div class="h-full flex flex-col p-3">
    <div class="flex-1 overflow-y-auto overflow-x-hidden min-w-0">
      <pre class="bg-gray-900 text-gray-100 p-3 rounded text-xs whitespace-pre-wrap break-words">{{ ocr | json }}</pre>
    </div>
  </div>
  `
})
export class OcrPaneComponent {
  @Input() ocr: any;
}
