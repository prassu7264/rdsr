import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { CommonService } from 'src/app/core/services/common.service';
import { StorageService } from 'src/app/core/services/storage.service';
import { ToasterService } from 'src/app/core/services/toaster.service';
import { TableFilterComponent } from 'src/app/shared/components/table-filter/table-filter.component';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
declare var luxon: any
@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss']
})
export class ProjectsComponent {
  private table: Tabulator | undefined;
  @ViewChild(TableFilterComponent) viewSelector!: TableFilterComponent;
  isFilterOpen = false;
  viewOptions: any = {};

  selectedProject: any;
  toggleSideTab(type?: any) {
    this.isFilterOpen = !this.isFilterOpen;
    if (type === 'New') {
      this.onCancel();
    }
  }
  constructor(
    private el: ElementRef,
    private router: Router,
    private fb: FormBuilder,
    private toasterService: ToasterService,
    private authService: AuthService,
    private commonService: CommonService,
    private storageService: StorageService
  ) { }

  managerList: any[] = [];
  employeeList: any[] = [];
  projectList: any[] = [];
  departmentList: any[] = []
  columns: any = [];

  projectForm: FormGroup = this.fb.group({
    id: ['0'],
    project_title: ['', Validators.required],
    description: [''],
    deptid: [null, Validators.required],
    start_date: ['', Validators.required],
    end_date: ['', Validators.required],
    assigned_manager: [null, Validators.required],
    client: ['', Validators.required],
    ispublic: [false],
    username: this.storageService.getUsername(),
    employee_list: [[]]
  });

  isEditMode = false;
  isTeamDropdownOpen = false;
  teamSearch = '';

  ngOnInit() {
    // --- CONDITIONAL LOGIC ---
    this.projectForm.get('ispublic')?.valueChanges.subscribe(isPublic => {
      const deptControl = this.projectForm.get('deptid');
      const teamControl = this.projectForm.get('employee_list');

      if (isPublic) {
        deptControl?.disable();
        deptControl?.clearValidators();
        teamControl?.clearValidators();
        // Also clear values if you want them empty when public
        // deptControl?.setValue(null);
        // teamControl?.setValue([]);
      } else {
        deptControl?.enable();
        deptControl?.setValidators(Validators.required);
        teamControl?.setValidators(Validators.required);
      }

      deptControl?.updateValueAndValidity();
      teamControl?.updateValueAndValidity();
    });

    // Initial state check
    this.projectForm.get('employee_list')?.setValidators(Validators.required);

    this.loadData();
    this.loadInitialData();
  }

  /* ------------------------------------------------------
     LOAD ALL BASIC DATA FIRST
 ------------------------------------------------------ */
  loadInitialData() {
    this.getProjects(() => {
      this.initTable();
    });
  }

