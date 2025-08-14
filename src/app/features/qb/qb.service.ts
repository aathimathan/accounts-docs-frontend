import { inject, Injectable } from '@angular/core';
import { HttpService } from '../../shared/services/http.service';

@Injectable({ providedIn: 'root' })
export class QbService {
    private http = inject(HttpService);
    // Connection
    status() { return this.http.get<{ connected: boolean; company?: string; env?: string }>('/qb/status'); }
    connect() { return this.http.get<void>('/auth/qb'); } // triggers redirect via backend

    // Company
    company() { return this.http.get<any>('/qb/company'); }

    // Vendors
    vendors() { return this.http.get<any>('/qb/vendors'); }
    vendorByName(name: string) { return this.http.get<any>('/qb/vendor', { name }); }
    createVendor(body: any) { return this.http.post<any>('/qb/vendor', body); }

    // Customers
    customers() { return this.http.get<any>('/qb/customers'); }
    customerByName(name: string) { return this.http.get<any>('/qb/customer', { name }); }
    createCustomer(body: any) { return this.http.post<any>('/qb/customer', body); }
}
