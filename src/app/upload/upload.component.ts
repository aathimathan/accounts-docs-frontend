import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './upload.component.html'
})
export class UploadComponent {
  selectedFile: File | null = null;
  uploadMessage = '';

  constructor(private http: HttpClient) { }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      this.selectedFile = input.files[0];
    }
  }

  onUpload(event: Event) {
    event.preventDefault();
    if (!this.selectedFile) return;

    const formData = new FormData();
    formData.append('image', this.selectedFile);

    this.http.post<any>('http://localhost:3000/api/images/upload', formData)
      .subscribe({
        next: (res: any) => { // <-- typed!
          this.uploadMessage = 'Upload successful! Image ID: ' + res.imageId;
          this.selectedFile = null;
        },
        error: () => {
          this.uploadMessage = 'Upload failed!';
        }
      });
  }
}
