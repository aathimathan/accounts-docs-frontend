import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ImagesService } from '../images/images.service';

// Trial Balance (simplified):
// Use docType direction:
//  - invoice_customer (AR): Debit Accounts Receivable, Credit Revenue
//  - invoice_supplier (AP): Debit Expenses, Credit Accounts Payable
// Other types are ignored for now (or could be mapped later).

type TBRow = { account: string; debit: number; credit: number };
type TBItem = { id: string; filename: string; docType?: string; amount: number; side: 'debit' | 'credit' };
type TBNode = TBRow & { items: TBItem[] };

@Component({
    standalone: true,
    selector: 'app-trial-balance',
    imports: [CommonModule, RouterLink],
    template: `
  <div class="h-full grid grid-rows-[auto,1fr]">
    <div class="bg-white shadow-sm border-b px-4 py-3 flex items-center gap-3">
      <div class="text-lg font-semibold">Trial Balance</div>
      <div class="ml-auto text-sm text-gray-600">As of {{today}}</div>
    </div>

    <div class="p-4 overflow-auto bg-white">
      <!-- Totals table -->
      <table class="w-full text-sm mb-6">
        <thead class="border-b">
          <tr class="[&>th]:text-left [&>th]:px-2 [&>th]:py-2">
            <th>Account</th>
            <th class="text-right">Debit</th>
            <th class="text-right">Credit</th>
            <th class="text-right">Docs</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let n of nodes()" class="border-b [&>td]:px-2 [&>td]:py-2">
            <td>
              <button class="mr-2 px-2 py-0.5 border rounded text-xs" (click)="toggle(n.account)">{{ expanded().has(n.account) ? '−' : '+' }}</button>
              {{n.account}}
            </td>
            <td class="text-right">{{ n.debit | number:'1.2-2' }}</td>
            <td class="text-right">{{ n.credit | number:'1.2-2' }}</td>
            <td class="text-right">{{ n.items.length }}</td>
          </tr>
        </tbody>
        <tfoot *ngIf="nodes().length" class="border-t font-semibold">
          <tr class="[&>td]:px-2 [&>td]:py-2">
            <td>Total</td>
            <td class="text-right">{{ totals().debit | number:'1.2-2' }}</td>
            <td class="text-right">{{ totals().credit | number:'1.2-2' }}</td>
            <td></td>
          </tr>
        </tfoot>
      </table>

      <!-- Tree view of sources -->
      <div class="space-y-4">
        <div *ngFor="let n of nodes()" class="border rounded">
          <div class="px-3 py-2 bg-gray-50 border-b flex items-center">
            <button class="mr-2 px-2 py-0.5 border rounded text-xs" (click)="toggle(n.account)">{{ expanded().has(n.account) ? 'Hide' : 'Show' }}</button>
            <div class="font-medium">{{ n.account }}</div>
            <div class="ml-auto text-xs text-gray-600">Debit: {{ n.debit | number:'1.2-2' }} • Credit: {{ n.credit | number:'1.2-2' }}</div>
          </div>
          <div *ngIf="expanded().has(n.account)" class="p-3 overflow-x-auto">
            <table class="w-full text-xs">
              <thead class="border-b">
                <tr>
                  <th class="text-left py-1 px-2">Document</th>
                  <th class="text-left py-1 px-2">Type</th>
                  <th class="text-right py-1 px-2">Side</th>
                  <th class="text-right py-1 px-2">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let it of n.items" class="border-b">
                  <td class="py-1 px-2 truncate" [title]="it.filename">
                    <a [routerLink]="['/images']" [queryParams]="{ q: it.filename }" class="underline">{{ it.filename }}</a>
                  </td>
                  <td class="py-1 px-2">{{ it.docType || '—' }}</td>
                  <td class="py-1 px-2 text-right">{{ it.side }}</td>
                  <td class="py-1 px-2 text-right">{{ it.amount | number:'1.2-2' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div *ngIf="!nodes().length" class="text-gray-500 text-sm">No data yet.</div>
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

    // Build TB nodes with source document items (double-entry per invoice)
    nodes = computed<TBNode[]>(() => {
        const map = new Map<string, { debit: number; credit: number; items: TBItem[] }>();
        const push = (account: string, side: 'debit' | 'credit', src: any, amount: number) => {
            const node = map.get(account) || { debit: 0, credit: 0, items: [] };
            if (side === 'debit') node.debit += amount; else node.credit += amount;
            node.items.push({
                id: String(src.id || ''),
                filename: String(src.originalFilename || ''),
                docType: src.docType,
                amount,
                side
            });
            map.set(account, node);
        };

        for (const it of this.items()) {
            const amount = Number((it as any).totalAmount || 0) || 0;
            if (!amount) continue;
            const dt = String((it as any).docType || '').toLowerCase();
            if (dt === 'invoice_customer') {
                // AR (Debit) and Revenue (Credit)
                push('Accounts Receivable', 'debit', it, amount);
                push('Revenue', 'credit', it, amount);
            } else if (dt === 'invoice_supplier') {
                // Expenses (Debit) and Accounts Payable (Credit)
                push('Expenses', 'debit', it, amount);
                push('Accounts Payable', 'credit', it, amount);
            } else {
                // ignore other types for TB until mapped
            }
        }
        return Array.from(map.entries()).map(([account, v]) => ({ account, debit: v.debit, credit: v.credit, items: v.items }));
    });

    totals = computed(() => {
        let d = 0, c = 0; for (const r of this.nodes()) { d += r.debit; c += r.credit; } return { debit: d, credit: c };
    });

    // Expanded set controls the tree visibility per-account
    expanded = signal<Set<string>>(new Set());
    toggle(accName: string) {
        const next = new Set(this.expanded());
        if (next.has(accName)) next.delete(accName); else next.add(accName);
        this.expanded.set(next);
    }
}
