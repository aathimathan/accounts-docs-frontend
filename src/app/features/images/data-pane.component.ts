import { Component, EventEmitter, Input, Output, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ImageBundle, NormalizedDoc } from '../../shared/models/image';
import { LucideAngularModule } from 'lucide-angular';
import { InvoicePaneComponent } from './panes/invoice-pane.component';
import { PoPaneComponent } from './panes/po-pane.component';

@Component({
  standalone: true,
  selector: 'app-data-pane',
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule, InvoicePaneComponent, PoPaneComponent],
  host: { class: 'block h-full' },
  template: `
  <!-- Two-pane split: top (editor) scrollable, bottom (JSON) fills the rest -->
  <div class="h-full p-3 grid grid-rows-[minmax(0,1fr)] gap-3">
    <!-- Top: editor area (scrollable) -->
    <div class="min-h-0 overflow-y-auto">
      <ng-container [ngSwitch]="paneKind()">
        <app-invoice-pane *ngSwitchCase="'invoice'" [bundle]="bundle" (save)="forwardSave($event)" (viewJson)="jsonOpen = true" />
        <app-po-pane *ngSwitchCase="'po'" [bundle]="bundle" (save)="forwardSave($event)" (viewJson)="jsonOpen = true" />
        <ng-container *ngSwitchDefault>
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
          <div class="sticky bottom-0 bg-white pt-2 mt-3 border-t">
            <div class="flex gap-2">
              <button class="px-3 py-1.5 rounded border inline-flex items-center gap-1" type="button" (click)="jsonOpen = true"><i-lucide name="code-2" class="w-4 h-4"></i-lucide> View JSON</button>
            </div>
          </div>
        </ng-container>
      </ng-container>
    </div>
  </div>

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

  paneKind(): 'invoice' | 'po' | 'generic' {
    const dt = (this.bundle?.image?.docType || '').toLowerCase();
    if (dt.includes('po') || dt.includes('purchase')) return 'po';
    if (dt === 'invoice_supplier' || dt === 'invoice_customer') return 'invoice';
    const n = this.bundle?.normalized as any;
    const looksInvoice = !!(n && (
      n.vendor || n.invoiceNumber || typeof n.total === 'number' ||
      (Array.isArray(n?.lines) && n.lines.length) ||
      (Array.isArray(n?.items) && n.items.length)
    ));
    return looksInvoice ? 'invoice' : 'generic';
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
  forwardSave(n: NormalizedDoc) { this.save.emit(n); }
}

