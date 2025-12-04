import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { URL } from 'src/app/api-base';

import { Router } from '@angular/router';
import { StorageService } from './storage.service';

const AUTH_URL = URL.AUTH_URL();
const BASE_URL = URL.BASE_URL();
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

  getAllShifts() {
    return this.http.get(`${BASE_URL}/common/getallshifts`);
  }
  getAllDepartments() {
    return this.http.get(`${BASE_URL}/department/getalldepartments`);
  }
  getDesignationByDepartment(department_id: any) {
    return this.http.get(`${BASE_URL}/department/designationbydepartment?department_id=${department_id}`);
  }
  createUser(payload: any) {
    return this.http.post(`${BASE_URL}/user/usercreate`, payload);
  }
  getUsersAll() {
    return this.http.get(`${BASE_URL}/user/all`);
  }

}
