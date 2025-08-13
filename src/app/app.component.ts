import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [RouterOutlet],
  template: `
  <div class="h-screen w-screen grid grid-rows-[auto,1fr] bg-gray-50">
    <header class="flex items-center justify-between px-4 h-12 border-b bg-white">
      <div class="font-semibold">Docs Control Room</div>
      <nav class="flex gap-3 text-sm">
        <a routerLink="/images" class="hover:underline">Images</a>
        <a routerLink="/upload" class="hover:underline">Upload</a>
        <a routerLink="/exports" class="hover:underline">Exports</a>
        <a routerLink="/qb" class="hover:underline">QuickBooks</a>
      </nav>
    </header>
    <router-outlet />
  </div>
  `
})
export class AppComponent { }
