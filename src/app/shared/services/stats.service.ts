import { inject, Injectable } from '@angular/core';
import { HttpService } from './http.service';

@Injectable({ providedIn: 'root' })
export class StatsService {
    private http = inject(HttpService);
    get() { return this.http.get<{ totals: any; recentImages: any[]; recentExports: any[] }>(`/stats`); }
}
