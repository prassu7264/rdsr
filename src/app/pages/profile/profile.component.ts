import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  OnDestroy,
  OnChanges,
  SimpleChanges,
  TemplateRef,
  ViewChild
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { AuthService } from 'src/app/core/services/auth.service';
import { CommonService } from 'src/app/core/services/common.service';
import { StorageService } from 'src/app/core/services/storage.service';
import { ToasterService } from 'src/app/core/services/toaster.service';
import { ViewSelectorComponent } from 'src/app/shared/components/view-selector/view-selector.component';
import { TabulatorFull as Tabulator } from 'tabulator-tables';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit, AfterViewInit, OnDestroy, OnChanges {
  @ViewChild('dialog') dialogTemplate!: TemplateRef<any>;
  @ViewChild(ViewSelectorComponent) viewSelector!: ViewSelectorComponent;
  shifts: any = [];
  designations: any = [];
  departments: any = [];
  departmentList: any = []
  users: any = [];
  columns: any = [];
  options: any = {};
  viewOptions: any = [];
  selectedUser: any;
  private table: Tabulator | undefined;

  constructor(
    private el: ElementRef,
    private authService: AuthService,
    private commonService: CommonService,
    private toasterService: ToasterService,
    private storageService: StorageService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.loadInitialData();

  }

  ngAfterViewInit(): void {

  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.table && changes['users'] && !changes['users'].firstChange) {
      this.table.replaceData(this.users);
    }
  }

  ngOnDestroy(): void {
    if (this.table) this.table.destroy();
  }

  /* ------------------------------------------------------
      LOAD ALL BASIC DATA FIRST
  ------------------------------------------------------ */
  private loadInitialData() {
    this.getAllDepartments(() => {
      this.getUsersAll(() => {
        this.initTable();
      });
    });
  }

  /* ------------------------------------------------------
      INIT TABULATOR TABLE
  ------------------------------------------------------ */
  private initTable(viewby: any = "") {
    this.departments = this.commonService.formatForTabulator(this.departmentList, "department_name");
    this.columns = [
      { title: "ID", field: "id", sorter: "number", width: 60, hozAlign: "center" },
      {
        title: "Profile Image",
        field: "profile_image_url",
        formatter: "image",
        frozen: true,
        formatterParams: { height: "40px", width: "40px" }
      },

      { title: "First Name", field: "firstname", editor: "input" },
      { title: "Last Name", field: "lastname", editor: "input" },

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
        editorParams: {
          values: ["A+", "A-", "O+", "O-", "B+", "B-", "AB+", "AB-"]
        }
      },

      {
        title: "Department",
        field: "department_name",
        editor: "list",
        editorParams: {
          values: this.departments
        }
      },

      {
        title: "Position",
        field: "position",
        editor: "list",
        editorParams: {
          values: this.designations
        }
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
        editorParams: {
          values: ["Single", "Married", "Divorced", "Widow"]
        }
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

      { title: "Releaving Remarks", field: "releaving_remarks", editor: "textarea" },

      {
        title: "Created Date", field: "createddate", sorter: "datetime"      },
      { title: "Updated Date", field: "updateddate", sorter: "datetime" },
      {
        title: "Actions",
        field: "actions",
        headerSort: false,
        frozen: true,
        hozAlign: "center",
        formatter: () => {
          return `
            <button 
              style="border:none;background:transparent;cursor:pointer;padding:4px;">
              <i class="ri-edit-2-line edit" style="font-size:18px;color:#1976d2;"></i>
            </button>
        
            <button 
              style="border:none;background:transparent;cursor:pointer;padding:4px;">
              <i class="ri-delete-bin-6-line delete" style="font-size:18px;color:#d32f2f;"></i>
            </button>
          `;
        }
        ,
        cellClick: (e: any, cell: any) => {
          const rowData = cell.getRow().getData();
          if (e.target.classList.contains("edit")) {
            this.selectedUser = rowData;
            console.log("Edit:", rowData);
            this.viewSelector.toggleFilter();
          }

          if (e.target.classList.contains("delete")) {
            console.log("Delete:", rowData);
            this.deleteUser(rowData.id)
          }

        }
      }
    ];

    const defaultOptions = {
      data: this.users,
      columns: this.columns,
      movableColumns: true,
      resizableRows: true,
      movableRows: true,
      pagination: "local",
      paginationSize: 15,
      editTriggerEvent: "dblclick",
      paginationSizeSelector: [5, 10, 15, 25, 35, 45, 100],
      columnDefaults: { tooltip: true },
      groupBy: viewby,
    };

    this.table = new Tabulator(
      this.el.nativeElement.querySelector('.tabulator-table'),
      { ...defaultOptions, ...this.options }
    );

    this.table.on("cellEdited", (cell: any) => {
      this.updateUser(cell.getRow().getData())
      if (cell.getColumn().getField() == 'department_name') {
        console.log("departmentList", this.departmentList);

        let obj = this.commonService.getObjectByField(this.departmentList, 'department_name', cell.getRow().getData().department_name)
        console.log(obj);

        this.getDesignationByDepartment(obj.id);
      }

      this.getUsersAll();
    });

  }

  /* ------------------------------------------------------
     VIEW FUNCTIONS
  ------------------------------------------------------ */
  onViewSelected(item: any) {
    this.initTable(item.id);
  }

  onCreateCustomView() {
    console.log('Parent received Create Custom View click!');
  }

  /* ------------------------------------------------------
     API CALLS
  ------------------------------------------------------ */
  getUsersAll(callback?: Function) {
    this.authService.getUsersAll().subscribe({
      next: (res) => {
        this.users = res;
        this.viewOptions = this.commonService.getFieldLabels(this.users);
        if (callback) callback();
      }
    });
  }

  getAllDepartments(callback?: Function) {
    this.authService.getAllDepartments().subscribe({
      next: (res: any) => {
        this.departmentList = res;
        this.departments = this.commonService.formatForTabulator(res, "department_name");
        if (callback) callback();
      }
    });
  }

  getAllShifts() {
    this.authService.getAllShifts().subscribe({
      next: (res) => this.shifts = res
    });
  }

  getDesignationByDepartment(e: any, callback?: Function) {
    this.authService.getDesignationByDepartment(e).subscribe({
      next: (res: any) => {
        this.designations = res
        this.designations = this.commonService.formatForTabulator(res, "position");
        this.initTable();
        if (callback) callback();
      }
    });
  }

  updateUser(payload: any) {
    payload.username = this.storageService.getUsername();
    this.authService.updateUser(payload).subscribe({
      next: (res: any) => {
        this.toasterService.success(res.message);
      }, error: (err) => {
        this.toasterService.error(err?.error?.message);
      }
    });
  }
  deleteUser(userId: any) {
    const username = this.storageService.getUsername();
    this.authService.deleteUser(userId, username).subscribe({
      next: (res: any) => {
        this.toasterService.success(res.message)
      }, error: (err => {
        this.toasterService.error(err?.error?.message);
      })
    })
  }
}
