import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-imagelist',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './imagelist.component.html',
  styleUrls: ['./imagelist.component.sass']
})
export class ImagelistComponent implements OnInit {
  images: any[] = [];
  selectedImage: any = null;
  imageData: any = null; // Holds extracted/captured data
  loading = true;
  error = '';
  filterDate: string = '';
  showModal = false;

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.loadImages();
  }

  loadImages() {
    this.loading = true;
    let url = 'http://localhost:3000/api/images';
    if (this.filterDate) {
      url += `?date=${this.filterDate}`;
    }
    this.http.get<any[]>(url)
      .subscribe({
        next: (data) => {
          this.images = data;
          this.loading = false;
          if (data.length) this.onSelectImage(data[0]);
        },
        error: (err) => {
          this.error = 'Could not load images!';
          this.loading = false;
        }
      });
  }


  previewUrl(img: any) {
    const p = (img?.file_path || '').replace(/\\/g, '/');
    return `http://localhost:3000/${p}`;
  }
  isPdfPath(p?: string) { return /\.pdf$/i.test(p || ''); }


  onSelectImage(img: any) {
    this.selectedImage = img;
    this.selectedIndex = this.images.indexOf(img);

    this.http.get<any>(`http://localhost:3000/api/images/${img.id}`)
      .subscribe({
        next: (res) => {
          const h = typeof res.heuristic_json === 'string'
            ? (res.heuristic_json ? JSON.parse(res.heuristic_json) : null)
            : (res.heuristic_json ?? null);

          const e = typeof res.extracted_json === 'string'
            ? (res.extracted_json ? JSON.parse(res.extracted_json) : null)
            : (res.extracted_json ?? null);

          this.imageData = this.formatInvoiceData(h) || this.formatInvoiceData(e) || null;
        },
        error: () => { this.imageData = null; }
      });
  }

  formatInvoiceData(data: any): any {
    if (!data) return null;

    // accept both camelCase and PascalCase; map to template’s PascalCase
    const itemsSrc = data.items || data.Items || [];
    const Items = Array.isArray(itemsSrc) ? itemsSrc.map((x: any) => ({
      Description: x.description ?? x.Description ?? '',
      Quantity: x.qty ?? x.Quantity ?? '',
      UnitPrice: x.unitPrice ?? x.UnitPrice ?? '',
      Amount: x.amount ?? x.Amount ?? ''
    })) : [];

    return {
      InvoiceNumber: data.invoiceNumber ?? data.InvoiceNumber ?? '',
      InvoiceDate: data.invoiceDate ?? data.InvoiceDate ?? '',
      Vendor: data.vendor ?? data.Vendor ?? '',
      VendorAddress: data.vendorAddress ?? data.VendorAddress ?? '',
      Total: data.total ?? data.Total ?? '',
      Items
    };
  }



  onDateChange(event: Event) {
    this.filterDate = (event.target as HTMLInputElement).value;
    this.loadImages();
  }

  clearFilter() {
    this.filterDate = '';
    this.loadImages();
  }

  enlargeImage() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  selectedIndex = 0; // Add this to your component class and keep in sync with selectedImage

  onTableKeydown(event: KeyboardEvent) {
    if (!this.images.length) return;
    // Find current selected index (if you have selectedImage)
    let idx = this.selectedIndex;
    if (event.key === 'ArrowDown') {
      if (idx < this.images.length - 1) {
        idx++;
        this.onSelectImage(this.images[idx]);
      }
      event.preventDefault();
    } else if (event.key === 'ArrowUp') {
      if (idx > 0) {
        idx--;
        this.onSelectImage(this.images[idx]);
      }
      event.preventDefault();
    }
  }

}
