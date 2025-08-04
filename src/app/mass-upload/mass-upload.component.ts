import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-mass-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mass-upload.component.html'
})
export class MassUploadComponent {
  selectedFiles: File[] = [];
  uploadStatus: string[] = [];
  isUploading = false;

  constructor(private http: HttpClient) { }

  onFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    this.selectedFiles = [];
    this.uploadStatus = [];
    if (input.files) {
      for (let i = 0; i < input.files.length; i++) {
        this.selectedFiles.push(input.files[i]);
      }
    }
  }

  onUploadAll(event: Event) {
    event.preventDefault();
    if (!this.selectedFiles.length) return;
    this.isUploading = true;
    this.uploadStatus = Array(this.selectedFiles.length).fill('Pending');

    this.selectedFiles.forEach((file, idx) => {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('relativePath', (file as any).webkitRelativePath || file.name);

      this.http.post<any>('http://localhost:3000/api/images/upload', formData)
        .subscribe({
          next: (res) => {
            this.uploadStatus[idx] = `Success: Image ID ${res.imageId}`;
          },
          error: () => {
            this.uploadStatus[idx] = 'Failed';
          }
        });
    });

    this.isUploading = false;
  }
}
