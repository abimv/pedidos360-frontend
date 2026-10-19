import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { OrdersApi } from '../../core/api/api.services';
import { Order } from '../../core/models';
import { IconComponent } from '../../core/ui/icon.component';
import { ToastService } from '../../core/ui/toast.service';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, IconComponent, RouterLink],
  template: `
    <div class="page-head">
      <div><h2>Mis órdenes</h2><p>Se actualiza automáticamente cada 5 segundos.</p></div>
      <button class="btn btn-ghost" (click)="load()"><app-icon name="refresh" [size]="16"></app-icon> Actualizar</button>
    </div>

    @if (loading()) {
      <div class="skeleton" style="height: 120px; margin-bottom: 14px"></div>
      <div class="skeleton" style="height: 120px"></div>
    } @else if (orders().length === 0) {
      <div class="card empty">
        <div class="ico"><app-icon name="box" [size]="28"></app-icon></div>
        <h3>Aún no tienes órdenes</h3><span>Cuando compres, aparecerán aquí.</span><br><br>
        <a routerLink="/catalog" class="btn btn-primary">Ir al catálogo</a>
      </div>
    } @else {
      @for (o of orders(); track o.id) {
        <article class="card card-pad" style="margin-bottom: 14px">
          <div class="row" style="justify-content: space-between">
            <div>
              <h3>Orden #{{ o.id }}</h3>
              <span class="muted">{{ o.createdAt | date:'dd/MM/yyyy HH:mm' }}</span>
            </div>
            <div class="row">
              <span class="badge green"><app-icon name="check" [size]="12"></app-icon> {{ o.status === 'CONFIRMED' ? 'Confirmada' : o.status }}</span>
              <span class="price">{{ o.total | currency:'CLP':'symbol-narrow':'1.0-0' }}</span>
            </div>
          </div>
          <div class="table-wrap" style="margin-top: 12px">
            <table class="table">
              <tbody>
                @for (i of o.items; track i.productId) {
                  <tr><td>{{ i.productName }}</td><td class="muted">x{{ i.quantity }}</td>
                    <td class="num">{{ i.unitPrice * i.quantity | currency:'CLP':'symbol-narrow':'1.0-0' }}</td></tr>
                }
              </tbody>
            </table>
          </div>
        </article>
      }
    }
  `
})
export class OrdersComponent implements OnInit, OnDestroy {
  private readonly api = inject(OrdersApi);
  private readonly toast = inject(ToastService);
  readonly orders = signal<Order[]>([]);
  readonly loading = signal(true);
  private timer?: ReturnType<typeof setInterval>;

  ngOnInit(): void {
    this.load();
    this.timer = setInterval(() => this.load(true), 5000);
  }

  ngOnDestroy(): void { if (this.timer) clearInterval(this.timer); }

  load(silent = false): void {
    this.api.mine().subscribe({
      next: list => { this.orders.set(list); this.loading.set(false); },
      error: err => { this.loading.set(false); if (!silent) this.toast.errorFrom(err, 'No se pudieron cargar las órdenes'); }
    });
  }
}
