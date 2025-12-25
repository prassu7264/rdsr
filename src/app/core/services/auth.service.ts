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
  getprojectmembersById(project_id: any) {
    return this.http.get(`${BASE_URL}/user/getprojectmembers?project_id=${project_id}`);
  }
  getEmployeelistByProjectId(project_id: any) {
    return this.http.get(`${BASE_URL}/user/getemployeelistbyproject?project_id=${project_id}`);
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

  getAllProjectsByEmployeeId(employee_id: any) {
    return this.http.get(`${BASE_URL}/project/all?employee_id=${employee_id}`);
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
  getTasksByProjectIdNdEmployeeId(project_id: any, employee_id: any, phaseid: any, type: any) {
    return this.http.get(`${BASE_URL}/task/tasklist?project_id=${project_id}&employee_id=${employee_id}&phase_id=${phaseid}&task_type=${type}`);
  }
  deleteTask(username: string, task_id: number) {
    return this.http.delete(`${BASE_URL}/task/delete?username=${username}&task_id=${task_id}`);
  }

  updateTask(payload: any) {
    return this.http.post(`${BASE_URL}/task/update`, payload);
  }
  swapTask(phase_id: any, task_list: any, username: any) {
    return this.http.get(`${BASE_URL}/task/swaptask?phase_id=${phase_id}&task_list=${task_list}&username=${username}`);
  }

  getStatusList() {
    return this.http.get(`${BASE_URL}/common/getstatuslist`);
  }


  getSubtasks(taskid: any) {
    return this.http.get(`${BASE_URL}/subtask/getsubtasks?taskid=${taskid}`);
  }

  createSubtask(payload: any) {
    return this.http.post(`${BASE_URL}/subtask/create`, payload);
  }

  updateSubtask(payload: any) {
    return this.http.post(`${BASE_URL}/subtask/update`, payload);
  }

  deleteSubtask(username: string, task_id: number) {
    return this.http.delete(`${BASE_URL}/subtask/delete?username=${username}&sub_task_id=${task_id}`);
  }

  createDailyStatus(payload: any) {
    return this.http.post(`${BASE_URL}/subtask/createdailystatus`, payload);
  }
  getDsrDetailsBySubtaskId(subtaskid: any) {
    return this.http.get(`${BASE_URL}/subtask/getdsrdetails?sub_task_id=${subtaskid}`);
  }
  deleteDsr(username: string, dsr_id: number) {
    return this.http.delete(`${BASE_URL}/subtask/deletedsr?username=${username}&dsr_id=${dsr_id}`);
  }
  getPhaseByProjectId(project_id: number) {
    return this.http.get(`${BASE_URL}/phase/getphasebyproject?project_id=${project_id}`);
  }

  createPhase(payload: any) {
    return this.http.post(`${BASE_URL}/phase/create`, payload);
  }

  updatePhase(payload: any) {
    return this.http.post(`${BASE_URL}/phase/update`, payload);
  }


  createRelease(payload: any) {
    return this.http.post(`${BASE_URL}/release/create`, payload);
  }
  updateRelease(payload: any) {
    return this.http.post(`${BASE_URL}/release/update`, payload);
  }
  getReleaseByProjectId(project_id: number) {
    return this.http.get(`${BASE_URL}/release/getreleasebyproject?project_id=${project_id}`);
  }

  // Dashboard ==========
  getDashboardDetailsByEmployeeId(employee_id: any, project_id: any) {
    return this.http.get(`${BASE_URL}/common/dashboarddetails?employee_id=${employee_id}&project_id=${project_id}`);
  }
  getActivityLogs(type: any, id: any, tag: any) {
    return this.http.get(`${BASE_URL}/common/gettasklog?type=${type}&id=${id}&tag=${tag}`);
  }


  createComments(payload: any) {
    return this.http.post(`${BASE_URL}/common/createcomments`, payload);
  }
  updatecomments(payload: any) {
    return this.http.post(`${BASE_URL}/common/updatecomments`, payload);
  }
  getComments(type: any, id: any,) {
    return this.http.get(`${BASE_URL}/common/getcommentsbyid?type=${type}&id=${id}`);
  }
  deleteComment(username: string, id: number) {
    return this.http.delete(`${BASE_URL}/common/deletecomment?username=${username}&id=${id}`);
  }

}
