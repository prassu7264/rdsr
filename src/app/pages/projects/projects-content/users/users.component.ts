import { Component, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { CommonService } from 'src/app/core/services/common.service';
import { StorageService } from 'src/app/core/services/storage.service';
import { ToasterService } from 'src/app/core/services/toaster.service';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
declare var luxon: any
@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent {
  isFilterOpen: any = false;
  viewOptions: any = {}
  shifts: any = []
  columns: any;
  users: any = [];
  private table: Tabulator | undefined;
  employeeList: any[] = [];
  projectid: any = 0;
  isTeamDropdownOpen = false;
  projectForm: FormGroup = this.fb.group({
    employee_list: [[]],
    username: [this.storageService.getUsername()]
  });
  selectedProject: any;
  teamSearch = '';
  constructor(private el: ElementRef, private commonService: CommonService, private fb: FormBuilder, private route: ActivatedRoute, private toasterService: ToasterService, private storageService: StorageService, private authService: AuthService) {
    this.projectid = this.route.snapshot.paramMap.get('id');

  }
  ngOnInit(): void {
    this.loadInitialData();
    this.getEmployeelistByProjectId();
    this.projectForm.get('employee_list')?.setValidators(Validators.required);
  }


  ngOnDestroy(): void {
    if (this.table) this.table.destroy();
  }

  /* ------------------------------------------------------
      LOAD ALL BASIC DATA FIRST
  ------------------------------------------------------ */
  loadInitialData() {
    this.getprojectmembersById(() => {
      this.initTable();
    });
  }

  toggleSideTab(type?: any) {
    this.isFilterOpen = !this.isFilterOpen;
    if (type === 'New') {
      // this.onCancel();
    }
  }
  onViewSelected(item: any) {
    this.initTable(item.id);
  }

  private initTable(viewby: any = "") {


    // --- FORMATTERS ---
    const profileFormatter = (cell: any) => {
      const row = cell.getData();
      const initials = (row.firstname[0] + (row.lastname ? row.lastname[0] : '')).toUpperCase();

      const hues = [220, 260, 320, 160, 40];
      const hue = hues[row.id % hues.length];


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
            <div style="display:flex; align-items:center; gap:6px; font-size:12px; color:var(--text-primary);">
                <i class="ri-mail-line" style="color:var(--text-tertiary)"></i> ${row.email}
            </div>
            <div style="display:flex; align-items:center; gap:6px; font-size:11px; color:var(--text-secondary);">
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
      return `<span class="status-pill status-cancelled"><i class="ri-close-circle-fill"></i> Closed</span>`;
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
        formatter: (cell: any) => `<span style="font-weight:500; font-size:12px;">${cell.getValue()}</span>`
      },
      {
        title: "Status", field: "isactive", formatter: statusFormatter, width: 120, hozAlign: "center",
        editor: "list", editorParams: { values: [{ label: "Active", value: 1 }, { label: "Inactive", value: 0 }] }
      },


    ];

    const defaultOptions: any = {
      data: this.users,
      columns: this.columns,
      movableColumns: true,
      resizableRows: true,
      movableRows: true,
      pagination: "remote",
      layout: "fitDataFill",
      paginationSize: 15,
      editTriggerEvent: "dblclick",
      paginationSizeSelector: [5, 10, 15, 25, 35, 45, 100],
      columnDefaults: { tooltip: true },
      groupBy: viewby,
      groupStartOpen: true,
      groupHeader: function (value: any, count: any, data: any, group: any) {
        return `
              <div class="flex-row">
                  <i class="ri-stack-line" style="color: var(--primary); font-size: 16px;"></i>
                  <span class="text-main text-bold">${value || 'Unassigned'}</span>
                  <span class="text-muted" style="font-weight: 400;">(${count} projects)</span>
              </div>
          `;
      },
    };

    this.table = new Tabulator(
      this.el.nativeElement.querySelector('.tabulator-table'),
      defaultOptions
    );

    this.table.on("cellEdited", (cell: any) => {

    });

  }


  /* ------------------------------------------------------
    API CALLS
 ------------------------------------------------------ */
  getprojectmembersById(callback?: Function) {
    this.authService.getprojectmembersById(this.projectid).subscribe({
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

  getEmployeelistByProjectId() {
    this.authService.getEmployeelistByProjectId(this.projectid).subscribe({
      next: (res: any) => {
        this.employeeList = res?.employee_list;
        this.projectForm.get('employee_list')?.setValue(res?.assigned_employee_list.map((e: any) => e.id));
        this.selectedProject = res?.project;
      }
    });
  }

  get rf() {
    return {
      employee_list: this.projectForm.get('employee_list'),
      projectid: this.projectForm.get('projectid'),
    };
  }
  // --- Logic for Multi-Select ---
  get filteredEmployees() {
    if (!this.teamSearch) return this.employeeList;
    const term = this.teamSearch.toLowerCase();
    return this.employeeList.filter(e => e?.employee_name?.toLowerCase().includes(term));
  }
  get selectedEmployeeIds(): number[] {
    return this.projectForm.get('employee_list')?.value || [];
  }
  getInitials(name: string): string {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }
  getEmployeeName(id: number): string {
    const emp = this.employeeList.find(e => e.id === id);
    return emp ? emp.employee_name : 'Unknown';
  }
  isEmployeeSelected(id: number): boolean {
    return this.selectedEmployeeIds.includes(id);
  }
  toggleEmployee(id: number) {
    const currentIds = this.selectedEmployeeIds;
    if (currentIds.includes(id)) {
      this.projectForm.patchValue({ employee_list: currentIds.filter(existingId => existingId !== id) });
    } else {
      this.projectForm.patchValue({ employee_list: [...currentIds, id] });
    }
    this.projectForm.get('employee_list')?.markAsDirty();
  }
  getAvatarColor(id: number): string {
    const colors = ['#E0E7FF', '#FEE2E2', '#DCFCE7', '#FEF3C7', '#F3E8FF'];
    return colors[id % colors.length];
  }

  onSubmit() {
    this.selectedProject = { ...this.selectedProject, ...this.projectForm.value }
    this.authService.updateProject(this.selectedProject).subscribe({
      next: ((res: any) => {
        this.toasterService.success(res?.message);
        this.loadInitialData();
        this.toggleSideTab();
      }),
      error: (err: any) => {
        this.toasterService.error(err?.error?.message);
      }
    })
  }

  onCancel() { }
}
