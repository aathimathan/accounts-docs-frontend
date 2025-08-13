import { inject, Injectable } from '@angular/core';
import { HttpService } from '../../shared/services/http.service';
import { ExportJob } from '../../shared/models/export';

@Injectable({ providedIn: 'root' })
export class ExportService {
    private http = inject(HttpService);

    createQB(imageId: string) { return this.http.post<ExportJob>('/exports/qb', { imageId }); }
    list() { return this.http.get<{ items: ExportJob[] }>('/exports'); }
}
