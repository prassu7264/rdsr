import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { StorageService } from 'src/app/core/services/storage.service';

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
  projectid: any = 0
  constructor(private authService: AuthService, public storageService: StorageService, private router: Router, private route: ActivatedRoute) {
    this.projectid = this.route.snapshot.paramMap.get('id');
  }
  ngOnInit(): void {
    this.empId = this.storageService.getEmpId();
    this.getDashboardDetailsByEmployeeId(this.empId)
  }
  getDashboardDetailsByEmployeeId(empId: any) {
    this.authService.getDashboardDetailsByEmployeeId(empId, this.projectid).subscribe({
      next: (res) => {
        this.dashboardData = res;

      }, error: (err) => { }
    })
  }
  navigateToPage(type: any) {
    this.router.navigate(["main/" + type])
  }

}
