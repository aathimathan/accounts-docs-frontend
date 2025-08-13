import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
@Component({
    standalone: true,
    selector: 'app-tag-chip',
    imports: [CommonModule],
    template: `<span class="px-2 py-0.5 rounded-full text-xs" [ngClass]="cls">{{text}}</span>`
})
export class TagChipComponent {
    @Input() text = '';
    @Input() tone: 'gray' | 'blue' | 'red' | 'green' = 'gray';
    get cls() {
        return {
            'bg-gray-100 text-gray-700': this.tone === 'gray',
            'bg-blue-100 text-blue-700': this.tone === 'blue',
            'bg-red-100 text-red-700': this.tone === 'red',
            'bg-emerald-100 text-emerald-700': this.tone === 'green',
        };
    }
}
