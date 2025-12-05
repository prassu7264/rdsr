import { Component } from '@angular/core';
import { AuthService } from 'src/app/core/services/auth.service';
import { CommonService } from 'src/app/core/services/common.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  shifts: any = [];
  designations: any = [];
  departments: any = [];
  users: any = [];
  columns: any = [];
  options: any = {};
  viewOptions: any = [];
  constructor(private authService: AuthService, private commonService: CommonService) {
    this.getAllDepartments();
    this.departments = commonService.formatForTabulator(this.departments, 'department_name')
  }
  ngAfterViewInit(): void {


  }

  ngOnInit(): void {

    this.getUsersAll();
    console.log(this.departments);

    this.columns = [
      { title: "ID", field: "id", sorter: "number", width: 60, hozAlign: "center" },
      {
        title: "Profile Image",
        field: "profile_image_url",
        formatter: "image", frozen: true,
        formatterParams: { height: "40px", width: "40px" }
      },
      { title: "First Name", field: "firstname", editor: "input", },
      { title: "Last Name", field: "lastname", editor: "input", },

      {
        title: "Date of Birth",
        field: "date_of_birth",
        sorter: "date",
        editor: "date",
        editorParams: { min: "1900-01-01", max: "2100-12-31", format: "yyyy-MM-dd" }
      },

      {
        title: "Joining Date",
        field: "joining_date",
        sorter: "date",
        editor: "date",
        editorParams: { min: "1900-01-01", max: "2100-12-31", format: "yyyy-MM-dd" }
      },


      {
        title: "Gender",
        field: "gender",
        editor: "list",
        editorParams: { values: ["male", "female", "other"] }
      },

      {
        title: "Blood Group",
        field: "blood_group",
        editor: "list",
        editorParams: { values: ["A+", "A-", "O+", "O-", "B+", "B-", "AB+", "AB-"] }
      },

      {
        title: "Department",
        field: "department_name",
        editor: "list",
        editorParams: {
          values: this.departments
        }
      }
      ,
      {
        title: "Position",
        field: "position",
        editor: "list",
        editorParams: { values: ["A+", "A-", "O+", "O-", "B+", "B-", "AB+", "AB-"] }
      },

      {
        title: "Shift Type",
        field: "shift_type",
        editor: "list",
        editorParams: { values: ["Morning", "General", "Night"] }
      },

      {
        title: "Marital Status",
        field: "marital_status",
        editor: "list",
        editorParams: { values: ["Single", "Married", "Divorced", "Widow"] }
      },

      { title: "Mobile", field: "mobile", editor: "input" },
      { title: "Email", field: "email", editor: "input" },
      { title: "Alternate Email", field: "alternate_email", editor: "input" },
      { title: "Skype ID", field: "skypeid", editor: "input" },


      { title: "Attendance ID", field: "attendanceid", editor: "input" },

      {
        title: "WFH",
        field: "wfh",
        editor: "list",
        editorParams: { values: ["No", "Yes"] }
      },

      // {
      //   title: "Is Active",
      //   field: "isactive",
      //   editor: "list",
      //   editorParams: { values: ["0", "1"] }
      // },

      // {
      //   title: "Is Deleted",
      //   field: "isdelete",
      //   editor: "list",
      //   editorParams: { values: ["0", "1"] }
      // }, 
      {
        title: "Releaving Date",
        field: "releaving_date",
        sorter: "datetime",
        editor: "datetime",
        editorParams: {
          min: "1900-01-01",
          max: "2100-12-31",
          format: "yyyy-MM-dd HH:mm:ss",
          step: 1
        }
      },

      { title: "Releaving Remarks", field: "releaving_remarks", editor: "input" },

      { title: "Created Date", field: "createddate", sorter: "datetime" },
      { title: "Updated Date", field: "updateddate", sorter: "datetime" },

    ];

  }
  cellEdit(e: any) {
    console.log(e);

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
  getAllDepartments() {
    this.authService.getAllDepartments().subscribe({
      next: (res) => {
        this.departments = []
        this.departments = res;
        this.getUsersAll()
      }, error: (err) => {

      }
    })
  }
  getAllShifts() {
    this.authService.getAllShifts().subscribe({
      next: (res) => {
        this.shifts = res;
      }, error: (err) => {

      }
    })
  }
  getDesignationByDepartment(e: any) {
    this.authService.getDesignationByDepartment(e).subscribe({
      next: (res) => {
        this.designations = res;

      }, error: (err) => {

      }
    })
  }
}