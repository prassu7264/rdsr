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
import Swal from 'sweetalert2';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
declare var luxon: any
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
    private dialog: MatDialog,

  ) {

  }

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
  loadInitialData() {
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

    // --- FORMATTERS ---
    const profileFormatter = (cell: any) => {
      const row = cell.getData();
      const initials = (row.firstname[0] + (row.lastname ? row.lastname[0] : '')).toUpperCase();

      // Random-ish but consistent color based on ID
      const hues = [220, 260, 320, 160, 40]; // Blue, Purple, Pink, Green, Orange
      const hue = hues[row.id % hues.length];

      // Inline style for dynamic avatar color (HSL for ease)
      const style = `background-color: hsl(${hue}, 80%, 95%); color: hsl(${hue}, 70%, 40%);`;

      return `
          <div class="profile-wrapper">
              <div class="avatar" style="${style}">
                  ${row.profile_image_url
          ? `<img height="40" width="40" src="${row.profile_image_url}" onerror="this.style.display='none'; this.parentElement.innerText='${initials}'" />`
          : initials}
              </div>
              <div class="flex-col">
                  <span class="text-bold">${row.firstname} ${row.lastname}</span>
                  <span class="text-muted">${row.position}</span>
              </div>
          </div>
      `;
    };

    const contactFormatter = (cell: any) => {
      const row = cell.getData();
      return `
        <div class="flex-col">
            <div style="display:flex; align-items:center; gap:6px; font-size:var(--tblr-font-size); color:var(--text-primary);">
                <i class="ri-mail-line" style="color:var(--text-tertiary)"></i> ${row.email}
            </div>
            <div style="display:flex; align-items:center; gap:6px; font-size:var(--tblr-font-size); color:var(--text-secondary);">
                <i class="ri-phone-line" style="color:var(--text-tertiary)"></i> ${row.mobile || '--'}
            </div>
        </div>
    `;
    };

    const statusFormatter = function (cell: any) {
      const val = cell.getValue();
      if (val) {
        return `<span class="status-pill status-closed"><i class="ri-checkbox-circle-fill"></i> Active</span>`;
      }
      return `<span class="status-pill status-cancelled"><i class="ri-close-circle-fill"></i> Inactive</span>`;
    };

    const wfhFormatter = (cell: any) => {
      const isRemote = cell.getValue() == 1;
      return isRemote
        ? `<span class="badge badge-info"><i class="ri-home-wifi-line"></i> Remote</span>`
        : `<span class="text-sub" style="margin-left:8px;">In Office</span>`;
    };

    const dateFormatter = (cell: any) => {
      const val = cell.getValue();
      if (!val) return "-";
      const dt = luxon.DateTime.fromISO(val);
      return `<div class="flex-col"><span class="text-bold" style="font-size:var(--tblr-font-size);">${dt.toFormat('dd MMM yyyy')}</span><span class="text-muted">${dt.toRelative()}</span></div>`;
    };
    this.columns = [
      { title: "ID", field: "id", sorter: "number", hozAlign: "center", formatter: (cell: any) => `<span class="text-light-gray">EMP-${cell.getValue()}</span>` },
      {
        title: "Employee", field: "firstname", formatter: profileFormatter, widthGrow: 2, minWidth: 240, headerSort: false, edit: "input"
      },
      {
        title: "Contact Info", field: "email", formatter: contactFormatter, width: 220, headerSort: false
      },
      {
        title: "Shift", field: "shift_type", width: 140,
        editor: "list", editorParams: { values: ["Day Shift", "Night Shift", "Rotational"] },
        formatter: (cell: any) => `<span style="font-weight:500; font-size:var(--tblr-font-size);">${cell.getValue()}</span>`
      },

      {
        title: "Joined", field: "joining_date", formatter: dateFormatter, width: 150,
        editor: "date", editorParams: { format: "yyyy-MM-dd" }
      },
      {
        title: "Location", field: "wfh", formatter: wfhFormatter, width: 130, hozAlign: "center",
        editor: "list", editorParams: { values: [{ label: "Remote", value: 1 }, { label: "Office", value: 0 }] }
      },
      {
        title: "Status", field: "isactive", formatter: statusFormatter, width: 120, hozAlign: "center",
        editor: "list", editorParams: { values: [{ label: "Active", value: 1 }, { label: "Inactive", value: 0 }] }
      },
      { title: "Attendance ID", field: "attendanceid", editor: "input" },
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

      {
        title: "Releaving Remarks", field: "releaving_remarks", formatter: dateFormatter, width: 150,
        editor: "date", editorParams: { format: "yyyy-MM-dd" }
      },
      {
        title: "Created Date", field: "createddate", sorter: "datetime"
      },
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
          if (this.storageService.roles.isAdmin || this.storageService.roles.isManager) {
            const rowData = cell.getRow().getData();
            if (e.target.classList.contains("edit")) {
              this.selectedUser = rowData;
              console.log("Edit:", rowData);
              this.viewSelector.toggleFilter();
            }

            if (e.target.classList.contains("delete")) {
              Swal.fire({
                title: "Are you sure?",
                text: "You won't be able to revert this!",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: "Yes, delete it!"
              }).then((result) => {
                if (result.isConfirmed) {
                  this.deleteUser(rowData.id);
                }
              });
            }

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
      editTriggerEvent: this.storageService.roles.isAdmin || this.storageService.roles.isManager ? "dblclick" : '',
      paginationSizeSelector: [5, 10, 15, 25, 35, 45, 100],
      columnDefaults: { tooltip: true },
      groupBy: viewby,
      groupStartOpen: true,
      groupHeader: function (value: any, count: any, data: any, group: any) {
        return `
              <div class="flex-row">
                  <i class="ri-stack-line" style="color: var(--primary); font-size: 16px;"></i>
                  <span class="text-main text-bold">${value || 'Unassigned'}</span>
                  <span class="text-muted" style="font-weight: 400;">(${count} Users)</span>
              </div>
          `;
      },
    };

    this.table = new Tabulator(
      this.el.nativeElement.querySelector('.tabulator-table'),
      { ...defaultOptions, ...this.options }
    );

    this.table.on("cellEdited", (cell: any) => {
      this.updateUser(cell.getRow().getData())
      if (cell.getColumn().getField() == 'department_name') {
        let obj = this.commonService.getObjectByField(this.departmentList, 'department_name', cell.getRow().getData().department_name);
        this.getDesignationByDepartment(obj.id);
      }
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
        if (this.table) {
          this.table.replaceData(this.users);
        }
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
        this.getUsersAll();
      }, error: (err) => {
        this.toasterService.error(err?.error?.message);
      }
    });
  }
  deleteUser(userId: any) {
    const username = this.storageService.getUsername();
    this.authService.deleteUser(userId, username).subscribe({
      next: (res: any) => {
        this.toasterService.success(res.message);
        this.getUsersAll();
      }, error: (err => {
        this.toasterService.error(err?.error?.message);
      })
    })
  }
}
