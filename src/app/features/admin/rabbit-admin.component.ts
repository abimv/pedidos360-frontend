import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NotificationsApi, RabbitApi } from '../../core/api/api.services';
import { BindingInfo, ExchangeInfo, QueueInfo } from '../../core/models';
import { IconComponent } from '../../core/ui/icon.component';
import { ToastService } from '../../core/ui/toast.service';

type Tab = 'queues' | 'exchanges' | 'bindings' | 'notify';

@Component({
  selector: 'app-rabbit-admin',
  standalone: true,
  imports: [FormsModule, IconComponent],
  template: `
    <div class="page-head">
      <div><h2>Administración de RabbitMQ</h2><p>Crea y elimina colas, exchanges y bindings mediante el microservicio rabbit-admin-service.</p></div>
      <button class="btn btn-ghost" (click)="loadAll()"><app-icon name="refresh" [size]="16"></app-icon> Actualizar</button>
    </div>

    <div class="tabs">
      <button [class.on]="tab() === 'queues'" (click)="tab.set('queues')">Colas ({{ queues().length }})</button>
      <button [class.on]="tab() === 'exchanges'" (click)="tab.set('exchanges')">Exchanges ({{ exchanges().length }})</button>
      <button [class.on]="tab() === 'bindings'" (click)="tab.set('bindings')">Bindings ({{ bindings().length }})</button>
      <button [class.on]="tab() === 'notify'" (click)="tab.set('notify')">Probar correo</button>
    </div>

    @switch (tab()) {
      @case ('queues') {
        <div class="card card-pad" style="margin-bottom: 18px">
          <div class="row">
            <div class="field grow" style="margin: 0"><label>Nombre de la cola</label><input class="input" [(ngModel)]="q.name" placeholder="ej: cupones.queue"></div>
            <label class="row" style="margin-top: 20px"><input type="checkbox" [(ngModel)]="q.durable"> Durable</label>
            <label class="row" style="margin-top: 20px"><input type="checkbox" [(ngModel)]="q.withDeadLetter"> Con DLQ</label>
            <button class="btn btn-primary" style="margin-top: 20px" (click)="createQueue()"><app-icon name="plus" [size]="16"></app-icon> Crear cola</button>
          </div>
        </div>
        <div class="card table-wrap">
          <table class="table">
            <thead><tr><th>Nombre</th><th>Estado</th><th class="num">Mensajes</th><th class="num">Consumidores</th><th></th></tr></thead>
            <tbody>
              @for (x of queues(); track x.name) {
                <tr>
                  <td class="mono">{{ x.name }} @if (x.name.endsWith('.dlq')) { <span class="badge amber">DLQ</span> }</td>
                  <td><span class="badge" [class.green]="x.state === 'running'">{{ x.state }}</span></td>
                  <td class="num">{{ x.messages }}</td><td class="num">{{ x.consumers }}</td>
                  <td class="num"><button class="btn btn-danger btn-icon" (click)="deleteQueue(x.name)"><app-icon name="trash" [size]="15"></app-icon></button></td>
                </tr>
              } @empty { <tr><td colspan="5" class="muted" style="text-align: center; padding: 30px">Sin colas</td></tr> }
            </tbody>
          </table>
        </div>
      }
      @case ('exchanges') {
        <div class="card card-pad" style="margin-bottom: 18px">
          <div class="row">
            <div class="field grow" style="margin: 0"><label>Nombre del exchange</label><input class="input" [(ngModel)]="e.name" placeholder="ej: cupones.exchange"></div>
            <div class="field" style="margin: 0; width: 160px"><label>Tipo</label>
              <select class="select" [(ngModel)]="e.type"><option>direct</option><option>topic</option><option>fanout</option><option>headers</option></select>
            </div>
            <button class="btn btn-primary" style="margin-top: 20px" (click)="createExchange()"><app-icon name="plus" [size]="16"></app-icon> Crear exchange</button>
          </div>
        </div>
        <div class="card table-wrap">
          <table class="table">
            <thead><tr><th>Nombre</th><th>Tipo</th><th>Durable</th><th></th></tr></thead>
            <tbody>
              @for (x of exchanges(); track x.name) {
                <tr>
                  <td class="mono">{{ x.name }}</td><td><span class="badge indigo">{{ x.type }}</span></td><td>{{ x.durable ? 'Sí' : 'No' }}</td>
                  <td class="num"><button class="btn btn-danger btn-icon" (click)="deleteExchange(x.name)"><app-icon name="trash" [size]="15"></app-icon></button></td>
                </tr>
              } @empty { <tr><td colspan="4" class="muted" style="text-align: center; padding: 30px">Sin exchanges</td></tr> }
            </tbody>
          </table>
        </div>
      }
      @case ('bindings') {
        <div class="card card-pad" style="margin-bottom: 18px">
          <div class="row">
            <div class="field grow" style="margin: 0"><label>Exchange</label><input class="input" [(ngModel)]="b.exchange" placeholder="pedidos360.exchange"></div>
            <div class="field grow" style="margin: 0"><label>Cola</label><input class="input" [(ngModel)]="b.queue" placeholder="mi.cola"></div>
            <div class="field grow" style="margin: 0"><label>Routing key</label><input class="input" [(ngModel)]="b.routingKey" placeholder="order.*"></div>
            <button class="btn btn-primary" style="margin-top: 20px" (click)="createBinding()"><app-icon name="plus" [size]="16"></app-icon> Crear binding</button>
          </div>
        </div>
        <div class="card table-wrap">
          <table class="table">
            <thead><tr><th>Exchange</th><th>Destino</th><th>Routing key</th><th></th></tr></thead>
            <tbody>
              @for (x of bindings(); track x.source + x.destination + x.routingKey) {
                <tr>
                  <td class="mono">{{ x.source }}</td>
                  <td class="mono">{{ x.destination }} <span class="badge">{{ x.destinationType }}</span></td>
                  <td class="mono">{{ x.routingKey || '—' }}</td>
                  <td class="num">
                    @if (x.destinationType === 'queue') {
                      <button class="btn btn-danger btn-icon" (click)="deleteBinding(x)"><app-icon name="trash" [size]="15"></app-icon></button>
                    }
                  </td>
                </tr>
              } @empty { <tr><td colspan="4" class="muted" style="text-align: center; padding: 30px">Sin bindings</td></tr> }
            </tbody>
          </table>
        </div>
      }
      @case ('notify') {
        <div class="card card-pad" style="max-width: 620px">
          <h3 style="margin-bottom: 4px">Enviar correo de prueba</h3>
          <p class="muted" style="margin: 0 0 16px">Llama a POST /api/notifications/send en notifications-service.</p>
          <div class="field"><label>Destinatario</label><input class="input" type="email" [(ngModel)]="n.to" placeholder="correo&#64;dominio.cl"></div>
          <div class="field"><label>Asunto</label><input class="input" [(ngModel)]="n.subject"></div>
          <div class="field"><label>Mensaje</label><textarea class="textarea" rows="4" [(ngModel)]="n.body"></textarea></div>
          <button class="btn btn-primary" (click)="sendMail()"><app-icon name="send" [size]="16"></app-icon> Enviar</button>
        </div>
      }
    }
  `
})
export class RabbitAdminComponent implements OnInit {
  private readonly rabbit = inject(RabbitApi);
  private readonly notifications = inject(NotificationsApi);
  private readonly toast = inject(ToastService);

