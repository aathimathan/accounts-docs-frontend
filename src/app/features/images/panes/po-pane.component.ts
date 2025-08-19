import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ImageBundle, NormalizedDoc } from '../../../shared/models/image';
import { LucideAngularModule } from 'lucide-angular';

@Component({
    standalone: true,
    selector: 'app-po-pane',
    imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
    template: `
  <form class="grid grid-rows-[minmax(0,1fr)] gap-3" [formGroup]="form">
    <div class="min-h-0 overflow-y-auto">
      <div class="grid grid-cols-3 gap-3">
        <label class="grid gap-1">Buyer <input class="input" formControlName="buyer"></label>
        <label class="grid gap-1">PO # <input class="input" formControlName="poNumber"></label>
        <label class="grid gap-1">PO Date <input class="input" type="date" formControlName="poDate"></label>
        <label class="grid gap-1">Currency <input class="input" formControlName="currency"></label>
        <label class="grid gap-1">Total <input class="input" type="number" formControlName="total"></label>
        <label class="grid gap-1">Vendor <input class="input" formControlName="vendor"></label>
      </div>

      <div>
        <div class="font-medium mb-2">Items</div>
        <table class="w-full text-sm">
          <thead><tr class="[&>th]:text-left [&>th]:px-2 [&>th]:py-1 border-b">
            <th>Description</th><th>Qty</th><th>Unit</th><th>Amount</th><th></th>
          </tr></thead>
          <tbody formArrayName="items">
            <tr *ngFor="let g of items.controls; let i = index" [formGroupName]="i" class="border-b">
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
    </div>

    <div class="sticky bottom-0 bg-white pt-2 mt-3 border-t">
      <div class="flex gap-2">
        <button class="px-3 py-1.5 rounded bg-emerald-600 text-white inline-flex items-center gap-1" type="button" (click)="emitSave()"><i-lucide name="save" class="w-4 h-4"></i-lucide> Save</button>
        <button class="px-3 py-1.5 rounded border inline-flex items-center gap-1" type="button" (click)="viewJson.emit()"><i-lucide name="code-2" class="w-4 h-4"></i-lucide> View JSON</button>
      </div>
    </div>
  </form>
  `
})
export class PoPaneComponent {
    @Input() bundle!: ImageBundle;
    @Output() save = new EventEmitter<NormalizedDoc>();
    @Output() viewJson = new EventEmitter<void>();

    form: FormGroup;
    get items() { return this.form.get('items') as FormArray; }

    constructor(private fb: FormBuilder) {
        this.form = this.fb.group({
            buyer: [''], poNumber: [''], poDate: [''],
            total: [null], currency: [''], vendor: [''],
            items: this.fb.array([])
        });
    }

    ngOnChanges() {
        const n = (this.bundle?.normalized ?? {}) as any;
        // Map from normalized invoice-like shape to PO, if fields present
        this.form.patchValue({
            buyer: n.buyerName ?? n.customer ?? '',
            poNumber: n.poNumber ?? n.invoiceNumber ?? '',
            poDate: (n.poDate ?? n.invoiceDate ?? '').slice(0, 10),
            total: n.total ?? null,
            currency: n.currency ?? '',
            vendor: n.vendorName ?? n.vendor ?? ''
        }, { emitEvent: false });
        this.items.clear();
        const items = (n.items ?? n.lines ?? []) as any[];
        items.forEach((l: any) => this.items.push(this.fb.group({
            description: [l?.description ?? ''],
            quantity: [l?.quantity ?? null],
            unitPrice: [l?.unitPrice ?? null],
            amount: [l?.amount ?? null]
        })));
    }

    add() { this.items.push(this.fb.group({ description: [''], quantity: [null], unitPrice: [null], amount: [null] })); }
    remove(i: number) { this.items.removeAt(i); }
    emitSave() {
        const v = this.form.value as any;
        const out: NormalizedDoc = {
            vendor: v.vendor,
            invoiceNumber: v.poNumber, // reuse same field downstream
            invoiceDate: v.poDate,
            total: v.total,
            currency: v.currency,
            customer: v.buyer,
            items: v.items
        };
        this.save.emit(out);
    }
}
