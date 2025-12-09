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
    return this.http.post(`${BASE_URL}/user/create`, payload);
  }
  getUsersAll() {
    return this.http.get(`${BASE_URL}/user/all`);
  }

  updateUser(payload: any) {
    return this.http.post(`${BASE_URL}/user/update`, payload);
  }
  deleteUser(employee_id: any, username: any) {
    return this.http.delete(`${BASE_URL}/user/delete?employee_id=${employee_id}&username=${username}`);
  }

  getManagerList() {
    return this.http.get(`${BASE_URL}/user/getmanagerlist`);
  }

  getEmployeeList() {
    return this.http.get(`${BASE_URL}/user/getemployeelist`);
  }

  getAllProjects() {
    return this.http.get(`${BASE_URL}/project/all`);
  }

  createProject(payload: any) {
    return this.http.post(`${BASE_URL}/project/create`, payload);
  }

  updateProject(payload: any) {
    return this.http.post(`${BASE_URL}/project/update`, payload);
  }

  deleteProject(username: string, project_id: number) {
    return this.http.delete(`${BASE_URL}/project/delete/?username=${username}&project_id=${project_id}`);
  }

  getAppsTypes() {
    return this.http.get(`${BASE_URL}/common/getapptypes`);
  }
  createTask(payload: any) {
    return this.http.post(`${BASE_URL}/task/create`, payload);
  }
  getAllTasks() {
    return this.http.get(`${BASE_URL}/task/all`);
  }
  getTasksByProjectIdNdEmployeeId(project_id: any, employee_id: any) {
    return this.http.get(`${BASE_URL}/task/tasklist?project_id=${project_id}&employee_id=${employee_id}`);
  }
  deleteTask(username: string, task_id: number) {
    return this.http.delete(`${BASE_URL}/task/delete?username=${username}&task_id=${task_id}`);
  }
}
