import { inject, Injectable } from '@angular/core';
import {  ActivatedRouteSnapshot, CanActivate, CanActivateFn, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
    const isLoggedIn = this.authService.isLoggedIn();
    const allowedRoles = route.data['roles'] as string[] | undefined;
    const userRoles = this.authService.getUserRoles();

    if (!isLoggedIn) {
      return this.router.parseUrl('/login');
    }

    if (allowedRoles && !userRoles.some(role => allowedRoles.includes(role))) {
      return this.router.parseUrl('/forbidden');
    }

    return true;
  }
}