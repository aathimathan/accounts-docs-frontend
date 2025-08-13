import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class HttpService {
    private http = inject(HttpClient);
    // set your base here
    private base = '/api';

    get<T>(url: string, params?: Record<string, any>) {
        let p = new HttpParams();
        Object.entries(params ?? {}).forEach(([k, v]) => { if (v !== undefined && v !== null && v !== '') p = p.set(k, v); });
        return this.http.get<T>(this.base + url, { params: p });
    }
    post<T>(url: string, body?: any) { return this.http.post<T>(this.base + url, body); }
    patch<T>(url: string, body?: any) { return this.http.patch<T>(this.base + url, body); }
}
