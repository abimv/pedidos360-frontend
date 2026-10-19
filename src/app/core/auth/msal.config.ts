import { Configuration, LogLevel } from '@azure/msal-browser';
import { environment } from '../../../environments/environment';

/** Authorization Code Flow + PKCE (MSAL Browser 3.x lo aplica automáticamente en SPAs). */
export const msalConfig: Configuration = {
  auth: {
    clientId: environment.azure.clientId,
    authority: `https://login.microsoftonline.com/${environment.azure.tenantId}`,
    redirectUri: window.location.origin,
    postLogoutRedirectUri: window.location.origin,
    navigateToLoginRequestUrl: true
  },
  cache: { cacheLocation: 'localStorage' },
  system: {
    loggerOptions: { logLevel: LogLevel.Warning, piiLoggingEnabled: false }
  }
};

/** Scope de la API propia expuesta en Entra ID (aud del JWT = clientId). */
export const apiScopes: string[] = [environment.azure.apiScope];
