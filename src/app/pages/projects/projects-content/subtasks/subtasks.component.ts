import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { CommonService } from 'src/app/core/services/common.service';
import { LayoutService } from 'src/app/core/services/layout.service';
import { StorageService } from 'src/app/core/services/storage.service';

@Component({
  selector: 'app-subtasks',
  templateUrl: './subtasks.component.html',
  styleUrls: ['./subtasks.component.scss']
})
export class SubtasksComponent implements OnInit, AfterViewInit {
  projectid: any = 0;
  empid: any = 0;
  taskid: any = 1;
  taskList: any = [];
  viewOptions: any = {}
  panelOpenState = false;
  selectedTask: any = {}
  activeProjectTab: any = "";
  constructor(private authService: AuthService, private route: ActivatedRoute,
    private layoutService: LayoutService, private router: Router,
    private storageService: StorageService, private commonService: CommonService) {
    this.projectid = this.route.snapshot.paramMap.get('id');
    this.empid = this.storageService.getEmpId();
    this.taskid = this.route.snapshot.paramMap.get('taskid');
  }
  setActiveTab(tab: string) {
    this.activeProjectTab = tab;
  }

  ngAfterViewInit(): void {
    Promise.resolve().then(() => {
      this.layoutService.initResponsiveTabs();
      this.activeProjectTab = sessionStorage.getItem("activeProjectTab") || "tasks";
    });

    const toggleBtn: any = document.getElementById('toggleBtn');
    const closeBtn: any = document.getElementById('closeBtn');
    const sidebar: any = document.getElementById('sidebar');

    function toggleSidebar() {
      sidebar.classList.toggle('toggled');
    }
    toggleBtn.addEventListener('click', toggleSidebar);
    closeBtn.addEventListener('click', toggleSidebar);
  }
  ngOnInit(): void {
    this.getTasksByProjectIdNdEmployeeId();
  }

  getTasksByProjectIdNdEmployeeId(callback?: Function) {
    this.authService.getTasksByProjectIdNdEmployeeId(this.projectid, this.empid || 0).subscribe({
      next: (res: any) => {
        this.taskList = res
        this.viewOptions = this.commonService.getFieldValuesByTasks(this.taskList, 'task');
        this.selectedTask = this.taskList.find((item: any) => item.id == this.taskid);
        console.log(this.selectedTask);

        if (callback) callback();
      }
    });
  }
  onTaskSelect(e: any, task: any) {
    this.selectedTask = task;
    this.router.navigate([
      '/main/projects/projects-content',
      this.projectid,
      e.target.value
    ]);

  }
  onTaskEdit(e: any) {
    const value = (e.target as HTMLElement).innerText.trim();
    console.log(value);

  }
}
