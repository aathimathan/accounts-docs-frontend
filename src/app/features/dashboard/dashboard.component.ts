import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    standalone: true,
    selector: 'app-dashboard',
    imports: [CommonModule],
    template: `
    <div class="p-4 grid gap-3">
      <h2 class="text-lg font-semibold">Dashboard</h2>
      <div class="grid md:grid-cols-4 gap-3">
        <div class="p-4 border rounded bg-white">New Today: 0</div>
        <div class="p-4 border rounded bg-white">Needs Review: 0</div>
        <div class="p-4 border rounded bg-white">Exported (24h): 0</div>
        <div class="p-4 border rounded bg-white">Failed: 0</div>
      </div>
    </div>
  `
})
export class DashboardComponent { }
