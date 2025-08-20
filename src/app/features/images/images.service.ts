import { Injectable, inject } from '@angular/core';
import { map, catchError } from 'rxjs/operators';
import { forkJoin, of, throwError } from 'rxjs';
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
        // Prefer backend bulk endpoint; if missing (404), fall back to individual deletes
        return this.http.post<{ deleted: number }>(`/images/delete`, { ids }).pipe(
            catchError(err => {
                if (err?.status === 404) {
                    if (!ids?.length) return of({ deleted: 0 });
                    return forkJoin(
                        ids.map(id => this.deleteOne(id).pipe(
                            map(() => 1),
                            catchError(() => of(0))
                        ))
                    ).pipe(
                        map(results => ({ deleted: results.reduce((a, b) => a + b, 0) }))
                    );
                }
                return throwError(() => err);
            })
        );
    }
}
