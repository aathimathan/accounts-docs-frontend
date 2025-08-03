import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-imagelist',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './imagelist.component.html'
})
export class ImagelistComponent implements OnInit {
  images: any[] = [];
  loading = true;
  error = '';

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.http.get<any[]>('http://localhost:3000/api/images')
      .subscribe({
        next: (data) => {
          this.images = data;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Could not load images!';
          this.loading = false;
        }
      });
  }
}
