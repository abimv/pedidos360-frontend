// Completa estos valores con los de TU Azure y TU AWS (ver GUIA_DESPLIEGUE.md)
export const environment = {
  production: true,
  // Invoke URL del AWS API Gateway (sin "/" al final)
  apiBaseUrl: 'https://TU-API-ID.execute-api.us-east-1.amazonaws.com',
  azure: {
    tenantId: 'TU-TENANT-ID',
    clientId: 'TU-CLIENT-ID',
    apiScope: 'api://TU-CLIENT-ID/access_as_user'
  }
};
