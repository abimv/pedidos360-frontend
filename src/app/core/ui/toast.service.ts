import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  type: 'success' | 'error' | 'info';
  text: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly toasts = signal<Toast[]>([]);
  private nextId = 1;

  success(text: string): void { this.push('success', text); }
  error(text: string): void { this.push('error', text); }
  info(text: string): void { this.push('info', text); }

  /** Extrae un mensaje legible de un HttpErrorResponse. */
  errorFrom(err: any, fallback = 'Ocurrió un error inesperado'): void {
    if (err?.status === 0) { this.error('No hay conexión con el servidor (revisa CORS / API Gateway).'); return; }
    if (err?.status === 401) { this.error('Sesión no autorizada (401). Vuelve a iniciar sesión.'); return; }
    if (err?.status === 403) { this.error('No tienes permisos para esta acción (403).'); return; }
    const details = err?.error?.details ? Object.values(err.error.details).join(' · ') : '';
    this.error(details || err?.error?.message || fallback);
  }

  dismiss(id: number): void {
    this.toasts.update(list => list.filter(t => t.id !== id));
  }

  private push(type: Toast['type'], text: string): void {
    const id = this.nextId++;
    this.toasts.update(list => [...list, { id, type, text }]);
    setTimeout(() => this.dismiss(id), 5000);
  }
}
