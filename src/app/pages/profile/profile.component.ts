import { Component, ElementRef, OnInit, QueryList, ViewChildren } from '@angular/core';
import { AuthService } from 'src/app/core/services/auth.service';
import { CommonService } from 'src/app/core/services/common.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  cellEdit(e: any) {
    console.log(e);

  }
  users: any = [];
  columns: any = [];
  options: any = {};
  viewOptions: any = [];
  constructor(private authService: AuthService, private commonService: CommonService) { }
  ngOnInit(): void {
    this.getUsersAll();
    this.columns = [

      { title: "ID", field: "id", sorter: "number", width: 60, hozAlign: "center" },
      { title: "First Name", field: "firstname", editor: "input" },
      { title: "Last Name", field: "lastname", editor: "input" },
      { title: "Image", field: "image_url", formatter: "image", formatterParams: { height: "40px", width: "40px" } },
      { title: "Date of Birth", field: "date_of_birth", sorter: "date", editor: "date", editorParams: { min: "1900-01-01", max: "2100-12-31", format: "yyyy-MM-dd" } },
      { title: "Joining Date", field: "joining_date", sorter: "date", editor: "date", editorParams: { min: "1900-01-01", max: "2100-12-31", format: "yyyy-MM-dd" } },
      { title: "Gender", field: "gender", editor: "list", editorParams: { values: ['male', 'female', 'other'] } },
      { title: "Blood Group", field: "blood_group", editor: "list", editorParams: { values: ['happy'] } },
      { title: "Dept.name", field: "department_name", editor: "list", editorParams: { values: [] } },
      { title: "Position", field: "position", editor: "list", editorParams: { values: [] } },
      { title: "Shift", field: "shift", editor: "list", editorParams: { values: [] } },
      { title: "Marital Status", field: "marital_status", editor: "list", editorParams: { values: [] } },
      { title: "Mobile", field: "mobile", editor: "input" },
      { title: "Email", field: "email", editor: "input" },
      { title: "Alternate Email", field: "alternate_email", editor: "input" },
      { title: "Skype ID", field: "skypeid", editor: "input" },
      { title: "Created Date", field: "createddate", sorter: "datetime", editor: "input" },
      { title: "Updated Date", field: "updateddate", sorter: "datetime", editor: "input" },
      { title: "Attendance ID", field: "attendanceid", editor: "input" },
      { title: "Manager", field: "managerid", editor: "input" },
      // { title: "Sub Manager ID", field: "sub_manager_id", editor: "input" },
      { title: "WFH", field: "wfh", editor: "list", editorParams: { values: ['No', 'Yes'] } },
      { title: "Releaving Date", field: "joining_date", sorter: "datetime", editor: "datetime", editorParams: { min: "1900-01-01", max: "2100-12-31", format: "yyyy-MM-dd hh:mm:ss", step: 1 } },
      { title: "Releaving Remarks", field: "releaving_remarks", editor: "input" }
    ];
  }

  getUsersAll() {
    this.authService.getUsersAll().subscribe({
      next: (res) => {
        this.users = res;
        console.log(this.users);
        this.viewOptions = this.commonService.getFieldLabels(this.users)
      }, error: (err) => {
      }
    })
  }
}