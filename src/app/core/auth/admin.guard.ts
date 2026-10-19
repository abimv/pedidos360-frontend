import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

/** Solo usuarios con el rol de aplicación "Admin" (claim "roles" del token). */
export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  auth.refresh();
  return auth.isAdmin() ? true : router.createUrlTree(['/catalog']);
};
