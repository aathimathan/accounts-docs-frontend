import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { LUCIDE_ICONS, LucideIconProvider, Image, UploadCloud, Send, FileText, Settings, Menu, RefreshCcw, Loader, CheckCircle, AlertTriangle, Eye, Edit3, Code, Code2, Clock, Trash, Plus, Save, Maximize2, ZoomIn, ZoomOut, Link, X } from 'lucide-angular';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideHttpClient(),
    {
      provide: LUCIDE_ICONS, multi: true, useValue: new LucideIconProvider({
        Image, UploadCloud, Send, FileText, Settings, Menu, RefreshCcw, Loader, CheckCircle, AlertTriangle, Eye, Edit3, Code, Code2, Clock, Trash, Plus, Save, Maximize2, ZoomIn, ZoomOut, Link, X
      })
    }
  ]
};
