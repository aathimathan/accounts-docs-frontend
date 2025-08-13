import { inject, Injectable } from '@angular/core';
import { HttpService } from '../../shared/services/http.service';

@Injectable({ providedIn: 'root' })
export class QbService {
    private http = inject(HttpService);
    status() { return this.http.get<{ connected: boolean; company?: string }>('/qb/status'); }
    connect() { return this.http.get<void>('/auth/qb'); } // triggers redirect via backend
}
