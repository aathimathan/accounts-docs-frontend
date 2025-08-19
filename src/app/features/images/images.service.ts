import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs/operators';
import { HttpService } from '../../shared/services/http.service';
import { AuditEntry, ImageBundle, ImageRow, NormalizedDoc } from '../../shared/models/image';

@Injectable({ providedIn: 'root' })
export class ImagesService {
    private http = inject(HttpService);

    list(params: { date?: string; doc_type?: string; q?: string; page?: number; size?: number; status?: string }) {
        return this.http.get<{ items: ImageRow[]; total: number }>(`/images`, params);
    }

    get(id: string) {
        return this.http.get<ImageBundle>(`/images/${id}`);
    }

    saveNormalized(id: string, normalized: NormalizedDoc) {
        return this.http.patch<void>(`/images/${id}/normalized`, normalized);
    }

    reanalyze(id: string) {
        return this.http.post<ImageBundle>(`/images/${id}/reanalyze`, {});
    }

    deleteOne(id: string) {
        return this.http.delete<void>(`/images/${id}`);
    }

    deleteMany(ids: string[]) {
        return this.http.post<{ deleted: number }>(`/images/delete`, { ids });
    }
}
