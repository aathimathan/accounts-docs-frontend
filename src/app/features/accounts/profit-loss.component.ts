import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImagesService } from '../images/images.service';
import { FxService } from '../../shared/services/fx.service';
import { FxSettingsModalComponent } from '../../shared/components/fx-settings-modal/fx-settings-modal.component';

// Simple Profit & Loss statement (placeholder) built from our image totals
// Replace with real account mapping logic later

@Component({
    standalone: true,
    selector: 'app-profit-loss',
    imports: [CommonModule, FxSettingsModalComponent],
    template: `
  <div class="h-full grid grid-rows-[auto,1fr]">
    <div class="bg-white shadow-sm border-b px-4 py-3 flex items-center gap-3">
    <div class="text-lg font-semibold">Profit &amp; Loss</div>
    <div class="text-sm text-gray-600">Base: {{ base() }}</div>
    <button class="ml-2 px-2 py-1 border rounded text-xs" (click)="openFx()">Change</button>
    </div>
    <div class="p-4 overflow-auto bg-white">
    <app-fx-settings-modal [open]="fxOpen" [extraCurrencies]="currenciesUsed()" (closed)="onFxClosed($event)"></app-fx-settings-modal>
      <table class="w-full text-sm">
        <thead class="border-b">
          <tr class="[&>th]:text-left [&>th]:px-2 [&>th]:py-2">
      <th>Category</th>
      <th class="text-right">Amount ({{ base() }})</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let row of rows()" class="border-b [&>td]:px-2 [&>td]:py-2">
            <td>{{ row.label }}</td>
            <td class="text-right">{{ row.amount | number:'1.2-2' }}</td>
          </tr>
        </tbody>
        <tfoot class="border-t font-semibold">
          <tr class="[&>td]:px-2 [&>td]:py-2">
            <td>Net Profit</td>
            <td class="text-right">{{ net() | number:'1.2-2' }}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  </div>
  `
})
export class ProfitLossComponent {
    private images = inject(ImagesService);
    private fx = inject(FxService);
    private items = signal<any[]>([]);
    fxOpen = signal(false);
    base = computed(() => this.fx.baseCurrency());
    currenciesUsed = computed(() => {
        const set = new Set<string>();
        for (const it of this.items()) {
            const c = (it as any).currency;
            if (c) set.add(String(c).toUpperCase());
        }
        return Array.from(set.values());
    });

    constructor() {
        this.images.list({ page: 1, size: 500 }).subscribe(({ items }) => this.items.set(items));
    }

    rows = computed(() => {
        let revenue = 0; let expense = 0;
        for (const it of this.items()) {
            const amt = Number((it as any).totalAmount || 0) || 0;
            if (!amt) continue;
            const dt = String((it as any).docType || '').toLowerCase();
            const converted = this.fx.convert(amt, (it as any).currency);
            if (dt === 'invoice_customer') revenue += converted; // AR → Revenue
            else if (dt === 'invoice_supplier') expense += converted; // AP → Expense
        }
        return [
            { label: 'Revenue', amount: revenue },
            { label: 'Expenses', amount: expense },
        ];
    });

    net = computed(() => this.rows()[0].amount - this.rows()[1].amount);

    openFx() { this.fxOpen.set(true); }
    onFxClosed(_applied: boolean) { /* recomputed via signals */ }
}
