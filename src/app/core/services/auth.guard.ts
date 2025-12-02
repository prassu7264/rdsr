import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private storage: StorageService,
    private router: Router
  ) {}

  canActivate(): boolean {

    // Check if token exists
    if (this.storage.hasToken()) {
      return true; // allow route
    }

    // No token → redirect to login
    this.router.navigate(['/login']);
    return false;
  }
}
