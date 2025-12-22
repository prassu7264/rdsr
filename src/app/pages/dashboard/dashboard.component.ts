import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { StorageService } from 'src/app/core/services/storage.service';
import { ProjectTeamReportComponent } from './charts/project-team-report/project-team-report.component';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  isAdmin: any = true;
  empId: any = 0;
  today = new Date();
  dashboardData: any;
  mytask: any = []
  @ViewChild(ProjectTeamReportComponent) projectTeamReportComponent: ProjectTeamReportComponent | undefined;
  constructor(private authService: AuthService, public storageService: StorageService, private router: Router) {
  }
  ngOnInit(): void {
    this.empId = this.storageService.getEmpId();
    this.getDashboardDetailsByEmployeeId(this.empId)
  }
  getDashboardDetailsByEmployeeId(empId: any) {
    this.authService.getDashboardDetailsByEmployeeId(empId, 0).subscribe({
      next: (res) => {
        this.dashboardData = res;
        
      }, error: (err) => { }
    })
  }
  navigateToPage(type: any) {
    this.router.navigate(["main/" + type])
  }
  onDepartmentChange(event: any) {
    this.projectTeamReportComponent?.onDepartmentChange(event);
  }
}
