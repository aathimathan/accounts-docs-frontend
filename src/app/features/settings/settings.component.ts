import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpService } from '../../shared/services/http.service';

interface CompanyContextDto {
    names: string[];
    bankAccounts?: string[];
    poSeries?: string[];
    emailDomains?: string[];
}

@Component({
    standalone: true,
    selector: 'app-settings',
    imports: [CommonModule, FormsModule],
    template: `
  <div class="h-full w-full p-4 overflow-auto">
    <h2 class="text-lg font-semibold mb-4">Settings</h2>

    <section class="mb-8">
      <h3 class="font-medium mb-2">Our Company Names & Aliases</h3>
      <p class="text-sm text-gray-600 mb-2">Enter your legal name and any variations. One per line.</p>
      <textarea [(ngModel)]="namesText" class="w-full h-40 p-2 border rounded" placeholder="Red Mercury Sdn Bhd\nRed Mercury\nRM Sdn Bhd"></textarea>
      <div class="mt-3 flex items-center gap-2">
        <button (click)="save()" class="px-3 py-2 bg-gray-900 text-white rounded">Save</button>
        <span class="text-sm" [class.text-green-700]="saved()" [class.text-red-700]="error()">{{ status() }}</span>
      </div>
    </section>
  </div>
  `
})
export class SettingsComponent implements OnInit {
    private http = inject(HttpService);
    namesText = '';
    saved = signal(false);
    error = signal(false);
    status = signal('');

    ngOnInit(): void {
        this.http.get<CompanyContextDto>('/settings/company').subscribe({
            next: (ctx) => {
                this.namesText = (ctx?.names || []).join('\n');
            }
        });
    }

    save() {
        const names = this.namesText.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
        this.http.put<any>('/settings/company', { names }).subscribe({
            next: () => { this.saved.set(true); this.error.set(false); this.status.set('Saved'); setTimeout(() => { this.saved.set(false); this.status.set(''); }, 2000); },
            error: (e: any) => { this.error.set(true); this.saved.set(false); this.status.set(e?.error?.error || 'Save failed'); }
        });
    }
}
