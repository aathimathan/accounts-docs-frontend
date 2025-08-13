import { Component, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImagesService } from './images.service';
import { ImageListComponent } from './image-list.component';
import { ImageDetailComponent } from './image-detail.component';
import { ImageRow } from '../../shared/models/image';

@Component({
    standalone: true,
    selector: 'app-images-page',
    imports: [CommonModule, ImageListComponent, ImageDetailComponent],
    template: `
  <div class="h-full grid grid-cols-[minmax(360px,520px)_1fr]">
    <app-image-list class="border-r"
      [rows]="rows()"
      [total]="total()"
      (select)="onSelect($event)"
      (filtersChange)="onFilter($event)">
    </app-image-list>

    <app-image-detail
      [imageId]="selectedId()"
      (exportQB)="exportQB($event)">
    </app-image-detail>
  </div>
  `
})
export class ImagesPageComponent {
    private api = inject(ImagesService);

    rows = signal<ImageRow[]>([]);
    total = signal(0);
    selectedId = signal<string | null>(null);
    filters = signal<{ date?: string; doc_type?: string; q?: string; status?: string; page: number; size: number }>({ page: 1, size: 50 });

    constructor() {
        effect(() => { this.fetch(); });
    }

    fetch() {
        this.api.list(this.filters()).subscribe(res => { this.rows.set(res.items); this.total.set(res.total); if (!this.selectedId() && res.items.length) this.selectedId.set(res.items[0].id); });
    }

    onSelect(id: string) { this.selectedId.set(id); }
    onFilter(f: any) { this.filters.set({ ...this.filters(), ...f, page: 1 }); }
    exportQB(imageId: string) { /* handled in detail via service; keep for future global actions */ }
}
