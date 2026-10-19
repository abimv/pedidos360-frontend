import { CurrencyPipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CartApi, ProductsApi } from '../../core/api/api.services';
import { AuthService } from '../../core/auth/auth.service';
import { CartStore } from '../../core/cart.store';
import { Product, ProductRequest } from '../../core/models';
import { IconComponent } from '../../core/ui/icon.component';
import { ToastService } from '../../core/ui/toast.service';

const VISUALS: Record<string, { emoji: string; gradient: string }> = {
  'Tecnología': { emoji: '💻', gradient: 'linear-gradient(135deg,#e0e7ff,#c7d2fe)' },
  'Accesorios': { emoji: '🖱️', gradient: 'linear-gradient(135deg,#fce7f3,#fbcfe8)' },
  'Audio': { emoji: '🎧', gradient: 'linear-gradient(135deg,#dcfce7,#bbf7d0)' },
  'Hogar': { emoji: '🏠', gradient: 'linear-gradient(135deg,#fef3c7,#fde68a)' },
  'Oficina': { emoji: '🪑', gradient: 'linear-gradient(135deg,#e0f2fe,#bae6fd)' }
};
const DEFAULT_VISUAL = { emoji: '📦', gradient: 'linear-gradient(135deg,#f1f5f9,#e2e8f0)' };

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CurrencyPipe, FormsModule, IconComponent],
  template: `
    <div class="page-head">
      <div>
        <h2>Catálogo</h2>
        <p>Descubre los productos disponibles. El stock se actualiza automáticamente tras cada compra.</p>
      </div>
      @if (auth.isAdmin()) {
        <button class="btn btn-primary" (click)="openForm()"><app-icon name="plus" [size]="16"></app-icon> Nuevo producto</button>
      }
    </div>

    <div class="row">
      <div class="search grow">
        <app-icon name="search" [size]="16"></app-icon>
        <input class="input" placeholder="Buscar productos..." [ngModel]="query()" (ngModelChange)="query.set($event)">
      </div>
      <div class="chips">
        @for (c of categories(); track c) {
          <button class="chip" [class.on]="category() === c" (click)="category.set(c)">{{ c }}</button>
        }
      </div>
    </div>

    @if (loading()) {
      <div class="grid-products">
        @for (i of [1,2,3,4,5,6,7,8]; track i) { <div class="skeleton" style="height: 330px"></div> }
      </div>
    } @else if (filtered().length === 0) {
      <div class="card empty" style="margin-top: 20px">
        <div class="ico"><app-icon name="search" [size]="26"></app-icon></div>
        <h3>No encontramos productos</h3><span>Prueba con otra búsqueda o categoría.</span>
      </div>
    } @else {
      <div class="grid-products">
        @for (p of filtered(); track p.id) {
          <article class="card product">
            <div class="visual" [style.background]="visual(p).gradient">
              <span>{{ visual(p).emoji }}</span>
              <span class="badge">{{ p.category || 'General' }}</span>
            </div>
            <div class="body">
              <h3>{{ p.name }}</h3>
              <p>{{ p.description }}</p>
              <div class="stock" [class.low]="p.stock > 0 && p.stock <= 5" [class.out]="p.stock <= 0">
                {{ p.stock <= 0 ? 'Agotado' : p.stock <= 5 ? '¡Últimas ' + p.stock + ' unidades!' : p.stock + ' disponibles' }}
              </div>
              <div class="foot">
                <span class="price">{{ p.price | currency:'CLP':'symbol-narrow':'1.0-0' }}</span>
                <div class="row" style="gap: 6px">
                  @if (auth.isAdmin()) {
                    <button class="btn btn-danger btn-icon" title="Eliminar" (click)="remove(p)"><app-icon name="trash" [size]="15"></app-icon></button>
                  }
                  <button class="btn btn-primary btn-sm" [disabled]="p.stock <= 0 || adding() === p.id" (click)="add(p)">
                    <app-icon name="cart" [size]="15"></app-icon> {{ adding() === p.id ? 'Agregando...' : 'Agregar' }}
                  </button>
                </div>
              </div>
            </div>
          </article>
        }
      </div>
    }

    @if (showForm()) {
      <div class="modal-backdrop" (click)="showForm.set(false)">
        <div class="modal" (click)="$event.stopPropagation()">
          <h3>Nuevo producto</h3>
          <div class="field"><label>Nombre</label><input class="input" [(ngModel)]="form.name"></div>
          <div class="field"><label>Descripción</label><textarea class="textarea" rows="2" [(ngModel)]="form.description"></textarea></div>
          <div class="row">
            <div class="field grow"><label>Categoría</label><input class="input" [(ngModel)]="form.category" placeholder="Tecnología, Accesorios..."></div>
            <div class="field grow"><label>Precio (CLP)</label><input class="input" type="number" min="0" [(ngModel)]="form.price"></div>
            <div class="field grow"><label>Stock</label><input class="input" type="number" min="0" [(ngModel)]="form.stock"></div>
          </div>
          <div class="modal-actions">
            <button class="btn btn-ghost" (click)="showForm.set(false)">Cancelar</button>
            <button class="btn btn-primary" [disabled]="saving()" (click)="save()">{{ saving() ? 'Guardando...' : 'Guardar' }}</button>
          </div>
        </div>
      </div>
    }
  `
})
export class CatalogComponent implements OnInit {
  private readonly productsApi = inject(ProductsApi);
  private readonly cartApi = inject(CartApi);
  private readonly store = inject(CartStore);
  private readonly toast = inject(ToastService);
  readonly auth = inject(AuthService);

