import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet, RouterLinkActive } from '@angular/router';

@Component({
    standalone: true,
    selector: 'app-accounts',
    imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
    template: `
  <div class="h-full grid grid-rows-[auto,auto,1fr]">
    <div class="bg-white shadow-sm border-b px-4 py-3 flex items-center gap-3">
      <div class="text-lg font-semibold">Accounts</div>
    </div>

    <div class="bg-white border-b px-4 py-2 flex items-center gap-2">
      <a routerLink="trial-balance" routerLinkActive="active" class="px-3 py-1.5 border rounded text-sm">Trial Balance</a>
      <a routerLink="profit-loss" routerLinkActive="active" class="px-3 py-1.5 border rounded text-sm">Profit &amp; Loss</a>
    </div>

    <div class="h-full overflow-auto">
      <router-outlet />
    </div>
  </div>
  `
})
export class AccountsComponent { }
