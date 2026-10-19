# Pedidos360 – Frontend (Angular 18)

- Login corporativo con **Microsoft Entra ID** (OAuth 2.0 / OIDC, Authorization Code + PKCE) usando `@azure/msal-angular`.
- `MsalInterceptor` adjunta el JWT en cada llamada al **AWS API Gateway**.
- Rutas protegidas con `MsalGuard`; el rol `Admin` habilita RabbitMQ y Auditoría.

## Configuración
Editar `src/environments/environment.ts` (apiBaseUrl, tenantId, clientId, apiScope).

## Ejecutar
```bash
npm install
npm start          # http://localhost:4200
npm run build      # dist/pedidos360-frontend/browser
```
Despliegue: ver `GUIA_DESPLIEGUE.md`.
