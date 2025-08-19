import { Component, EventEmitter, Input, Output, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ImageBundle, NormalizedDoc } from '../../shared/models/image';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  standalone: true,
  selector: 'app-data-pane',
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  host: { class: 'block h-full' },
  template: `
  <!-- Two-pane split: top (editor) scrollable, bottom (JSON) fills the rest -->
  <form class="h-full p-3 grid grid-rows-[minmax(0,1fr)] gap-3" [formGroup]="form">
    <!-- Top: editor area (scrollable) -->
    <div class="min-h-0 overflow-y-auto">
      <ng-container *ngIf="isInvoiceLike(); else generic">
        <div class="grid grid-cols-3 gap-3">
          <label class="grid gap-1">Vendor <input class="input" formControlName="vendor"></label>
          <label class="grid gap-1">Invoice # <input class="input" formControlName="invoiceNumber"></label>
          <label class="grid gap-1">Date <input class="input" type="date" formControlName="invoiceDate"></label>
          <label class="grid gap-1">Currency <input class="input" formControlName="currency"></label>
          <label class="grid gap-1">Total <input class="input" type="number" formControlName="total"></label>
          <label class="grid gap-1">Customer <input class="input" formControlName="customer"></label>
        </div>

        <div>
          <div class="font-medium mb-2">Items</div>
          <table class="w-full text-sm">
            <thead><tr class="[&>th]:text-left [&>th]:px-2 [&>th]:py-1 border-b">
              <th>Description</th><th>Qty</th><th>Unit</th><th>Amount</th><th></th>
            </tr></thead>
            <tbody formArrayName="lines">
              <tr *ngFor="let g of lines.controls; let i = index" [formGroupName]="i" class="border-b">
                <td class="p-1"><input class="input w-full" formControlName="description"></td>
                <td class="p-1"><input class="input w-24" type="number" formControlName="quantity"></td>
                <td class="p-1"><input class="input w-28" type="number" formControlName="unitPrice"></td>
                <td class="p-1"><input class="input w-28" type="number" formControlName="amount"></td>
                <td class="p-1"><button type="button" class="inline-flex items-center gap-1 text-red-600" (click)="remove(i)"><i-lucide name="trash" class="w-4 h-4"></i-lucide>✕</button></td>
              </tr>
            </tbody>
          </table>
          <button class="mt-2 px-3 py-1.5 rounded border inline-flex items-center gap-1" type="button" (click)="add()"><i-lucide name="plus" class="w-4 h-4"></i-lucide> Add row</button>
        </div>
      </ng-container>

      <ng-template #generic>
        <div class="grid gap-3">
          <div class="text-sm text-gray-600">Document type: {{bundle.image.docType || 'unknown'}}</div>
          <div *ngIf="bankLike() as b">
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div><div class="text-xs text-gray-500">Account #</div><div class="font-medium">{{b.accountNumber || '-'}}
              </div></div>
              <div><div class="text-xs text-gray-500">Period</div><div class="font-medium">{{b.statementPeriod || '-'}}
              </div></div>
              <div><div class="text-xs text-gray-500">Opening</div><div class="font-medium">{{b.openingBalance ?? '-'}}
              </div></div>
              <div><div class="text-xs text-gray-500">Closing</div><div class="font-medium">{{b.closingBalance ?? '-'}}
              </div></div>
            </div>
            <div class="mt-3">
              <div class="font-medium mb-2">Transactions</div>
              <div class="overflow-auto border rounded">
                <table class="min-w-full text-xs">
                  <thead class="bg-gray-50"><tr class="[&>th]:text-left [&>th]:px-2 [&>th]:py-1 border-b">
                    <th class="w-32">Date</th><th>Description</th><th class="w-24 text-right">Debit</th><th class="w-24 text-right">Credit</th><th class="w-28 text-right">Balance</th>
                  </tr></thead>
                  <tbody>
                    <tr *ngFor="let t of (b.transactions || [])" class="border-b">
                      <td class="px-2 py-1">{{t.date || '-'}}
                      </td>
                      <td class="px-2 py-1">{{t.description}}</td>
                      <td class="px-2 py-1 text-right">{{t.debit ?? ''}}</td>
                      <td class="px-2 py-1 text-right">{{t.credit ?? ''}}</td>
                      <td class="px-2 py-1 text-right">{{t.balance ?? ''}}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </ng-template>

      <!-- Sticky actions to keep Save visible within the top scroll area -->
      <div class="sticky bottom-0 bg-white pt-2 mt-3 border-t">
        <div class="flex gap-2">
          <button class="px-3 py-1.5 rounded bg-emerald-600 text-white inline-flex items-center gap-1" type="button" (click)="emitSave()"><i-lucide name="save" class="w-4 h-4"></i-lucide> Save</button>
          <button class="px-3 py-1.5 rounded border inline-flex items-center gap-1" type="button" (click)="jsonOpen = true"><i-lucide name="code-2" class="w-4 h-4"></i-lucide> View JSON</button>
        </div>
      </div>
    </div>
  </form>

  <!-- JSON Modal -->
  <div *ngIf="jsonOpen" class="fixed inset-0">
    <div class="absolute inset-0 bg-black/40 z-40" (click)="jsonOpen = false"></div>
    <div class="relative z-50 mx-auto my-8 w-[92vw] max-w-4xl max-h-[80vh] bg-white rounded-lg shadow-lg p-4 grid grid-rows-[auto_minmax(0,1fr)_auto]">
      <div class="flex items-center justify-between">
        <div class="font-medium">Data (JSON)</div>
        <button class="p-1 rounded hover:bg-gray-100" aria-label="Close" (click)="jsonOpen = false">
          <i-lucide name="x" class="w-5 h-5"></i-lucide>
        </button>
      </div>
      <div class="min-h-0 overflow-auto mt-2">
        <div class="flex items-center justify-between text-xs text-gray-500 mb-2">
          <div>Source: normalized</div>
          <button class="px-2 py-1 border rounded" type="button" (click)="copyJson()">Copy</button>
        </div>
        <ng-container *ngIf="jsonString; else noJson">
          <pre class="text-xs p-3 bg-gray-50 border rounded whitespace-pre-wrap break-words text-gray-900 font-mono">{{ jsonString }}</pre>
        </ng-container>
        <ng-template #noJson>
          <div class="text-sm text-gray-500">No JSON available.</div>
        </ng-template>
      </div>
      <div class="mt-3 text-right">
        <button class="px-3 py-1.5 rounded border" type="button" (click)="jsonOpen = false">Close</button>
      </div>
    </div>
  </div>
  `
})
export class DataPaneComponent implements OnChanges {
  @Input() bundle!: ImageBundle;
  @Output() save = new EventEmitter<NormalizedDoc>();