  readonly products = signal<Product[]>([]);
  readonly loading = signal(true);
  readonly query = signal('');
  readonly category = signal('Todos');
  readonly adding = signal<number | null>(null);
  readonly showForm = signal(false);
  readonly saving = signal(false);
  form: ProductRequest = this.emptyForm();

  readonly categories = computed(() => {
    const cats = this.products().map(p => p.category).filter((c): c is string => !!c);
    return ['Todos', ...Array.from(new Set(cats))];
  });

  readonly filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    const cat = this.category();
    return this.products().filter(p =>
      (cat === 'Todos' || p.category === cat) &&
      (!q || p.name.toLowerCase().includes(q) || (p.description ?? '').toLowerCase().includes(q)));
  });

  ngOnInit(): void { this.load(); }

  visual(p: Product) { return VISUALS[p.category] ?? DEFAULT_VISUAL; }

  load(): void {
    this.loading.set(true);
    this.productsApi.list().subscribe({
      next: list => { this.products.set(list); this.loading.set(false); },
      error: err => { this.loading.set(false); this.toast.errorFrom(err, 'No se pudo cargar el catálogo'); }
    });
  }

  add(p: Product): void {
    this.adding.set(p.id);
    this.cartApi.add(p.id, 1).subscribe({
      next: cart => { this.store.set(cart); this.adding.set(null); this.toast.success(`${p.name} agregado al carrito`); },
      error: err => { this.adding.set(null); this.toast.errorFrom(err, 'No se pudo agregar el producto'); }
    });
  }

  openForm(): void { this.form = this.emptyForm(); this.showForm.set(true); }

  save(): void {
    this.saving.set(true);
    this.productsApi.create({ ...this.form, price: Number(this.form.price), stock: Number(this.form.stock) }).subscribe({
      next: () => { this.saving.set(false); this.showForm.set(false); this.toast.success('Producto creado'); this.load(); },
      error: err => { this.saving.set(false); this.toast.errorFrom(err, 'No se pudo crear el producto'); }
    });
  }

  remove(p: Product): void {
    if (!confirm(`¿Eliminar "${p.name}" del catálogo?`)) return;
    this.productsApi.remove(p.id).subscribe({
      next: () => { this.toast.success('Producto eliminado'); this.load(); },
      error: err => this.toast.errorFrom(err, 'No se pudo eliminar')
    });
  }

  private emptyForm(): ProductRequest {
    return { name: '', description: '', category: '', price: 0, stock: 0 };
  }
}
