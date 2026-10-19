import { Routes } from '@angular/router';
import { MsalGuard } from '@azure/msal-angular';
import { adminGuard } from './core/auth/admin.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', loadComponent: () => import('./features/landing/landing.component').then(m => m.LandingComponent) },
  { path: 'catalog', canActivate: [MsalGuard], loadComponent: () => import('./features/catalog/catalog.component').then(m => m.CatalogComponent) },
  { path: 'cart', canActivate: [MsalGuard], loadComponent: () => import('./features/cart/cart.component').then(m => m.CartComponent) },
  { path: 'orders', canActivate: [MsalGuard], loadComponent: () => import('./features/orders/orders.component').then(m => m.OrdersComponent) },
  { path: 'admin/rabbitmq', canActivate: [MsalGuard, adminGuard], loadComponent: () => import('./features/admin/rabbit-admin.component').then(m => m.RabbitAdminComponent) },
  { path: 'admin/audit', canActivate: [MsalGuard, adminGuard], loadComponent: () => import('./features/admin/audit.component').then(m => m.AuditComponent) },
  { path: '**', redirectTo: '' }
];
