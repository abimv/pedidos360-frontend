import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { AuditApi } from '../../core/api/api.services';
import { AuditLog } from '../../core/models';
import { IconComponent } from '../../core/ui/icon.component';
import { ToastService } from '../../core/ui/toast.service';

@Component({
  selector: 'app-audit',
  standalone: true,
  imports: [DatePipe, IconComponent],
  template: `
    <div class="page-head">
      <div><h2>Auditoría de eventos</h2><p>Microservicio propio: registra todo lo que circula por RabbitMQ (routing key <span class="mono">#</span>).</p></div>
      <button class="btn btn-ghost" (click)="load()"><app-icon name="refresh" [size]="16"></app-icon> Actualizar</button>
    </div>

    <div class="row" style="margin-bottom: 18px">
      @for (s of statList(); track s[0]) {
        <div class="card card-pad" style="min-width: 190px">
          <span class="badge indigo mono">{{ s[0] }}</span>
          <div class="price" style="margin-top: 8px">{{ s[1] }}</div>
          <span class="muted">eventos</span>
        </div>
      }
    </div>

    <div class="card table-wrap">
      <table class="table">
        <thead><tr><th>#</th><th>Fecha</th><th>Evento</th><th>Contenido</th></tr></thead>
        <tbody>
          @for (l of logs(); track l.id) {
            <tr>
              <td class="mono">{{ l.id }}</td>
              <td>{{ l.receivedAt | date:'dd/MM HH:mm:ss' }}</td>
              <td><span class="badge indigo mono">{{ l.routingKey }}</span></td>
              <td class="mono muted" style="max-width: 520px; word-break: break-all">{{ short(l.payload) }}</td>
            </tr>
          } @empty {
            <tr><td colspan="4" class="muted" style="text-align: center; padding: 40px">Aún no hay eventos registrados. Realiza una compra para generarlos.</td></tr>
          }
        </tbody>
      </table>
    </div>
  `
})
export class AuditComponent implements OnInit, OnDestroy {
  private readonly api = inject(AuditApi);
  private readonly toast = inject(ToastService);
  readonly logs = signal<AuditLog[]>([]);
  readonly statList = signal<[string, number][]>([]);
  private timer?: ReturnType<typeof setInterval>;

  ngOnInit(): void {
    this.load();
    this.timer = setInterval(() => this.load(true), 5000);
  }

  ngOnDestroy(): void { if (this.timer) clearInterval(this.timer); }

  load(silent = false): void {
    this.api.latest(50).subscribe({
      next: list => this.logs.set(list),
      error: err => { if (!silent) this.toast.errorFrom(err, 'No se pudo cargar la auditoría'); }
    });
    this.api.stats().subscribe({
      next: s => this.statList.set(Object.entries(s)),
      error: () => undefined
    });
  }

  short(payload: string): string {
    return payload.length > 220 ? payload.slice(0, 220) + '…' : payload;
  }
}
