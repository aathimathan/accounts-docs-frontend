import { Component, signal, effect } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule, NgClass } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, NgClass],
  template: `
  <div class="layout">
    <aside class="sidebar" [ngClass]="{ 'collapsed': collapsed() }">
      <div class="sidebar-title">Docs Control Room</div>

      <nav>
        <ul>
          <li>
            <a class="nav-link" routerLink="/dashboard" routerLinkActive="active">
              <span class="nav-icon">🏠</span><span class="nav-label">Dashboard</span>
            </a>
          </li>
          <li>
            <a class="nav-link" routerLink="/images" routerLinkActive="active">
              <span class="nav-icon">🖼️</span><span class="nav-label">Images</span>
            </a>
          </li>
          <li>
            <a class="nav-link" routerLink="/upload" routerLinkActive="active">
              <span class="nav-icon">⬆️</span><span class="nav-label">Upload</span>
            </a>
          </li>
          <li>
            <a class="nav-link" routerLink="/exports" routerLinkActive="active">
              <span class="nav-icon">📤</span><span class="nav-label">Exports</span>
            </a>
          </li>
          <li>
            <a class="nav-link" routerLink="/qb" routerLinkActive="active">
              <span class="nav-icon">🧾</span><span class="nav-label">QuickBooks</span>
            </a>
          </li>
        </ul>
      </nav>

      <button class="collapse-btn" type="button" (click)="toggle()">
        {{ collapsed() ? '▶' : '◀' }}
      </button>
    </aside>

    <main class="main">
      <router-outlet />
    </main>
  </div>
  `
})
export class AppComponent {
  collapsed = signal<boolean>(false);

  constructor() {
    const v = localStorage.getItem('sidebar.collapsed');
    this.collapsed.set(v === '1');
    effect(() => {
      localStorage.setItem('sidebar.collapsed', this.collapsed() ? '1' : '0');
    });
    // keyboard toggle: Ctrl+B
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault(); this.toggle();
      }
    });
  }
  toggle() { this.collapsed.update(v => !v); }
}
