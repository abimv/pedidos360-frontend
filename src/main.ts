import { bootstrapApplication } from '@angular/platform-browser';
import { PublicClientApplication } from '@azure/msal-browser';
import { AppComponent } from './app/app.component';
import { buildAppConfig } from './app/app.config';
import { msalConfig } from './app/core/auth/msal.config';

// MSAL debe inicializarse ANTES de arrancar Angular.
PublicClientApplication.createPublicClientApplication(msalConfig)
  .then(instance => bootstrapApplication(AppComponent, buildAppConfig(instance)))
  .catch(err => console.error(err));
