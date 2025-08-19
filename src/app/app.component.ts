import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import {
  Image,
  Code,
  Clock,
  Plus,
  Trash,
  Save,
  Eye,
  Send,
  FileText,
  Settings,
  UploadCloud,
  Menu
} from 'lucide-angular';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    LucideAngularModule
  ],
  template: `
  <div class="h-screen w-screen grid grid-rows-[3.5rem,1fr,1.5rem] bg-gray-50">
    <!-- Top bar -->
    <header class="h-14 bg-gray-900 text-white flex items-center px-4">
      <div class="font-semibold text-lg tracking-tight">Docs Control Room</div>
      <nav class="ml-auto hidden md:flex items-center gap-4">
        <a routerLink="/images" routerLinkActive="active" class="nav-btn">
          <i-lucide [img]="ImageIcon" class="w-5 h-5"></i-lucide>
          <span>Images</span>
        </a>
        <a routerLink="/upload" routerLinkActive="active" class="nav-btn">
          <i-lucide [img]="UploadCloudIcon" class="w-5 h-5"></i-lucide>
          <span>Upload</span>
        </a>
        <a routerLink="/accounts" routerLinkActive="active" class="nav-btn">
          <i-lucide [img]="FileTextIcon" class="w-5 h-5"></i-lucide>
          <span>Accounts</span>
        </a>
        <a routerLink="/exports" routerLinkActive="active" class="nav-btn">
          <i-lucide [img]="SendIcon" class="w-5 h-5"></i-lucide>
          <span>Exports</span>
        </a>
        <a routerLink="/qb" routerLinkActive="active" class="nav-btn">
          <i-lucide [img]="FileTextIcon" class="w-5 h-5"></i-lucide>
          <span>QuickBooks</span>
        </a>
        <a routerLink="/settings" routerLinkActive="active" class="nav-btn">
          <i-lucide [img]="SettingsIcon" class="w-5 h-5"></i-lucide>
          <span>Settings</span>
        </a>
      </nav>
      <!-- Mobile menu toggle -->
      <button class="ml-auto md:hidden p-2" (click)="open.set(!open())">
        <i-lucide [img]="MenuIcon" class="w-6 h-6"></i-lucide>
      </button>
    </header>

    <!-- Mobile dropdown -->
    <div class="md:hidden bg-gray-900 text-white" *ngIf="open()">
      <nav class="flex flex-col p-2">
        <a routerLink="/images" routerLinkActive="active" class="nav-btn--mobile" (click)="open.set(false)">Images</a>
        <a routerLink="/upload" routerLinkActive="active" class="nav-btn--mobile" (click)="open.set(false)">Upload</a>
  <a routerLink="/accounts" routerLinkActive="active" class="nav-btn--mobile" (click)="open.set(false)">Accounts</a>
        <a routerLink="/exports" routerLinkActive="active" class="nav-btn--mobile" (click)="open.set(false)">Exports</a>
        <a routerLink="/qb" routerLinkActive="active" class="nav-btn--mobile" (click)="open.set(false)">QuickBooks</a>
        <a routerLink="/settings" routerLinkActive="active" class="nav-btn--mobile" (click)="open.set(false)">Settings</a>
      </nav>
    </div>

    <main class="h-full overflow-hidden">
      <router-outlet />
    </main>
    <!-- Footer -->
    <footer class="text-center text-xs bg-white border-t flex items-center justify-center">
      © {{ currentYear }} Docs Control Room
    </footer>
  </div>
  `,
  styles: []
})
export class AppComponent {
  open = signal<boolean>(false);
  currentYear = new Date().getFullYear();
  // Icon references for [img] usage
  ImageIcon = Image;
  UploadCloudIcon = UploadCloud;
  SendIcon = Send;
  FileTextIcon = FileText;
  SettingsIcon = Settings;
  MenuIcon = Menu;
}
