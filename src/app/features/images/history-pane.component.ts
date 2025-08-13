import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuditEntry } from '../../shared/models/image';

@Component({
  standalone: true,
  selector: 'app-history-pane',
  imports: [CommonModule],
  template: `
  <div class="p-3">
    <ul class="text-sm divide-y">
      <li *ngFor="let a of audit" class="py-2">
        <div class="font-medium">{{a.action}}</div>
        <div class="text-gray-500">{{a.actor}} · {{a.at | date:'short'}}</div>
      </li>
    </ul>
  </div>
  `
})
export class HistoryPaneComponent {
  @Input() audit: AuditEntry[] = [];
}
