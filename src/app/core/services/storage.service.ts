import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  private ACCESS_TOKEN = 'access_token';
  private USER = 'user_data';
  private USERNAME = 'username';
  private REMEMBER_USERNAME = 'remember_username';
  private REMEMBER_PASSWORD = 'remember_password';
  private REMEMBER_ME = 'remember_me';

  private SECRET_KEY = 'YOUR_32_CHAR_SECRET_KEY_AES_256';

  constructor() { }

  // -----------------------------
  // TOKEN
  // -----------------------------
  setToken(token: string): void {
    sessionStorage.setItem(this.ACCESS_TOKEN, token);
  }

  getToken(): string | null {
    return sessionStorage.getItem(this.ACCESS_TOKEN);
  }

  clearToken(): void {
    sessionStorage.removeItem(this.ACCESS_TOKEN);
  }

  hasToken(): boolean {
    return this.getToken() !== null;
  }

  // -----------------------------
  // USER
  // -----------------------------
  setUser(user: any): void {
    sessionStorage.setItem(this.USER, JSON.stringify(user));
  }

  getUser(): any {
    const data = sessionStorage.getItem(this.USER);
    return data ? JSON.parse(data) : null;
  }
  setUsername(username: any): void {
    sessionStorage.setItem(this.USERNAME, username);
  }
  getUsername(): any {
    const username = sessionStorage.getItem(this.USERNAME);
    return username;
  }
  updateUser(partialUser: any): void {
    const current = this.getUser();
    if (!current) return;
    const updatedUser = { ...current, ...partialUser };
    this.setUser(updatedUser);
  }

  hasUser(): boolean {
    return this.getUser() !== null;
  }

  getUserId(): string | number | null {
    const user = this.getUser();
    return user ? user.id || user.userId || null : null;
  }

  clearUser(): void {
    sessionStorage.removeItem(this.USER);
  }

  // -----------------------------
  // LOGGED-IN CHECK
  // -----------------------------
  isLoggedIn(): boolean {
    return this.hasToken() && this.hasUser();
  }

  // -----------------------------
  // REMEMBER ME (SAFE)
  // -----------------------------
  rememberMe(enable: boolean) {
    localStorage.setItem(this.REMEMBER_ME, enable ? 'true' : 'false');
  }

  isRememberMe(): boolean {
    return localStorage.getItem(this.REMEMBER_ME) === 'true';
  }

  setRememberUsername(username: string): void {
    localStorage.setItem(this.REMEMBER_USERNAME, username);
  }

  getRememberUsername(): string | null {
    return localStorage.getItem(this.REMEMBER_USERNAME);
  }

  // ---- Secure AES Password Encryption ----
  setRememberPassword(password: string): void {
    const encrypted = CryptoJS.AES.encrypt(password, this.SECRET_KEY).toString();
    localStorage.setItem(this.REMEMBER_PASSWORD, encrypted);
  }

  getRememberPassword(): string | null {
    const encrypted = localStorage.getItem(this.REMEMBER_PASSWORD);
    if (!encrypted) return null;

    try {
      const bytes = CryptoJS.AES.decrypt(encrypted, this.SECRET_KEY);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch {
      return null;
    }
  }

  clearRememberMe(): void {
    localStorage.removeItem(this.REMEMBER_USERNAME);
    localStorage.removeItem(this.REMEMBER_PASSWORD);
    localStorage.removeItem(this.REMEMBER_ME);
  }

  // -----------------------------
  // LOGOUT (simple + clean)
  // -----------------------------
  logout(): void {
    this.clearAll();
  }

  // -----------------------------
  // CLEAR ALL
  // -----------------------------
  clearAll(): void {
    this.clearToken();
    this.clearUser();
    this.clearRememberMe();
  }
}
