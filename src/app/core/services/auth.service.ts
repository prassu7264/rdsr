import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { URL } from 'src/app/api-base';

import { Router } from '@angular/router';
import { StorageService } from './storage.service';

const AUTH_URL = URL.AUTH_URL();

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private http: HttpClient,
    private storageService: StorageService,
    private router: Router
  ) { }

  // -----------------------------
  // LOGIN
  // -----------------------------
  signin(payload: { username: string; password: string }) {
    return this.http.post(`${AUTH_URL}/signin`, payload);
  }

  // -----------------------------
  // LOGOUT (NO API CALL)
  // -----------------------------
  logout(): void {
    this.storageService.clearAll();
    this.router.navigate(['/login']);
  }

}
