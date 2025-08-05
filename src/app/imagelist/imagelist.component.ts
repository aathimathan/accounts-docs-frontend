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

  onSelectImage(img: any) {
    this.selectedImage = img;
    this.selectedIndex = this.images.indexOf(img);
    // Fetch extracted data for image
    this.http.get<any>(`http://localhost:3000/api/images/${img.id}`)
      .subscribe({
        next: (res) => {
          //this.imageData = res.extracted_json || null;
          this.imageData = this.formatInvoiceData(JSON.parse(res.extracted_json || null));
          //alert(JSON.stringify(res.extracted_json));
        },
        error: () => {
          this.imageData = null;
        }
      });
  }


  formatInvoiceData(data: any): any {
    if (!data || !data.OCR || !data.OCR.analyzeResult) return null;
    const doc = data.OCR.analyzeResult.documents?.[0]?.fields || {};

    // Extract fields
    return {
      InvoiceNumber: doc.InvoiceId?.valueString ?? '',
      InvoiceDate: doc.InvoiceDate?.valueDate ?? '',
      Vendor: doc.VendorName?.valueString ?? '',
      VendorAddress: doc.VendorAddress?.content ?? '',
      Total: doc.InvoiceTotal?.valueCurrency?.amount ?? '',
      Items: (doc.Items?.valueArray ?? []).map((item: any) => ({
        Description: item.valueObject?.Description?.valueString ?? '',
        Quantity: item.valueObject?.Quantity?.valueNumber ?? '',
        UnitPrice: item.valueObject?.UnitPrice?.valueCurrency?.amount ?? '',
        Amount: item.valueObject?.Amount?.valueCurrency?.amount ?? ''
      }))
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
