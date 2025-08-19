import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UploadService {
    private http = inject(HttpClient);

    // Single-file upload with progress events
    upload(file: File): Observable<HttpEvent<any>> {
        const fd = new FormData();
        fd.append('file', file, file.name);  // include filename
        return this.http.post<any>('/api/upload', fd, {
            reportProgress: true,
            observe: 'events' as const,
            // withCredentials: true, // uncomment if your API uses cookies
        });
    }

    // Bulk upload (server must accept multiple files on this field)
    uploadMany(files: File[]): Observable<HttpEvent<any>> {
        const fd = new FormData();
        // Use the exact field name your backend expects, e.g. 'files' or 'files[]'
        for (const f of files) fd.append('files', f, f.name);
        return this.http.post<any>('/api/upload/bulk', fd, {
            reportProgress: true,
            observe: 'events' as const,
            // withCredentials: true,
        });
    }
}
