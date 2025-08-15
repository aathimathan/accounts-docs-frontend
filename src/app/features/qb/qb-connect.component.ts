import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QbService } from './qb.service';
import { LucideAngularModule } from 'lucide-angular';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-qb-connect',
  imports: [CommonModule, LucideAngularModule, FormsModule],
  template: `
  <div class="p-6 max-w-4xl grid gap-6">
    <h2 class="text-lg font-semibold">QuickBooks Connection</h2>
    <div *ngIf="state() as s" class="p-3 border rounded bg-white">
      <div *ngIf="s.connected; else not">
        <span class="inline-flex items-center gap-2">
          <i-lucide name="check-circle" class="w-4 h-4 text-green-600"></i-lucide>
          <span>Connected to <b>{{s.company}}</b></span>
        </span>
        <div class="text-xs text-gray-500 mt-1">Environment: {{s.env || 'unknown'}}</div>
        <div class="mt-3 text-sm" *ngIf="companyInfo">
          <div class="font-medium mb-1">Company Info</div>
          <div class="grid grid-cols-2 gap-x-6 gap-y-1 max-w-2xl">
            <div class="text-gray-600">Company Name</div><div>{{companyInfo?.CompanyInfo?.CompanyName || '—'}}</div>
            <div class="text-gray-600">Legal Name</div><div>{{companyInfo?.CompanyInfo?.LegalName || '—'}}</div>
            <div class="text-gray-600">Country</div><div>{{companyInfo?.CompanyInfo?.Country || '—'}}</div>
            <div class="text-gray-600">Email</div><div>{{companyInfo?.CompanyInfo?.Email?.Address || '—'}}</div>
          </div>
        </div>
      </div>
      <ng-template #not>
        <div class="text-gray-600 mb-2">Not connected</div>
        <button class="px-3 py-1.5 rounded bg-blue-600 text-white inline-flex items-center gap-2" (click)="connect()">
          <i-lucide name="link" class="w-4 h-4"></i-lucide>
          <span>Connect</span>
        </button>
      </ng-template>
    </div>

    <div class="p-4 border rounded bg-white grid gap-3" *ngIf="state().connected">
      <div class="flex items-center justify-between">
        <h3 class="font-medium">Vendors</h3>
        <button class="px-3 py-1.5 border rounded text-sm" (click)="loadVendors()">Refresh</button>
      </div>
      <div class="flex flex-wrap gap-2 items-end">
        <label class="grid text-sm">
          <span class="text-gray-600">Search by name</span>
          <input class="border rounded px-2 py-1" [(ngModel)]="vendorName" placeholder="Acme Supplies" />
        </label>
        <button class="px-3 py-1.5 rounded bg-slate-700 text-white text-sm" (click)="findVendor()">Find</button>
        <button class="px-3 py-1.5 rounded bg-green-600 text-white text-sm" (click)="createVendor()" [disabled]="!vendorName">Create Vendor</button>
        <span class="text-sm text-red-600" *ngIf="error">{{error}}</span>
        <span class="text-sm text-gray-500" *ngIf="loading">Loading…</span>
      </div>

      <div *ngIf="vendorResult as vr" class="text-sm">
        <div class="mt-2" *ngIf="(vr?.QueryResponse?.Vendor?.length || 0) > 0; else none">
          <div class="font-medium mb-1">Match:</div>
          <div class="border rounded p-2">
            <div *ngFor="let v of vr.QueryResponse.Vendor" class="flex items-center justify-between py-1">
              <div>
                <div class="font-medium">{{v.DisplayName}}</div>
                <div class="text-xs text-gray-500">Id: {{v.Id}} • Active: {{v.Active}}</div>
              </div>
            </div>
          </div>
        </div>
        <ng-template #none>
          <div class="text-gray-600">No matching vendor found.</div>
        </ng-template>
      </div>

      <div>
        <div class="font-medium mb-1">All Vendors (first 50)</div>
        <div class="overflow-auto border rounded">
          <table class="min-w-[400px] w-full text-sm">
            <thead class="bg-gray-50 border-b">
              <tr class="[&>th]:text-left [&>th]:px-2 [&>th]:py-1">
                <th>Name</th><th>Id</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let v of vendors" class="border-b [&>td]:px-2 [&>td]:py-1">
                <td>{{v.DisplayName}}</td>
                <td>{{v.Id}}</td>
                <td>{{v.Active ? 'Active' : 'Inactive'}}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Customers panel -->
    <div class="p-4 border rounded bg-white grid gap-3" *ngIf="state().connected">
      <div class="flex items-center justify-between">
        <h3 class="font-medium">Customers</h3>
        <button class="px-3 py-1.5 border rounded text-sm" (click)="loadCustomers()">Refresh</button>
      </div>
      <div class="flex flex-wrap gap-2 items-end">
        <label class="grid text-sm">
          <span class="text-gray-600">Search by name</span>
          <input class="border rounded px-2 py-1" [(ngModel)]="customerName" placeholder="Contoso LLC" />
        </label>
        <button class="px-3 py-1.5 rounded bg-slate-700 text-white text-sm" (click)="findCustomer()">Find</button>
        <button class="px-3 py-1.5 rounded bg-green-600 text-white text-sm" (click)="createCustomer()" [disabled]="!customerName">Create Customer</button>
        <span class="text-sm text-red-600" *ngIf="custError">{{custError}}</span>
        <span class="text-sm text-gray-500" *ngIf="custLoading">Loading…</span>
      </div>

      <div *ngIf="customerResult as cr" class="text-sm">
        <div class="mt-2" *ngIf="(cr?.QueryResponse?.Customer?.length || 0) > 0; else custNone">
          <div class="font-medium mb-1">Match:</div>
          <div class="border rounded p-2">
            <div *ngFor="let c of cr.QueryResponse.Customer" class="flex items-center justify-between py-1">
              <div>
                <div class="font-medium">{{c.DisplayName}}</div>
                <div class="text-xs text-gray-500">Id: {{c.Id}} • Active: {{c.Active}}</div>
              </div>
            </div>
          </div>
        </div>
        <ng-template #custNone>
          <div class="text-gray-600">No matching customer found.</div>
        </ng-template>
      </div>

      <div>
        <div class="font-medium mb-1">All Customers (first 50)</div>
        <div class="overflow-auto border rounded">
          <table class="min-w-[400px] w-full text-sm">
            <thead class="bg-gray-50 border-b">
              <tr class="[&>th]:text-left [&>th]:px-2 [&>th]:py-1">
                <th>Name</th><th>Id</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let c of customers" class="border-b [&>td]:px-2 [&>td]:py-1">
                <td>{{c.DisplayName}}</td>
                <td>{{c.Id}}</td>
                <td>{{c.Active ? 'Active' : 'Inactive'}}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
  `
})
export class QbConnectComponent {
  private svc = inject(QbService);
  state = signal<{ connected: boolean; company?: string; env?: string }>({ connected: false });
  vendorName = '';
  vendors: any[] = [];
  vendorResult: any = null;
  loading = false;
  error = '';
  companyInfo: any = null;
  // customers
  customerName = '';
  customers: any[] = [];
  customerResult: any = null;
  custLoading = false;
  custError = '';

