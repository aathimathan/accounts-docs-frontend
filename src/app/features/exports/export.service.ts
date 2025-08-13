import { inject, Injectable } from '@angular/core';
import { HttpService } from '../../shared/services/http.service';
import { ExportJob } from '../../shared/models/export';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ExportService {
    private http = inject(HttpService);

    createQB(imageId: string) {
        return this.http.post<{ jobId: string }>('/exports/qb', { imageId });
    }

    // add this bulk method to remove the compile error
    bulkQB(imageIds: string[]) {
        // call your bulk endpoint; adjust the type if needed
        return this.http.post<{ jobs: { jobId: number; imageId: number }[] }>(
            '/exports/qb/bulk',
            { imageIds }
        );
    }


    list(): Observable<{ items: ExportJob[] }> {
        return this.http.get<{ items: ExportJob[] }>('/exports');
    }
}
