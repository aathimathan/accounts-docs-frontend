import { Component, signal, effect } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
  <div class="min-h-screen flex flex-col bg-gray-50 text-gray-900">
    <!-- Top App Bar -->
    <header class="h-14 bg-white border-b px-3 flex items-center gap-3">
      <div class="font-semibold tracking-tight">Docs Control Room</div>
      <div class="flex-1"></div>
      <div class="hidden md:flex items-center gap-2 text-sm mr-2">
        <span class="text-sm text-gray-600">v0.1</span>
        <button class="px-2 py-1.5 rounded hover:bg-gray-100 text-sm" aria-label="Toggle theme" (click)="toggleTheme()">☀</button>
      </div>
      <nav class="hidden md:flex items-center gap-1 text-sm">
        <a routerLink="/dashboard" routerLinkActive="bg-gray-200" [routerLinkActiveOptions]="{ exact: true }" class="px-3 py-1.5 rounded hover:bg-gray-100 flex items-center gap-2">Dashboard</a>
        <a routerLink="/images" routerLinkActive="bg-gray-200" class="px-3 py-1.5 rounded hover:bg-gray-100 flex items-center gap-2">Images</a>
        <a routerLink="/upload" routerLinkActive="bg-gray-200" class="px-3 py-1.5 rounded hover:bg-gray-100 flex items-center gap-2">Upload</a>
        <a routerLink="/exports" routerLinkActive="bg-gray-200" class="px-3 py-1.5 rounded hover:bg-gray-100 flex items-center gap-2">Exports</a>
        <a routerLink="/qb" routerLinkActive="bg-gray-200" class="px-3 py-1.5 rounded hover:bg-gray-100 flex items-center gap-2">Settings</a>
      </nav>
  <button class="md:hidden ml-1 px-2 py-1.5 rounded hover:bg-gray-100" aria-label="Open menu" (click)="toggleMobile()">☰</button>
    </header>
    <!-- Mobile Menu -->
    <div class="md:hidden border-b bg-white" [class.hidden]="!mobileOpen()">
      <nav class="px-3 py-2 flex flex-col text-sm">
        <a routerLink="/dashboard" routerLinkActive="bg-gray-100" class="flex items-center gap-2 px-2 py-2 rounded hover:bg-gray-100" (click)="closeMobile()">Dashboard</a>
        <a routerLink="/images" routerLinkActive="bg-gray-100" class="flex items-center gap-2 px-2 py-2 rounded hover:bg-gray-100" (click)="closeMobile()">Images</a>
        <a routerLink="/upload" routerLinkActive="bg-gray-100" class="flex items-center gap-2 px-2 py-2 rounded hover:bg-gray-100" (click)="closeMobile()">Upload</a>
        <a routerLink="/exports" routerLinkActive="bg-gray-100" class="flex items-center gap-2 px-2 py-2 rounded hover:bg-gray-100" (click)="closeMobile()">Exports</a>
        <a routerLink="/qb" routerLinkActive="bg-gray-100" class="flex items-center gap-2 px-2 py-2 rounded hover:bg-gray-100" (click)="closeMobile()">Settings</a>
      </nav>
    </div>

    <!-- Toasts mount point -->
    <div id="toasts" class="fixed top-3 right-3 space-y-2 z-50"></div>

    <!-- Routed Views -->
    <main class="h-[calc(100vh-3.5rem)] overflow-hidden">
      <router-outlet />
    </main>
  </div>
  `
})
export class AppComponent {
  collapsed = signal<boolean>(false); // no-op for now (legacy)
  mobileOpen = signal<boolean>(false);

  constructor() {
    const v = localStorage.getItem('sidebar.collapsed');
    this.collapsed.set(v === '1');
    effect(() => {
      localStorage.setItem('sidebar.collapsed', this.collapsed() ? '1' : '0');
    });
    // keyboard: close mobile menu on Escape
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.mobileOpen()) this.mobileOpen.set(false);
    });
  }
  toggle() { this.collapsed.update(v => !v); }
  closeMobile() { this.mobileOpen.set(false); }
  toggleTheme() {
    document.documentElement.classList.toggle('dark');
    document.body.classList.toggle('bg-gray-900');
    document.body.classList.toggle('text-gray-100');
  }
  toggleMobile() { this.mobileOpen.update(v => !v); }
}