  readonly tab = signal<Tab>('queues');
  readonly queues = signal<QueueInfo[]>([]);
  readonly exchanges = signal<ExchangeInfo[]>([]);
  readonly bindings = signal<BindingInfo[]>([]);

  q = { name: '', durable: true, withDeadLetter: true };
  e = { name: '', type: 'topic', durable: true };
  b = { exchange: '', queue: '', routingKey: '' };
  n = { to: '', subject: 'Prueba Pedidos360', body: 'Hola, este es un correo de prueba enviado desde Pedidos360.' };

  ngOnInit(): void { this.loadAll(); }

  loadAll(): void {
    this.rabbit.queues().subscribe({ next: v => this.queues.set(v), error: err => this.toast.errorFrom(err, 'No se pudieron listar las colas') });
    this.rabbit.exchanges().subscribe({ next: v => this.exchanges.set(v), error: () => undefined });
    this.rabbit.bindings().subscribe({ next: v => this.bindings.set(v), error: () => undefined });
  }

  createQueue(): void {
    this.rabbit.createQueue(this.q).subscribe({
      next: () => { this.toast.success(`Cola "${this.q.name}" creada`); this.q.name = ''; this.loadAll(); },
      error: err => this.toast.errorFrom(err, 'No se pudo crear la cola')
    });
  }
  deleteQueue(name: string): void {
    if (!confirm(`¿Eliminar la cola "${name}"?`)) return;
    this.rabbit.deleteQueue(name).subscribe({
      next: () => { this.toast.success('Cola eliminada'); this.loadAll(); },
      error: err => this.toast.errorFrom(err, 'No se pudo eliminar la cola')
    });
  }

  createExchange(): void {
    this.rabbit.createExchange(this.e).subscribe({
      next: () => { this.toast.success(`Exchange "${this.e.name}" creado`); this.e.name = ''; this.loadAll(); },
      error: err => this.toast.errorFrom(err, 'No se pudo crear el exchange')
    });
  }
  deleteExchange(name: string): void {
    if (!confirm(`¿Eliminar el exchange "${name}"?`)) return;
    this.rabbit.deleteExchange(name).subscribe({
      next: () => { this.toast.success('Exchange eliminado'); this.loadAll(); },
      error: err => this.toast.errorFrom(err, 'No se pudo eliminar el exchange')
    });
  }

  createBinding(): void {
    this.rabbit.createBinding(this.b).subscribe({
      next: () => { this.toast.success('Binding creado'); this.loadAll(); },
      error: err => this.toast.errorFrom(err, 'No se pudo crear el binding')
    });
  }
  deleteBinding(x: BindingInfo): void {
    this.rabbit.deleteBinding({ exchange: x.source, queue: x.destination, routingKey: x.routingKey }).subscribe({
      next: () => { this.toast.success('Binding eliminado'); this.loadAll(); },
      error: err => this.toast.errorFrom(err, 'No se pudo eliminar el binding')
    });
  }

  sendMail(): void {
    this.notifications.send(this.n.to, this.n.subject, this.n.body).subscribe({
      next: r => this.toast.success(r.status === 'SENT' ? `Correo enviado a ${r.to}` : `Correo simulado para ${r.to} (revisa el log)`),
      error: err => this.toast.errorFrom(err, 'No se pudo enviar el correo')
    });
  }
}
