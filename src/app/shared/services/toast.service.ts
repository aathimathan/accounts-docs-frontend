import { Injectable, signal } from '@angular/core';

export interface Toast { id: number; text: string; type?: 'info' | 'success' | 'error'; }
@Injectable({ providedIn: 'root' })
export class ToastService {
    toasts = signal<Toast[]>([]);
    push(text: string, type: Toast['type'] = 'info') {
        const t = { id: Date.now(), text, type };
        this.toasts.update(list => [...list, t]);
        setTimeout(() => this.dismiss(t.id), 3500);
    }
    dismiss(id: number) { this.toasts.update(list => list.filter(t => t.id !== id)); }
}
