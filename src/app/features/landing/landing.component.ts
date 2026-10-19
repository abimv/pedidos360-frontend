import { Component, effect, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { IconComponent } from '../../core/ui/icon.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [IconComponent],
  template: `
    <div class="landing">
      <header class="l-nav">
        <div class="brand"><span class="logo">P</span><strong>Pedidos360</strong></div>
        <button class="btn btn-ghost" (click)="auth.login()">Iniciar sesión</button>
      </header>

      <section class="hero">
        <span class="badge indigo"><app-icon name="shield" [size]="13"></app-icon> Acceso corporativo con Microsoft Entra ID</span>
        <h1>Tu tienda, en tiempo real<br>y construida en la nube.</h1>
        <p>Pedidos360 es una plataforma de compras basada en microservicios: catálogo, carrito, órdenes y notificaciones
           comunicados de forma asíncrona con RabbitMQ y protegidos por un API Gateway.</p>
        <div class="cta">
          <button class="btn btn-primary btn-lg" (click)="auth.login()">
            <svg width="18" height="18" viewBox="0 0 21 21" aria-hidden="true">
              <rect x="1" y="1" width="9" height="9" fill="#f25022"/><rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
              <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/><rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
            </svg>
            Continuar con Microsoft
          </button>
        </div>
      </section>

      <section class="features">
        <div class="card card-pad feat"><div class="ico"><app-icon name="shield"></app-icon></div><h3>Seguridad end-to-end</h3>
          <p>OAuth 2.0 + OIDC con PKCE. El JWT se valida en AWS API Gateway y de nuevo en cada microservicio.</p></div>
        <div class="card card-pad feat"><div class="ico"><app-icon name="layers"></app-icon></div><h3>Mensajería desacoplada</h3>
          <p>Exchanges, colas y DLQ en RabbitMQ para stock, órdenes, correos y auditoría.</p></div>
        <div class="card card-pad feat"><div class="ico"><app-icon name="mail"></app-icon></div><h3>Notificaciones</h3>
          <p>Cada compra confirmada dispara un correo electrónico de forma asíncrona.</p></div>
        <div class="card card-pad feat"><div class="ico"><app-icon name="file"></app-icon></div><h3>Auditoría</h3>
          <p>Un microservicio propio registra cada evento que circula por el sistema.</p></div>
      </section>

      <footer class="l-foot">Azure Entra ID · AWS API Gateway · AWS EC2 · RDS PostgreSQL · Spring Boot · Angular · RabbitMQ</footer>
    </div>
  `,
  styles: [`
    .landing { min-height: 100vh; background: radial-gradient(1200px 500px at 70% -10%, #e0e7ff 0%, transparent 60%), #f8faff; }
    .l-nav { display: flex; justify-content: space-between; align-items: center; max-width: 1120px; margin: 0 auto; padding: 22px 24px; }
    .brand { display: flex; align-items: center; gap: 12px; font-size: 18px; color: #0f172a; }
    .logo { width: 38px; height: 38px; border-radius: 11px; display: grid; place-items: center; color: #fff; font-weight: 800; background: linear-gradient(135deg, #6366f1, #8b5cf6); }
    .hero { max-width: 820px; margin: 0 auto; text-align: center; padding: 70px 24px 40px; }
    .hero h1 { font-size: clamp(34px, 5vw, 56px); font-weight: 800; letter-spacing: -.03em; line-height: 1.08; margin: 22px 0 18px;
      background: linear-gradient(135deg, #0f172a 30%, #4f46e5); -webkit-background-clip: text; background-clip: text; color: transparent; }
    .hero p { font-size: 17px; color: #475569; max-width: 640px; margin: 0 auto 30px; }
    .btn-lg { padding: 14px 26px; font-size: 15px; border-radius: 12px; }
    .features { max-width: 1120px; margin: 40px auto 0; padding: 0 24px; display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 18px; }
    .feat .ico { width: 42px; height: 42px; border-radius: 12px; background: #eef2ff; color: #4f46e5; display: grid; place-items: center; margin-bottom: 14px; }
    .feat h3 { font-size: 16px; margin-bottom: 6px; }
    .feat p { margin: 0; color: #64748b; font-size: 13.5px; }
    .l-foot { text-align: center; color: #94a3b8; font-size: 12.5px; padding: 60px 24px 30px; }
  `]
})
export class LandingComponent {
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  constructor() {
    effect(() => {
      if (this.auth.account()) this.router.navigateByUrl('/catalog');
    });
  }
}
