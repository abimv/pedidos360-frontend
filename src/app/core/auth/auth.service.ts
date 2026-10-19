import { Injectable, computed, inject, signal } from '@angular/core';
import { MsalBroadcastService, MsalService } from '@azure/msal-angular';
import { AccountInfo, EventMessage, EventType, InteractionStatus } from '@azure/msal-browser';
import { filter } from 'rxjs';
import { apiScopes } from './msal.config';
import { ToastService } from '../ui/toast.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly msal = inject(MsalService);
  private readonly broadcast = inject(MsalBroadcastService);
  private readonly toast = inject(ToastService);

  readonly account = signal<AccountInfo | null>(null);
  readonly roles = computed<string[]>(() => {
    const claims = this.account()?.idTokenClaims as { roles?: string[] } | undefined;
    return claims?.roles ?? [];
  });
  readonly isAdmin = computed(() => this.roles().includes('Admin'));
  readonly displayName = computed(() => this.account()?.name || this.account()?.username || '');
  readonly initials = computed(() => {
    const parts = this.displayName().split(/[\s@.]+/).filter(p => p.length > 0);
    return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || 'U';
  });

  private started = false;

  init(): void {
    if (this.started) return;
    this.started = true;
    this.refresh();
    const relevant: EventType[] = [EventType.LOGIN_SUCCESS, EventType.ACQUIRE_TOKEN_SUCCESS, EventType.LOGOUT_SUCCESS];
    this.broadcast.msalSubject$
      .pipe(filter((m: EventMessage) => relevant.includes(m.eventType)))
      .subscribe(() => this.refresh());
    this.broadcast.inProgress$
      .pipe(filter(s => s === InteractionStatus.None))
      .subscribe(() => this.refresh());
  }

  refresh(): void {
    const instance = this.msal.instance;
    let acc = instance.getActiveAccount();
    if (!acc) {
      const all = instance.getAllAccounts();
      if (all.length > 0) {
        instance.setActiveAccount(all[0]);
        acc = all[0];
      }
    }
    this.account.set(acc);
  }

  login(): void {
    this.msal.loginRedirect({ scopes: apiScopes }).subscribe();
  }

  logout(): void {
    this.msal.logoutRedirect({ postLogoutRedirectUri: window.location.origin }).subscribe();
  }

  /** Utilidad para pruebas con Postman: copia el access token (JWT) actual al portapapeles. */
  copyToken(): void {
    const account = this.account();
    if (!account) return;
    this.msal.acquireTokenSilent({ scopes: apiScopes, account }).subscribe({
      next: async result => {
        await navigator.clipboard.writeText(result.accessToken);
        this.toast.success('Access token copiado al portapapeles');
      },
      error: () => this.toast.error('No se pudo obtener el token. Vuelve a iniciar sesión.')
    });
  }
}
