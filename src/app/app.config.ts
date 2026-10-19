import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withEnabledBlockingInitialNavigation } from '@angular/router';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import {
  MSAL_GUARD_CONFIG, MSAL_INSTANCE, MSAL_INTERCEPTOR_CONFIG,
  MsalBroadcastService, MsalGuard, MsalGuardConfiguration,
  MsalInterceptor, MsalInterceptorConfiguration, MsalService
} from '@azure/msal-angular';
import { IPublicClientApplication, InteractionType } from '@azure/msal-browser';
import { routes } from './app.routes';
import { environment } from '../environments/environment';
import { apiScopes } from './core/auth/msal.config';

const guardConfig: MsalGuardConfiguration = {
  interactionType: InteractionType.Redirect,
  authRequest: { scopes: apiScopes }
};

/** MsalInterceptor adjunta automáticamente "Authorization: Bearer <JWT>" a las llamadas al API Gateway. */
const interceptorConfig: MsalInterceptorConfiguration = {
  interactionType: InteractionType.Redirect,
  protectedResourceMap: new Map<string, Array<string>>([
    [`${environment.apiBaseUrl}/api/*`, apiScopes]
  ])
};

export function buildAppConfig(msalInstance: IPublicClientApplication): ApplicationConfig {
  return {
    providers: [
      provideZoneChangeDetection({ eventCoalescing: true }),
      provideRouter(routes, withEnabledBlockingInitialNavigation()),
      provideHttpClient(withInterceptorsFromDi()),
      { provide: HTTP_INTERCEPTORS, useClass: MsalInterceptor, multi: true },
      { provide: MSAL_INSTANCE, useValue: msalInstance },
      { provide: MSAL_GUARD_CONFIG, useValue: guardConfig },
      { provide: MSAL_INTERCEPTOR_CONFIG, useValue: interceptorConfig },
      MsalService, MsalGuard, MsalBroadcastService
    ]
  };
}
