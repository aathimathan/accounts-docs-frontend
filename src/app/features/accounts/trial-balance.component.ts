import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImagesService } from '../images/images.service';

// Simple Trial Balance derived from image records (example):
// Sum debits/credits from normalized data if available; otherwise zero.
// This is a placeholder structure until your actual schema is defined.

type TBRow = { account: string; debit: number; credit: number };

@Component({
  standalone: true,
  selector: 'app-trial-balance',
  imports: [CommonModule],
  template: `
  <div class="h-full grid grid-rows-[auto,1fr]">
    <div class="bg-white shadow-sm border-b px-4 py-3 flex items-center gap-3">
      <div class="text-lg font-semibold">Trial Balance</div>
      <div class="ml-auto text-sm text-gray-600">As of {{today}}</div>
    </div>

    <div class="p-4 overflow-auto bg-white">
      <table class="w-full text-sm">
        <thead class="border-b">
          <tr class="[&>th]:text-left [&>th]:px-2 [&>th]:py-2">
            <th>Account</th>
            <th class="text-right">Debit</th>
            <th class="text-right">Credit</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let r of rows()" class="border-b [&>td]:px-2 [&>td]:py-2">
            <td>{{r.account}}</td>
            <td class="text-right">{{ r.debit | number:'1.2-2' }}</td>
            <td class="text-right">{{ r.credit | number:'1.2-2' }}</td>
          </tr>
        </tbody>
        <tfoot *ngIf="rows().length" class="border-t font-semibold">
          <tr class="[&>td]:px-2 [&>td]:py-2">
            <td>Total</td>
            <td class="text-right">{{ totals().debit | number:'1.2-2' }}</td>
            <td class="text-right">{{ totals().credit | number:'1.2-2' }}</td>
          </tr>
        </tfoot>
      </table>
      <div *ngIf="!rows().length" class="text-gray-500 text-sm">No data yet.</div>
    </div>
  </div>
  `
})
export class TrialBalanceComponent {
  private images = inject(ImagesService);
  today = new Date().toISOString().slice(0, 10);

  // Placeholder: fetch first page of images and synthesize TB
  private items = signal<any[]>([]);

  constructor() {
    this.images.list({ page: 1, size: 500 }).subscribe(({ items }) => {
      this.items.set(items);
    });
  }

  // Build TB rows from available image data (replace with your actual accounting logic)
  rows = computed<TBRow[]>(() => {
    const acc = new Map<string, { debit: number; credit: number }>();
    // For now, attribute amounts to a generic revenue/expense based on docType
    for (const it of this.items()) {
      const amount = Number(it.totalAmount || 0) || 0;
      if (!amount) continue;
      const key = (String(it.docType || '').toLowerCase().includes('invoice')) ? 'Accounts Receivable' : 'Other Expense';
      const e = acc.get(key) || { debit: 0, credit: 0 };
      if (key === 'Accounts Receivable') e.debit += amount; else e.credit += amount;
      acc.set(key, e);
    }
    return Array.from(acc.entries()).map(([account, v]) => ({ account, debit: v.debit, credit: v.credit }));
  });

  totals = computed(() => {
    let d = 0, c = 0; for (const r of this.rows()) { d += r.debit; c += r.credit; } return { debit: d, credit: c };
  });
}
