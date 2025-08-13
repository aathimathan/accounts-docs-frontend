import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QbService } from './qb.service';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  standalone: true,
  selector: 'app-qb-connect',
  imports: [CommonModule, LucideAngularModule],
  template: `
  <div class="p-6 max-w-xl grid gap-3">
    <h2 class="text-lg font-semibold">QuickBooks Connection</h2>
    <div *ngIf="state() as s" class="p-3 border rounded bg-white">
      <div *ngIf="s.connected; else not">
        <span class="inline-flex items-center gap-2">
          <i-lucide name="check-circle" class="w-4 h-4 text-green-600"></i-lucide>
          <span>Connected to <b>{{s.company}}</b></span>
        </span>
      </div>
      <ng-template #not>
        <div class="text-gray-600 mb-2">Not connected</div>
        <button class="px-3 py-1.5 rounded bg-blue-600 text-white inline-flex items-center gap-2" (click)="connect()">
          <i-lucide name="link" class="w-4 h-4"></i-lucide>
          <span>Connect</span>
        </button>
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
