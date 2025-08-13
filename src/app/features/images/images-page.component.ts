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
  <div class="h-full overflow-hidden grid grid-cols-[minmax(360px,520px)_1fr]">
    <app-image-list class="border-r"
      [rows]="rows()"
      [total]="total()"
      (select)="onSelect($event)"
      (filtersChange)="onFilter($event)">
    </app-image-list>

    <app-image-detail
      [imageId]="selectedId()"
      (exportQB)="onExport($event)">
    </app-image-detail>
  </div>
  `
})
export class ImagesPageComponent {
  private api = inject(ImagesService);

  rows = signal<ImageRow[]>([]);
  total = signal<number>(0);
  selectedId = signal<string | null>(null);

  // basic filters
  params = signal<{ date?: string; doc_type?: string; q?: string; status?: string; page: number; size: number }>({
    page: 1, size: 50
  });

  constructor() {
    // load whenever filters change
    effect(() => {
      const p = this.params();
      this.api.list(p).subscribe(({ items, total }) => {
        this.rows.set(items);
        this.total.set(total);
        // auto-select first row if none selected
        if (!this.selectedId() && items.length) this.selectedId.set(items[0].id);
      });
    });
  }

  onFilter(patch: any) {
    this.params.update(s => ({ ...s, page: 1, ...patch }));
  }

  onSelect(id: string) {
    this.selectedId.set(id);
  }

  onExport(_: string) {
    // optional: refresh export state or show toast
  }
}
