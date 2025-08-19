import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-ocr-pane',
  host: { class: 'block h-full w-full min-w-0 min-h-0' },
  imports: [CommonModule],
  template: `
    <!-- Fill all available space and scroll inside -->
    <div class="h-full w-full min-w-0 min-h-0 overflow-auto bg-gray-900 text-gray-100 rounded">
      <pre class="whitespace-pre font-mono text-xs p-3">
{{ ocr | json }}
      </pre>
    </div>
  `
})
export class OcrPaneComponent {
  @Input() ocr: any;
}