  constructor() { this.refresh(); this.loadVendors(); this.loadCompany(); this.loadCustomers(); }
  refresh() { this.svc.status().subscribe(s => this.state.set(s)); }
  connect() { window.location.href = '/auth/qb'; }

  loadVendors() {
    if (!this.state().connected) return;
    this.loading = true; this.error = '';
    this.svc.vendors().subscribe({
      next: (data: any) => {
        const list = data?.QueryResponse?.Vendor || [];
        this.vendors = Array.isArray(list) ? list.slice(0, 50) : [];
      },
      error: (e) => { this.error = this.extractErr(e, 'Failed to load vendors'); },
      complete: () => { this.loading = false; }
    });
  }

  findVendor() {
    if (!this.vendorName) return;
    this.loading = true; this.error = '';
    this.svc.vendorByName(this.vendorName).subscribe({
      next: (data: any) => { this.vendorResult = data; },
      error: (e) => { this.error = this.extractErr(e, 'Lookup failed'); },
      complete: () => { this.loading = false; }
    });
  }

  createVendor() {
    if (!this.vendorName) return;
    this.loading = true; this.error = '';
    const body = {
      DisplayName: this.vendorName,
      PrimaryEmailAddr: { Address: `${this.vendorName.replace(/\s+/g, '').toLowerCase()}@example.com` }
    };
    this.svc.createVendor(body).subscribe({
      next: (_: any) => { this.findVendor(); this.loadVendors(); },
      error: (e) => { this.error = this.extractErr(e, 'Create failed'); },
      complete: () => { this.loading = false; }
    });
  }

  loadCompany() {
    if (!this.state().connected) return;
    this.svc.company().subscribe({ next: (info) => this.companyInfo = info });
  }

  loadCustomers() {
    if (!this.state().connected) return;
    this.custLoading = true; this.custError = '';
    this.svc.customers().subscribe({
      next: (data: any) => {
        const list = data?.QueryResponse?.Customer || [];
        this.customers = Array.isArray(list) ? list.slice(0, 50) : [];
      },
      error: (e) => { this.custError = this.extractErr(e, 'Failed to load customers'); },
      complete: () => { this.custLoading = false; }
    });
  }

  findCustomer() {
    if (!this.customerName) return;
    this.custLoading = true; this.custError = '';
    this.svc.customerByName(this.customerName).subscribe({
      next: (data: any) => { this.customerResult = data; },
      error: (e) => { this.custError = this.extractErr(e, 'Lookup failed'); },
      complete: () => { this.custLoading = false; }
    });
  }

  createCustomer() {
    if (!this.customerName) return;
    this.custLoading = true; this.custError = '';
    const name = this.customerName.trim();
    if (!name) { this.custLoading = false; return; }
    // First check if exists to avoid duplicate-name 400s
    this.svc.customerByName(name).subscribe({
      next: (data: any) => {
        const exists = (data?.QueryResponse?.Customer || []).length > 0;
        if (exists) {
          this.customerResult = data; // show match
          this.custLoading = false;
        } else {
          const body = {
            DisplayName: name,
            PrimaryEmailAddr: { Address: `${name.replace(/\s+/g, '').toLowerCase()}@example.com` }
          };
          this.svc.createCustomer(body).subscribe({
            next: (_: any) => { this.findCustomer(); this.loadCustomers(); },
            error: (e) => { this.custError = this.extractErr(e, 'Create failed'); },
            complete: () => { this.custLoading = false; }
          });
        }
      },
      error: (e) => { this.custError = this.extractErr(e, 'Lookup failed'); this.custLoading = false; }
    });
  }

  private extractErr(e: any, fallback: string) {
    try {
      if (!e) return fallback;
      const data = e.error ?? e;
      if (typeof data === 'string') return data;
      const msg = data?.Fault?.Error?.[0]?.Message || data?.error || e?.message;
      return msg || fallback;
    } catch { return fallback; }
  }
}
