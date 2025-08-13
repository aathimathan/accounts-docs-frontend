import { inject, Injectable } from '@angular/core';
import { HttpService } from '../../shared/services/http.service';
import { ImageBundle, ImageRow, NormalizedDoc, AuditEntry } from '../../shared/models/image';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ImagesService {
    private http = inject(HttpService);

    list(params: { date?: string; doc_type?: string; q?: string; page?: number; size?: number; status?: string }) {
        return this.http.get<any>('/images', params).pipe(
            map((res: any) => Array.isArray(res) ? ({ items: res, total: res.length }) : res)
        );
    }


    get(id: string) { return this.http.get<ImageBundle>(`/images/${id}`); }

    saveNormalized(id: string, normalized: NormalizedDoc) {
        return this.http.patch(`/images/${id}/normalized`, normalized);
    }

    // helpers
    getAudit(id: string): Observable<AuditEntry[]> {
        return this.get(id).pipe(map(b => b.audit));
    }
}
