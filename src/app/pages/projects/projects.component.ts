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
  empid: any = 0
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
  ) {
    this.empid = this.storageService.getEmpId();
  }

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
    employee_list: [[]],
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


    const myItemFormatter = function (label: any, value: any, item: any, element: any) {
      if (!label) return "";

      let hash = 0;
      for (let i = 0; i < label.length; i++) hash = label.charCodeAt(i) + ((hash << 5) - hash);
      const colors = ['bg-blue', 'bg-purple', 'bg-pink', 'bg-indigo', 'bg-teal'];

      // Using item.id (enabled by the update to employeeEditorValues above)
      // Fallback to 0 if id is missing to prevent errors
      const color = colors[(item.value || 0) % colors.length];

      const initials = label.split(" ").map((n: any) => n[0]).slice(0, 2).join("");

      if (element) element.title = "Click to toggle selection";

      // Your Custom HTML Structure
      return `
      <div class="user">
          <div class="avatar-circle ${color}">${initials}</div>
          <span class="text-main truncate">${label}</span>
      </div>
      `;
    };

    const ownerChipFormatter = function (cell: any, formatterParams: any) {
      const ids = cell.getValue();
      if (!ids || (Array.isArray(ids) && ids.length === 0)) return "";
      const idList = Array.isArray(ids) ? ids : [ids];
      // Container for multiple chips
      const wrapper = document.createElement("div");
      wrapper.className = "chip-container";

      const colors = ['bg-blue', 'bg-purple', 'bg-pink', 'bg-indigo', 'bg-teal'];

      idList.forEach(id => {
        const name = formatterParams.lookup[id] || "Unknown";
        const initial = name ? name.charAt(0).toUpperCase() : '?';

        // Color Logic: Using ID for consistency (Person A is always Blue)
        // If you prefer row-based coloring like your snippet, change 'id' to 'cell.getData().id'
        const colorClass = colors[id % colors.length];

        const chip = document.createElement("div");
        chip.className = "flex-row"; // Your requested class

        // Your requested HTML structure
        chip.innerHTML = `
            <div class="avatar-circle ${colorClass}">${initial}</div>
            <span class="text-main truncate">${name}</span>
        `;

        wrapper.appendChild(chip);
      });
      return wrapper;
    };

    const statusFormatter = function (cell: any) {
      const val = cell.getValue();
      if (val === true) {
        return `<span class="status-pill status-closed"><i class="ri-checkbox-circle-fill"></i> Open</span>`;
      }
      return `<span class="status-pill status-cancelled"><i class="ri-close-circle-fill"></i> Closed</span>`;
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

      const now = luxon.DateTime.now();

      let end = luxon.DateTime.fromISO(val);

      // If date has no time → assume end of day
      if (val.length <= 10) {
        end = end.set({ hour: 23, minute: 59, second: 59 });
      }

      if (!end.isValid) return val;

      let relativeText = "";
      let relativeClass = "";

      if (end > now) {
        const diff = end.diff(now, ["days", "hours", "minutes"]).toObject();

        if (diff.days && diff.days >= 1) {
          const d = Math.floor(diff.days);
          relativeText = `${d} ${d === 1 ? "day" : "days"} to go`;
        } else if (diff.hours && diff.hours >= 1) {
          const h = Math.floor(diff.hours);
          relativeText = `${h} ${h === 1 ? "hour" : "hours"} left`;
        } else {
          const m = Math.floor(diff.minutes || 1);
          relativeText = `${m} ${m === 1 ? "minute" : "minutes"} left`;
        }

        relativeClass = "text-green";

      } else {
        // Past event wording
        const diff = now.diff(end, ["days", "hours", "minutes"]).toObject();

        if (diff.days && diff.days >= 1) {
          const d = Math.floor(diff.days);
          relativeText = `Ended ${d} ${d === 1 ? "day" : "days"} ago`;
        } else if (diff.hours && diff.hours >= 1) {
          const h = Math.floor(diff.hours);
          relativeText = `Ended ${h} ${h === 1 ? "hour" : "hours"} ago`;
        } else {
          const m = Math.floor(diff.minutes || 1);
          relativeText = `Ended ${m} ${m === 1 ? "minute" : "minutes"} ago`;
        }

        relativeClass = "text-red";
      }

      return `
        <div class="flex-col">
          <span class="text-main">${end.toFormat("MM-dd-yyyy")}</span>
          <span class="text-muted ${relativeClass}">
            (${relativeText})
          </span>
        </div>
      `;
    };


    const taskProgressFormatter = (cell: any) => {
      const row = cell.getData();
      const done = Number(row.tasks_done ?? 0);
      const pending = Number(row.tasks_pending ?? 0);
      const total = done + pending;

      const pct = total === 0 ? 0 : Math.round((done / total) * 1000) / 10;

      // Render: [Done] [Bar with Text Inside] [Pending]
      return `
          <div class="task-progress-container">
              <span class="task-count left">${done}</span>
              <div class="task-bar-track">
                  <div class="task-bar-fill" style="width: ${pct}%"></div>
                  <span class="task-bar-text">${pct} %</span>
              </div>
              <span class="task-count left">${pending}</span>
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
            sessionStorage.setItem('activeProjectTab', 'tasks');
          }
        }
      },
      {
        title: "Owner",
        field: "assigned_manager",
        formatter: ownerChipFormatter,
        editor: "list",
        formatterParams: { lookup: this.commonService.formatForTabulatorObj(this.employeeList, 'id', 'employee_name') },
        editorParams: {
          values: this.commonService.formatForTabulatorObj(this.employeeList, 'id', 'employee_name'),
          autocomplete: true,
          clearable: true,
          listOnEmpty: true,
          // multiselect: true,
          itemFormatter: myItemFormatter
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
        field: "isclose",
        formatter: statusFormatter,
        hozAlign: "center",
        editor: "list",
        editorParams: {
          values: [
            { label: "Open", value: true },
            { label: "Closed", value: false }
          ]
        }
      },
      {
        title: "Tasks", field: "tasks_done", width: 180, headerSort: false,
        formatter: taskProgressFormatter,
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
      editTriggerEvent: "dblclick",
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
    return this.employeeList.filter(e => e?.employee_name?.toLowerCase()?.includes(term));
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
          // this.loadInitialData();
          this.getProjects()
          this.isEditMode = false;
          this.toggleSideTab();
        }),
        error: (err: any) => {
          this.toasterService.error(err?.error?.message);
        }
      })
    } else {

      this.authService.createProject(this.projectForm.value).subscribe({
        next: ((res: any) => {
          this.toasterService.success(res?.message);
          // this.loadInitialData();
          this.getProjects();
          this.toggleSideTab();
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
    this.authService.getAllProjectsByEmployeeId(this.empid).subscribe({
      next: (res: any) => {
        this.projectList = res
        // this.projectList = this.projectList.map(item => {
        //   const tasks_pending = Math.floor(Math.random() * 20) + 1;
        //   const tasks_done = Math.floor(Math.random() * (tasks_pending + 1));

        //   return {
        //     ...item,
        //     tasks_done: tasks_done,
        //     tasks_pending: tasks_pending
        //   };
        // });
        this.viewOptions = this.commonService.getFieldLabels(this.projectList);
        this.table?.replaceData(this.projectList)
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

    this.authService.updateProject(this.selectedProject).subscribe({
      next: ((res: any) => {
        this.toasterService.success(res?.message);
        // this.loadInitialData();
        this.getProjects();
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