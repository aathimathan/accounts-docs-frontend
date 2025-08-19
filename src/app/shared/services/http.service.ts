import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class HttpService {
    private http = inject(HttpClient);
    private base = '/api'; // proxy points here

    get<T>(path: string, params?: Record<string, any>): Observable<T> {
        let p = new HttpParams();
        Object.entries(params || {}).forEach(([k, v]) => {
            if (v !== undefined && v !== null && v !== '') p = p.set(k, String(v));
        });
        return this.http.get<T>(`${this.base}${path}`, { params: p });
    }

    post<T>(path: string, body: any): Observable<T> {
        return this.http.post<T>(`${this.base}${path}`, body);
    }

    patch<T>(path: string, body: any): Observable<T> {
        return this.http.patch<T>(`${this.base}${path}`, body);
    }

    delete<T>(path: string): Observable<T> {
        return this.http.delete<T>(`${this.base}${path}`);
    }
}
