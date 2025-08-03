import { Component } from '@angular/core';
import { UploadComponent } from './upload/upload.component';
import { ImagelistComponent } from './imagelist/imagelist.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [UploadComponent, ImagelistComponent],
  template: `
    <div class="layout">
      <aside class="sidebar">
        <div class="sidebar-title">Accounts</div>
        <nav>
          <ul>
            <li><a href="#" class="active">Upload</a></li>
            <li><a href="#">Images</a></li>
          </ul>
        </nav>
      </aside>
      <main class="main">
        <div class="card">         
          <app-upload></app-upload>
          <h2>Uploaded Images</h2>
          <app-imagelist></app-imagelist>
        </div>
      </main>
    </div>
  `
})
export class AppComponent { }
