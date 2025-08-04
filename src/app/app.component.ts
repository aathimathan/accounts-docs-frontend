import { Component } from '@angular/core';
import { UploadComponent } from './upload/upload.component';
import { ImagelistComponent } from './imagelist/imagelist.component';
import { MassUploadComponent } from './mass-upload/mass-upload.component'; // import this
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, UploadComponent, ImagelistComponent, MassUploadComponent],
  template: `
    <div class="layout">
      <aside class="sidebar">
        <div class="sidebar-title">Accounts</div>
        <nav>
          <ul>
            <li><a href="#" [class.active]="activeTab==='upload'" (click)="setTab('upload')">Upload</a></li>
            <li><a href="#" [class.active]="activeTab==='mass-upload'" (click)="setTab('mass-upload')">Mass Upload</a></li>
            <li><a href="#" [class.active]="activeTab==='images'" (click)="setTab('images')">Images</a></li>
          </ul>
        </nav>
      </aside>
      <main class="main">
        <div class="card">
          <app-upload *ngIf="activeTab==='upload'"></app-upload>
          <app-mass-upload *ngIf="activeTab==='mass-upload'"></app-mass-upload>
          <ng-container *ngIf="activeTab==='images'">
            <h2>Uploaded Images</h2>
            <app-imagelist></app-imagelist>
          </ng-container>
        </div>
      </main>
    </div>
  `
})
export class AppComponent {
  activeTab: string = 'upload';

  setTab(tab: string) {
    this.activeTab = tab;
  }
}
