import { CurrencyPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CartApi } from '../../core/api/api.services';
import { CartStore } from '../../core/cart.store';
import { CartItem } from '../../core/models';
import { IconComponent } from '../../core/ui/icon.component';
import { ToastService } from '../../core/ui/toast.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CurrencyPipe, IconComponent, RouterLink],
  template: `
    <div class="page-head">
      <div><h2>Tu carrito</h2><p>Revisa tus productos antes de finalizar la compra.</p></div>
    </div>

    @if (store.cart().items.length === 0) {
      <div class="card empty">
        <div class="ico"><app-icon name="cart" [size]="28"></app-icon></div>
        <h3>Tu carrito está vacío</h3>
        <span>Agrega productos desde el catálogo.</span><br><br>
        <a routerLink="/catalog" class="btn btn-primary">Ir al catálogo</a>
      </div>
    } @else {
      <div class="two-col">
        <div class="card table-wrap">
          <table class="table">
            <thead><tr><th>Producto</th><th>Cantidad</th><th class="num">Subtotal</th><th></th></tr></thead>
            <tbody>
              @for (i of store.cart().items; track i.productId) {
                <tr>
                  <td><strong>{{ i.productName }}</strong><br><span class="muted">{{ i.unitPrice | currency:'CLP':'symbol-narrow':'1.0-0' }} c/u</span></td>
                  <td>
                    <div class="qty">
                      <button [disabled]="busy() || i.quantity <= 1" (click)="change(i, i.quantity - 1)"><app-icon name="minus" [size]="14"></app-icon></button>
                      <span>{{ i.quantity }}</span>
                      <button [disabled]="busy()" (click)="change(i, i.quantity + 1)"><app-icon name="plus" [size]="14"></app-icon></button>
                    </div>
                  </td>
                  <td class="num"><strong>{{ i.subtotal | currency:'CLP':'symbol-narrow':'1.0-0' }}</strong></td>
                  <td class="num"><button class="btn btn-danger btn-icon" title="Quitar" (click)="remove(i)"><app-icon name="trash" [size]="15"></app-icon></button></td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <aside class="card card-pad">
          <h3 style="margin-bottom: 10px">Resumen</h3>
          <div class="summary-line"><span>Productos ({{ store.cart().itemCount }})</span><span>{{ store.cart().total | currency:'CLP':'symbol-narrow':'1.0-0' }}</span></div>
          <div class="summary-line"><span>Envío</span><span class="badge green">Gratis</span></div>
          <div class="summary-total"><span>Total</span><span>{{ store.cart().total | currency:'CLP':'symbol-narrow':'1.0-0' }}</span></div>
          <button class="btn btn-primary" style="width: 100%; margin-top: 16px" [disabled]="busy()" (click)="checkout()">
            <app-icon name="check" [size]="16"></app-icon> {{ busy() ? 'Procesando...' : 'Finalizar compra' }}
          </button>
          <p class="muted" style="font-size: 12px; margin: 12px 0 0">
            Al confirmar, la orden se procesa de forma asíncrona (RabbitMQ): se registra la orden, se descuenta el stock y recibirás un correo.
          </p>
        </aside>
      </div>
    }
  `
})
export class CartComponent {
  readonly store = inject(CartStore);
  private readonly api = inject(CartApi);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  readonly busy = signal(false);

  change(item: CartItem, quantity: number): void {
    if (quantity < 1) return;
    this.busy.set(true);
    this.api.update(item.productId, quantity).subscribe({
      next: cart => { this.store.set(cart); this.busy.set(false); },
      error: err => { this.busy.set(false); this.toast.errorFrom(err, 'No se pudo actualizar la cantidad'); }
    });
  }

  remove(item: CartItem): void {
    this.api.remove(item.productId).subscribe({
      next: cart => this.store.set(cart),
      error: err => this.toast.errorFrom(err, 'No se pudo quitar el producto')
    });
  }

  checkout(): void {
    this.busy.set(true);
    this.api.checkout().subscribe({
      next: res => {
        this.busy.set(false);
        this.store.clear();
        this.toast.success(res.message);
        setTimeout(() => this.router.navigateByUrl('/orders'), 600);
      },
      error: err => { this.busy.set(false); this.toast.errorFrom(err, 'No se pudo finalizar la compra'); }
    });
  }
}
