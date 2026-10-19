import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AuditLog, BindingInfo, Cart, ExchangeInfo, Order, Product, ProductRequest, QueueInfo
} from '../models';

const API = environment.apiBaseUrl + '/api';

/** El JWT lo agrega MsalInterceptor; aquí solo se definen las rutas del API Gateway. */
@Injectable({ providedIn: 'root' })
export class ProductsApi {
  private http = inject(HttpClient);
  list(q?: string): Observable<Product[]> {
    let params = new HttpParams();
    if (q) params = params.set('q', q);
    return this.http.get<Product[]>(`${API}/products`, { params });
  }
  create(p: ProductRequest): Observable<Product> { return this.http.post<Product>(`${API}/products`, p); }
  remove(id: number): Observable<void> { return this.http.delete<void>(`${API}/products/${id}`); }
}

@Injectable({ providedIn: 'root' })
export class CartApi {
  private http = inject(HttpClient);
  get(): Observable<Cart> { return this.http.get<Cart>(`${API}/cart`); }
  add(productId: number, quantity: number): Observable<Cart> {
    return this.http.post<Cart>(`${API}/cart/items`, { productId, quantity });
  }
  update(productId: number, quantity: number): Observable<Cart> {
    return this.http.put<Cart>(`${API}/cart/items/${productId}`, { quantity });
  }
  remove(productId: number): Observable<Cart> { return this.http.delete<Cart>(`${API}/cart/items/${productId}`); }
  checkout(): Observable<{ checkoutId: string; message: string }> {
    return this.http.post<{ checkoutId: string; message: string }>(`${API}/cart/checkout`, {});
  }
}

@Injectable({ providedIn: 'root' })
export class OrdersApi {
  private http = inject(HttpClient);
  mine(): Observable<Order[]> { return this.http.get<Order[]>(`${API}/orders`); }
}

@Injectable({ providedIn: 'root' })
export class NotificationsApi {
  private http = inject(HttpClient);
  send(to: string, subject: string, body: string): Observable<{ status: string; to: string }> {
    return this.http.post<{ status: string; to: string }>(`${API}/notifications/send`, { to, subject, body });
  }
}

@Injectable({ providedIn: 'root' })
export class RabbitApi {
  private http = inject(HttpClient);
  queues(): Observable<QueueInfo[]> { return this.http.get<QueueInfo[]>(`${API}/rabbit/queues`); }
  createQueue(body: { name: string; durable: boolean; withDeadLetter: boolean }): Observable<void> {
    return this.http.post<void>(`${API}/rabbit/queues`, body);
  }
  deleteQueue(name: string): Observable<void> { return this.http.delete<void>(`${API}/rabbit/queues/${encodeURIComponent(name)}`); }

  exchanges(): Observable<ExchangeInfo[]> { return this.http.get<ExchangeInfo[]>(`${API}/rabbit/exchanges`); }
  createExchange(body: { name: string; type: string; durable: boolean }): Observable<void> {
    return this.http.post<void>(`${API}/rabbit/exchanges`, body);
  }
  deleteExchange(name: string): Observable<void> { return this.http.delete<void>(`${API}/rabbit/exchanges/${encodeURIComponent(name)}`); }

  bindings(): Observable<BindingInfo[]> { return this.http.get<BindingInfo[]>(`${API}/rabbit/bindings`); }
  createBinding(body: { exchange: string; queue: string; routingKey: string }): Observable<void> {
    return this.http.post<void>(`${API}/rabbit/bindings`, body);
  }
  deleteBinding(body: { exchange: string; queue: string; routingKey: string }): Observable<void> {
    return this.http.delete<void>(`${API}/rabbit/bindings`, { body });
  }
}

@Injectable({ providedIn: 'root' })
export class AuditApi {
  private http = inject(HttpClient);
  latest(limit = 50): Observable<AuditLog[]> {
    return this.http.get<AuditLog[]>(`${API}/audit`, { params: new HttpParams().set('limit', limit) });
  }
  stats(): Observable<Record<string, number>> { return this.http.get<Record<string, number>>(`${API}/audit/stats`); }
}
