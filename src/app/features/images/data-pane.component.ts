import { Component, EventEmitter, Input, Output, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ImageBundle, NormalizedDoc } from '../../shared/models/image';

@Component({
  standalone: true,
  selector: 'app-data-pane',
  imports: [CommonModule, ReactiveFormsModule],
  host: { class: 'block h-full' },
  template: `
  <form class="h-full p-3 grid content-start gap-3 max-w-5xl" [formGroup]="form">
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
              <td class="p-1"><button type="button" (click)="remove(i)">✕</button></td>
            </tr>
          </tbody>
        </table>
        <button class="mt-2 px-3 py-1.5 rounded border" type="button" (click)="add()">Add row</button>
      </div>

      <!-- Raw view (fallback/diagnostic) -->
      <div class="mt-4">
        <div class="h-[50vh] min-w-0 overflow-y-auto overflow-x-hidden">
          <pre class="text-xs p-3 bg-gray-50 border rounded whitespace-pre-wrap break-words">{{ bundle.normalized | json }}</pre>
        </div>
      </div>
    </ng-container>

    <ng-template #generic>
      <div class="grid gap-3">
  <div class="text-sm text-gray-600">Document type: {{bundle.image.docType || 'unknown'}}</div>
        <div *ngIf="bankLike() as b">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div><div class="text-xs text-gray-500">Account #</div><div class="font-medium">{{b.accountNumber || '-'}}</div></div>
            <div><div class="text-xs text-gray-500">Period</div><div class="font-medium">{{b.statementPeriod || '-'}}</div></div>
            <div><div class="text-xs text-gray-500">Opening</div><div class="font-medium">{{b.openingBalance ?? '-'}}</div></div>
            <div><div class="text-xs text-gray-500">Closing</div><div class="font-medium">{{b.closingBalance ?? '-'}}</div></div>
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
                    <td class="px-2 py-1">{{t.date || '-'}}</td>
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
        <div *ngIf="!bankLike()">
          <div class="font-medium mb-2">Data</div>
          <div class="h-[50vh] min-w-0 overflow-y-auto overflow-x-hidden">
            <pre class="text-xs p-3 bg-gray-50 border rounded whitespace-pre-wrap break-words">{{ bundle.normalized | json }}</pre>
          </div>
        </div>
      </div>
    </ng-template>

    <div class="flex gap-2">
      <button class="px-3 py-1.5 rounded bg-emerald-600 text-white" type="button" (click)="emitSave()">Save</button>
    </div>
  </form>
  `
})
export class DataPaneComponent implements OnChanges {
  @Input() bundle!: ImageBundle;
  @Output() save = new EventEmitter<NormalizedDoc>();

  form: FormGroup;
  get lines() { return this.form.get('lines') as FormArray; }

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
      vendor: n.vendor ?? '',
      invoiceNumber: n.invoiceNumber ?? '',
      invoiceDate: (n.invoiceDate ?? '').slice(0, 10),
      total: n.total ?? null, currency: n.currency ?? '', customer: n.customer ?? ''
    }, { emitEvent: false });
    this.lines.clear();
    // accept either `lines` (our newer shape) or `items` (heuristics shape)
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
    // Only treat as invoice-like when normalized data actually contains invoice-ish fields
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
    // also treat as bank-like if it has transactions array
    if (n && Array.isArray(n.transactions)) return n;
    return null;
  }

  add() { this.lines.push(this.fb.group({ description: [''], quantity: [null], unitPrice: [null], amount: [null] })); }
  remove(i: number) { this.lines.removeAt(i); }
  emitSave() { this.save.emit(this.form.value as NormalizedDoc); }
}
