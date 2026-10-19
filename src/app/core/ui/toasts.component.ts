import { Component, inject } from '@angular/core';
import { ToastService } from './toast.service';
import { IconComponent } from './icon.component';

@Component({
  selector: 'app-toasts',
  standalone: true,
  imports: [IconComponent],
  template: `
    <div class="toast-stack">
      @for (t of toast.toasts(); track t.id) {
        <div class="toast" [class]="'toast ' + t.type" (click)="toast.dismiss(t.id)">
          <app-icon [name]="t.type === 'success' ? 'check' : t.type === 'error' ? 'x' : 'bolt'" [size]="16"></app-icon>
          <span>{{ t.text }}</span>
        </div>
      }
    </div>
  `
})
export class ToastsComponent {
  readonly toast = inject(ToastService);
}
