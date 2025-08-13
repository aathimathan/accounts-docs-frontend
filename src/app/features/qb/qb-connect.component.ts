import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QbService } from './qb.service';

@Component({
  standalone: true,
  selector: 'app-qb-connect',
  imports: [CommonModule],
  template: `
  <div class="p-6 max-w-xl grid gap-3">
    <h2 class="text-lg font-semibold">QuickBooks Connection</h2>
    <div *ngIf="state() as s" class="p-3 border rounded bg-white">
      <div *ngIf="s.connected; else not">
        Connected to <b>{{s.company}}</b>
      </div>
      <ng-template #not>
        <div class="text-gray-600 mb-2">Not connected</div>
        <button class="px-3 py-1.5 rounded bg-blue-600 text-white" (click)="connect()">Connect</button>
      </ng-template>
    </div>
  </div>
  `
})
export class QbConnectComponent {
  private svc = inject(QbService);
  state = signal<{ connected: boolean; company?: string }>({ connected: false });
  constructor() { this.refresh(); }
  refresh() { this.svc.status().subscribe(s => this.state.set(s)); }
  connect() { window.location.href = '/auth/qb'; }
}