  form: FormGroup;
  get lines() { return this.form.get('lines') as FormArray; }
  jsonOpen = false;
  get jsonString(): string {
    try {
      const n: any = this.bundle?.normalized;
      if (n == null) return '';
      return JSON.stringify(n, null, 2);
    } catch {
      return '';
    }
  }
  copyJson() {
    try { navigator.clipboard?.writeText(this.jsonString); } catch { }
  }

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      vendor: [''], invoiceNumber: [''], invoiceDate: [''],
      total: [null, Validators.min(0)], currency: [''], customer: [''],
      lines: this.fb.array([])
    });
  }

  ngOnChanges() {
    const n = this.bundle?.normalized ?? {};
    this.form.patchValue({
      vendor: (n as any).vendor ?? '',
      invoiceNumber: (n as any).invoiceNumber ?? '',
      invoiceDate: ((n as any).invoiceDate ?? '').slice(0, 10),
      total: (n as any).total ?? null, currency: (n as any).currency ?? '', customer: (n as any).customer ?? ''
    }, { emitEvent: false });
    this.lines.clear();
    const items = (n as any).lines ?? (n as any).items ?? [];
    (items as any[]).forEach((l: any) => this.lines.push(this.fb.group({
      description: [l?.description ?? ''],
      quantity: [l?.quantity ?? null],
      unitPrice: [l?.unitPrice ?? null],
      amount: [l?.amount ?? null]
    })));
  }

  isInvoiceLike(): boolean {
    const n = this.bundle?.normalized as any;
    return !!(n && (
      n.vendor || n.invoiceNumber || typeof n.total === 'number' ||
      (Array.isArray(n?.lines) && n.lines.length) ||
      (Array.isArray(n?.items) && n.items.length)
    ));
  }

  bankLike(): any | null {
    const dt = (this.bundle?.image?.docType || '').toLowerCase();
    const n = this.bundle?.normalized as any;
    if (dt === 'bank' && n) return n;
    if (n && Array.isArray(n.transactions)) return n;
    return null;
  }

  add() { this.lines.push(this.fb.group({ description: [''], quantity: [null], unitPrice: [null], amount: [null] })); }
  remove(i: number) { this.lines.removeAt(i); }
  emitSave() { this.save.emit(this.form.value as NormalizedDoc); }
}

