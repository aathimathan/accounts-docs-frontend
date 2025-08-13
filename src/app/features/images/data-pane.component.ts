import { Component, EventEmitter, Input, Output, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ImageBundle, NormalizedDoc } from '../../shared/models/image';

@Component({
  standalone: true,
  selector: 'app-data-pane',
  imports: [CommonModule, ReactiveFormsModule],
  template: `
  <form class="p-3 grid gap-3 max-w-4xl" [formGroup]="form">
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
    (n.lines ?? []).forEach((l: any) => this.lines.push(this.fb.group({
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
