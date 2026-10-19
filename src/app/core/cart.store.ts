import { Injectable, computed, inject, signal } from '@angular/core';
import { CartApi } from './api/api.services';
import { Cart } from './models';

const EMPTY: Cart = { items: [], total: 0, itemCount: 0 };

/** Estado del carrito compartido entre el menú lateral, el catálogo y la página de carrito. */
@Injectable({ providedIn: 'root' })
export class CartStore {
  private readonly api = inject(CartApi);
  readonly cart = signal<Cart>(EMPTY);
  readonly count = computed(() => this.cart().itemCount);

  load(): void {
    this.api.get().subscribe({ next: c => this.cart.set(c), error: () => this.cart.set(EMPTY) });
  }

  set(cart: Cart): void { this.cart.set(cart); }
  clear(): void { this.cart.set(EMPTY); }
}
