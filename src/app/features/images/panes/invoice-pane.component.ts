import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ImageBundle, NormalizedDoc } from '../../../shared/models/image';
import { LucideAngularModule } from 'lucide-angular';

@Component({
    standalone: true,
    selector: 'app-invoice-pane',
    imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
    template: `
  <form class="grid grid-rows-[minmax(0,1fr)] gap-3" [formGroup]="form">
    <div class="min-h-0 overflow-y-auto">
      <div class="grid grid-cols-3 gap-3">
        <label class="grid gap-1">Supplier <input class="input" formControlName="vendor"></label>
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
export class InvoicePaneComponent {
    @Input() bundle!: ImageBundle;
    @Output() save = new EventEmitter<NormalizedDoc>();
    @Output() viewJson = new EventEmitter<void>();

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
        const n = this.bundle?.normalized ?? {} as any;
        const dir = (n as any).direction as ('supplier' | 'customer' | undefined);
        const billTo: string = (n as any).billTo ?? '';
        const billToFirst = billTo ? String(billTo).split('\n')[0].trim() : '';
        const counterparty: string = (n as any).counterparty ?? '';
        const supplierName = (n as any).vendor ?? '';
        const customerName = dir === 'customer'
            ? (counterparty || billToFirst || '')
            : (billToFirst || '');

        this.form.patchValue({
            vendor: supplierName,
            invoiceNumber: (n as any).invoiceNumber ?? '',
            invoiceDate: ((n as any).invoiceDate ?? '').slice(0, 10),
            total: (n as any).total ?? null,
            currency: (n as any).currency ?? '',
            customer: (n as any).customer ?? customerName
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

    add() { this.lines.push(this.fb.group({ description: [''], quantity: [null], unitPrice: [null], amount: [null] })); }
    remove(i: number) { this.lines.removeAt(i); }
    emitSave() { this.save.emit(this.form.value as NormalizedDoc); }
}
