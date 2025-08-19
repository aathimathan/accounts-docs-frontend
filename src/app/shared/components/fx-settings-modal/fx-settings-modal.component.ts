import { Component, EventEmitter, Input, Output, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FxService } from '../../services/fx.service';

@Component({
    standalone: true,
    selector: 'app-fx-settings-modal',
    imports: [CommonModule, FormsModule],
    template: `
<div class="fixed inset-0 z-50 flex items-center justify-center" *ngIf="open()">
  <div class="absolute inset-0 bg-black/40" (click)="cancel()"></div>
  <div class="relative bg-white rounded shadow-lg w-[640px] max-w-[95vw]">
    <div class="px-4 py-3 border-b flex items-center">
      <div class="font-semibold">Reporting Currency &amp; FX Rates</div>
      <button class="ml-auto text-sm px-2 py-1 border rounded" (click)="cancel()">Close</button>
    </div>
    <div class="p-4 space-y-4">
      <div class="flex items-center gap-3">
        <label class="text-sm text-gray-600">Base currency</label>
        <select class="border rounded px-2 py-1 text-sm" [(ngModel)]="localBase">
          <option *ngFor="let c of currencies()" [value]="c">{{c}}</option>
        </select>
      </div>

      <div>
        <div class="text-sm font-medium mb-1">Rates (USD per 1 unit)</div>
        <table class="w-full text-sm">
          <thead class="border-b">
            <tr><th class="text-left px-2 py-1">Currency</th><th class="text-right px-2 py-1">USD per 1</th></tr>
          </thead>
          <tbody>
            <tr *ngFor="let c of currencies()" class="border-b">
              <td class="px-2 py-1">{{c}}</td>
              <td class="px-2 py-1 text-right">
                <input class="border rounded px-2 py-1 w-28 text-right" type="number" step="0.0001" [ngModel]="localRates[c]" (ngModelChange)="updateRate(c, $event)" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div class="px-4 py-3 border-t flex items-center">
      <div class="text-xs text-gray-500">Tip: Conversion uses USD as pivot. Example: amount_in_base = amount * toUSD[from] / toUSD[base].</div>
      <div class="ml-auto flex items-center gap-2">
        <button class="px-3 py-1 border rounded text-sm" (click)="cancel()">Cancel</button>
        <button class="px-3 py-1 bg-blue-600 text-white rounded text-sm" (click)="apply()">Apply</button>
      </div>
    </div>
  </div>
</div>
  `
})
export class FxSettingsModalComponent {
    private fx = inject(FxService);

    @Input() open = signal(false);
    @Input() extraCurrencies: string[] = [];
    @Output() closed = new EventEmitter<boolean>();

    localBase = '';
    localRates: Record<string, number> = {};

    ngOnInit() {
        const base = this.fx.baseCurrency();
        const rates = this.fx.ratesUSD();
        this.localBase = base;
        this.localRates = { ...rates };
    }

    currencies = computed(() => this.fx.knownCurrencies(this.extraCurrencies));

    updateRate(code: string, val: any) {
        const num = Number(val);
        if (Number.isFinite(num) && num > 0) this.localRates[code] = num;
    }

    apply() {
        this.fx.setBase(this.localBase);
        this.fx.setRatesUSD(this.localRates);
        this.closed.emit(true);
        this.open.set(false);
    }

    cancel() {
        this.closed.emit(false);
        this.open.set(false);
    }
}