  /* ------------------------------------------------------
      INIT TABULATOR TABLE
  ------------------------------------------------------ */
  private initTable(viewby: any = "") {

    const ownerFormatter = function (cell: any) {
      const name = cell.getValue();
      const initial = name ? name.charAt(0).toUpperCase() : '?';
      const colors = ['bg-blue', 'bg-purple', 'bg-pink', 'bg-indigo', 'bg-teal'];
      const colorClass = colors[cell.getData().id % colors.length];

      return `
          <div class="flex-row">
              <div class="avatar-circle ${colorClass}">${initial}</div>
              <span class="text-main truncate">${name}</span>
          </div>
      `;
    };

    const statusFormatter = function (cell: any) {
      const val = cell.getValue();
      if (val === true) {
        return `<span class="status-pill status-active"><i class="ri-checkbox-circle-fill"></i> Active</span>`;
      }
      return `<span class="status-pill status-closed"><i class="ri-close-circle-fill"></i> Closed</span>`;
    };

    const taskNameFormatter = function (cell: any) {
      const row = cell.getData();
      // <span class="text-muted">${row.description || 'No description'}</span>
      return `
          <div class="task-cell-wrapper">
              <div class="flex-row">
                  <div class="icon-box">
                      <i class="ri-folder-3-line"></i>
                  </div>
                  <div class="flex-col">
                      <span class="text-main text-bold">${row.project_title}</span>
                      <span class="text-muted">${row.description || 'No description'}</span>
                  </div>
              </div>
              <button class="access-btn">
                  Open <i class="ri-arrow-right-line"></i>
              </button>
          </div>
      `;
    };

    const clientFormatter = function (cell: any) {
      const val = cell.getValue();
      return `
          <div class="client-pill">
              <i class="ri-building-line" style="color:var(--text-muted)"></i> 
              <span>${val}</span>
          </div>`;
    }

    const dateWithRelativeFormatter = function (cell: any) {
      const val = cell.getValue();
      if (!val) return "-";
      const dt = luxon.DateTime.fromISO(val);
      if (!dt.isValid) return val;

      const relative = dt.toRelative();

      return `
          <div class="flex-col">
              <span class="text-main">${dt.toFormat('MM-dd-yyyy')}</span>
              <span class="text-muted">${relative}</span>
          </div>
      `;
    }


    const taskProgressFormatter = (cell: any) => {
      const row = cell.getData();
      const done = row.tasks_done || 0;
      const pending = row.tasks_pending || 0;
      const total = done + pending;

      // Calculate percentage
      const pct = total === 0 ? 0 : Math.round((done / total) * 100);

      // Render: [Done] [Bar with Text Inside] [Pending]
      return `
          <div class="task-progress-container">
              <span class="task-count">${done}</span>
              <div class="task-bar-track">
                  <div class="task-bar-fill" style="width: ${pct}%"></div>
                  <span class="task-bar-text">${pct} %</span>
              </div>
              <span class="task-count right">${pending}</span>
          </div>
      `;
    };
    this.columns = [

      {
        title: "ID",
        field: "id",
        width: 80,
        formatter: (cell: any) => `<span class="text-light-gray">PRJ-${cell.getValue()}</span>`
      },

      {
        title: "Project Name",
        field: "project_title",
        frozen: true,
        formatter: taskNameFormatter,
        minWidth: 250,
        widthGrow: 2,
        editor: "input",
        cellClick: (e: any, cell: any) => {
          // Access Button Logic
          if (e.target.closest('.access-btn')) {
            e.stopPropagation();
            const rowData = cell.getRow().getData();
            localStorage.setItem('projectDetails', JSON.stringify(rowData));
            this.router.navigate([`/main/projects/projects-content/${rowData.id}`]);
          }
        }
      },
      {
        title: "Owner",
        field: "manager_name",
        formatter: ownerFormatter,

        editor: "list",
        editorParams: {
          values: this.commonService.formatForTabulator(this.managerList, 'employee_name'),
          // autocomplete: true,
          // clearable: true
        }
      },
      {
        title: "Start Date",
        field: "start_date",
        formatter: dateWithRelativeFormatter,
        editor: "date",
        editorParams: {
          format: "yyyy-MM-dd",
        }
      },
      {
        title: "Due Date",
        field: "end_date",
        formatter: dateWithRelativeFormatter,
        width: 140,
        editor: "date",
        editorParams: {
          format: "yyyy-MM-dd",
        }
      },
      {
        title: "Client",
        field: "client",
        minWidth: 140,
        editor: "input", formatter: clientFormatter
      },
      {
        title: "Status",
        field: "isactive",
        formatter: statusFormatter,
        hozAlign: "center",
        editor: "list",
        editorParams: {
          values: [
            { label: "Active", value: true },
            { label: "Closed", value: false }
          ]
        }
      },
      {
        title: "Tasks", field: "tasks_done", width: 180, headerSort: false,
        formatter: taskProgressFormatter, editor: "number", editorParams: { min: 0, max: 100 }
      },
      { title: "Description", field: "description", editor: "textarea" },

      {
        title: "Created Date", field: "created_date", sorter: "datetime"
      },
      { title: "Updated Date", field: "created_date", sorter: "datetime" },
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
            console.log("Edit:", rowData);
            this.selectedProject = rowData;
            this.patchProjectForm(rowData);
            this.toggleSideTab();
          }

          if (e.target.classList.contains("delete")) {

          }

        }
      }
    ];

    const defaultOptions: any = {
      data: this.projectList,
      columns: this.columns,
      movableColumns: true,
      resizableRows: true,
      movableRows: true,
      pagination: "local",
      paginationSize: 15,
      // editTriggerEvent: "dblclick",
      paginationSizeSelector: [5, 10, 15, 25, 35, 45, 100],
      columnDefaults: { tooltip: true },
      groupBy: viewby,
      resizableColumnFit: true,
      layout: "fitDataStretch",
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
      this.selectedProject = cell.getRow().getData();
      this.updateProject();
      if (cell.getField() === "project_title" || cell.getField() === "manager_name") {
        cell.getRow().reformat();
      }

    });

  }

  get isPublic() {
    return this.projectForm.get('ispublic')?.value;
  }

  get rf() {
    return {
      project_title: this.projectForm.get('project_title'),
      description: this.projectForm.get('description'),
      deptid: this.projectForm.get('deptid'),
      start_date: this.projectForm.get('start_date'),
      end_date: this.projectForm.get('end_date'),
      assigned_manager: this.projectForm.get('assigned_manager'),
      client: this.projectForm.get('client'),
      ispublic: this.projectForm.get('ispublic'),
      username: this.projectForm.get('username'),
      employee_list: this.projectForm.get('employee_list')
    };
  }

  // --- Logic for Multi-Select ---
  get filteredEmployees() {
    if (!this.teamSearch) return this.employeeList;
    const term = this.teamSearch.toLowerCase();
    return this.employeeList.filter(e => e.employee_name.toLowerCase().includes(term) || e.role.toLowerCase().includes(term));
  }

  get selectedEmployeeIds(): number[] {
    return this.projectForm.get('employee_list')?.value || [];
  }

  getEmployeeName(id: number): string {
    const emp = this.employeeList.find(e => e.id === id);
    return emp ? emp.employee_name : 'Unknown';
  }

  getInitials(name: string): string {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  getAvatarColor(id: number): string {
    const colors = ['#E0E7FF', '#FEE2E2', '#DCFCE7', '#FEF3C7', '#F3E8FF'];
    return colors[id % colors.length];
  }

  isEmployeeSelected(id: number): boolean {
    return this.selectedEmployeeIds.includes(id);
  }

  toggleEmployee(id: number) {
    if (this.isPublic) return;

    const currentIds = this.selectedEmployeeIds;
    if (currentIds.includes(id)) {
      this.projectForm.patchValue({ employee_list: currentIds.filter(existingId => existingId !== id) });
    } else {
      this.projectForm.patchValue({ employee_list: [...currentIds, id] });
    }
    this.projectForm.get('employee_list')?.markAsDirty();
  }

  onSubmit() {
    console.log(this.projectForm.value);
    console.log('Project Data:', this.projectForm.value);
    if (!this.projectForm.valid) {
      this.projectForm.markAllAsTouched();
      return;
    }
    if (this.isEditMode) {
      this.selectedProject = { ...this.selectedProject, ...this.projectForm.value }
      this.authService.updateProject(this.selectedProject).subscribe({
        next: ((res: any) => {
          this.toasterService.success(res?.message);
          this.loadInitialData();
          this.isEditMode = false
        }),
        error: (err: any) => {
          this.toasterService.error(err?.error?.message);
        }
      })
    } else {

      this.authService.createProject(this.projectForm.value).subscribe({
        next: ((res: any) => {
          this.toasterService.success(res?.message);
          this.loadInitialData();
        }),
        error: (err: any) => {
          this.toasterService.error(err?.error?.message);
        }
      })
    }
  }

  onCancel() {
    this.projectForm.reset({
      username: this.storageService.getUsername(),
    });
  }

  // apis
  loadData() {
    this.getAllDepartments();
    this.getManagers();
    this.getEmployees();
    this.getProjects();
  }

  getManagers() {
    this.authService.getManagerList().subscribe({
      next: (res: any) => this.managerList = res
    });
  }

  getEmployees() {
    this.authService.getEmployeeList().subscribe({
      next: (res: any) => this.employeeList = res
    });
  }

  getProjects(callback?: Function) {
    this.authService.getAllProjects().subscribe({
      next: (res: any) => {
        this.projectList = res
        this.projectList = this.projectList.map(item => {
          const tasks_pending = Math.floor(Math.random() * 20) + 1;
          const tasks_done = Math.floor(Math.random() * (tasks_pending + 1));

          return {
            ...item,
            tasks_done: tasks_done,
            tasks_pending: tasks_pending
          };
        });
        this.viewOptions = this.commonService.getFieldLabels(this.projectList);
        if (callback) callback();
      }
    });
  }

  getAllDepartments() {
    this.authService.getAllDepartments().subscribe({
      next: (res: any) => this.departmentList = res
    });
  }
  onViewSelected(item: any) {
    this.initTable(item.id);
  }
  updateProject() {
    this.selectedProject.username = this.storageService.getUsername();
    console.log(this.selectedProject);
    console.log(this.managerList);

    this.selectedProject.assigned_manager = this.commonService.getObjectByField(this.managerList, 'employee_name', this.selectedProject.manager_name).id;

    this.authService.updateProject(this.selectedProject).subscribe({
      next: ((res: any) => {
        this.toasterService.success(res?.message);
        this.loadInitialData();
        this.isEditMode = false
      }),
      error: (err: any) => {
        this.toasterService.error(err?.error?.message);
      }
    })
  }
  patchProjectForm(data: any) {
    this.isEditMode = true;
    this.filteredEmployees
    this.projectForm.patchValue({
      id: data.id,
      project_title: data.project_title,
      description: data.description,
      deptid: data.deptid,
      start_date: data.start_date,
      end_date: data.end_date,
      assigned_manager: data.assigned_manager,
      client: data.client,
      ispublic: data.ispublic,
      username: this.storageService.getUsername(),
      employee_list: data.employee_list
    });

  }
}