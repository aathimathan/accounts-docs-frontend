import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule],
  template: `
    <div class="layout">
      <aside class="sidebar">
        <div class="sidebar-title">Accounts</div>
        <nav>
          <ul>
            <li><a routerLink="/upload" routerLinkActive="active">Upload</a></li>
            <li><a routerLink="/mass-upload" routerLinkActive="active">Mass Upload</a></li>
            <li><a routerLink="/images" routerLinkActive="active">Images</a></li>
          </ul>
        </nav>
      </aside>
      <main class="main">
        <div class="card">
          <router-outlet></router-outlet>
        </div>
        <footer class="footer">
            iPower ©2025. All rights reserved.
        </footer>
      </main>
    </div>
  `
})
export class AppComponent { }
