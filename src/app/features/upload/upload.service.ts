import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class UploadService {
    private http = inject(HttpClient);
    upload(file: File) { const fd = new FormData(); fd.append('file', file); return this.http.post('/api/upload', fd, { reportProgress: true, observe: 'events' }); }
    uploadMany(files: File[]) { const fd = new FormData(); files.forEach(f => fd.append('files', f)); return this.http.post('/api/upload/bulk', fd, { reportProgress: true, observe: 'events' }); }
}
