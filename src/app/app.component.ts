import { Component, OnInit, effect, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MsalService } from '@azure/msal-angular';
import { AuthService } from './core/auth/auth.service';
import { CartStore } from './core/cart.store';
import { IconComponent } from './core/ui/icon.component';
import { ToastsComponent } from './core/ui/toasts.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, IconComponent, ToastsComponent],
  template: `
    @if (auth.account()) {
      <div class="shell">
        <aside class="sidebar">
          <div class="brand">
            <span class="logo">P</span>
            <div><strong>Pedidos360</strong><small>Tienda online</small></div>
          </div>
          <nav>
            <a routerLink="/catalog" routerLinkActive="active"><app-icon name="store"></app-icon><span>Catálogo</span></a>
            <a routerLink="/cart" routerLinkActive="active">
              <app-icon name="cart"></app-icon><span>Carrito</span>
              @if (cart.count() > 0) { <em class="pill">{{ cart.count() }}</em> }
            </a>
            <a routerLink="/orders" routerLinkActive="active"><app-icon name="box"></app-icon><span>Mis órdenes</span></a>
            @if (auth.isAdmin()) {
              <div class="nav-title">Administración</div>
              <a routerLink="/admin/rabbitmq" routerLinkActive="active"><app-icon name="layers"></app-icon><span>RabbitMQ</span></a>
              <a routerLink="/admin/audit" routerLinkActive="active"><app-icon name="file"></app-icon><span>Auditoría</span></a>
            }
          </nav>
          <div class="sidebar-footer">
            <b>Azure Entra ID</b> · <b>AWS API Gateway</b><br>Spring Boot · RabbitMQ
          </div>
        </aside>

        <div class="main">
          <header class="topbar">
            <span class="muted">Bienvenido de vuelta</span>
            <div class="who">
              <button class="btn btn-ghost btn-sm" (click)="auth.copyToken()" title="Copia el JWT para usarlo en Postman">
                <app-icon name="copy" [size]="14"></app-icon> Copiar token
              </button>
              <div class="avatar">{{ auth.initials() }}</div>
              <div class="who-info">
                <strong>{{ auth.displayName() }}</strong>
                <small>{{ auth.isAdmin() ? 'Administrador' : 'Cliente' }}</small>
              </div>
              <button class="btn btn-ghost btn-sm" (click)="auth.logout()"><app-icon name="logout" [size]="14"></app-icon> Salir</button>
            </div>
          </header>
          <main class="content"><router-outlet></router-outlet></main>
        </div>
      </div>
    } @else {
      <router-outlet></router-outlet>
    }
    <app-toasts></app-toasts>
  `
})
export class AppComponent implements OnInit {
  readonly auth = inject(AuthService);
  readonly cart = inject(CartStore);
  private readonly msal = inject(MsalService);

  constructor() {
    // Cada vez que hay sesión iniciada se carga el carrito (para el contador del menú).
    effect(() => {
      if (this.auth.account()) this.cart.load();
    }, { allowSignalWrites: true });
  }

  ngOnInit(): void {
    this.msal.handleRedirectObservable().subscribe({
      next: result => {
        if (result?.account) this.msal.instance.setActiveAccount(result.account);
        this.auth.refresh();
      },
      error: err => console.error('Error en el login (redirect):', err)
    });
    this.auth.init();
  }
}
