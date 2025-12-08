import { Component, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/core/services/auth.service';
import { CommonService } from 'src/app/core/services/common.service';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
declare var luxon: any
@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss']
})
export class ProjectsComponent {
  private table: Tabulator | undefined;
  isFilterOpen = false;
  viewOptions: any = {}
  toggleSideTab(type?: any) {
    this.isFilterOpen = !this.isFilterOpen;
  }
  constructor(private el: ElementRef, private fb: FormBuilder, private authService: AuthService, private commonService: CommonService) { }

  managerList: any[] = [];
  employeeList: any[] = [];
  projectList: any[] = [];
  departmentList: any[] = []
  columns: any = [];

  projectForm: FormGroup = this.fb.group({
    project_title: ['', Validators.required],
    description: [''],
    deptid: [null, Validators.required],
    start_date: ['', Validators.required],
    end_date: ['', Validators.required],
    assigned_manager: [null, Validators.required],
    client: ['', Validators.required],
    ispublic: [false],
    username: ['admin@gmail.com'],
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
    // this.departments = this.commonService.formatForTabulator(this.departmentList, "department_name");

    this.columns = [
      { title: "ID", field: "id", sorter: "number", width: 60, hozAlign: "center" },


      { title: "Project Title", field: "project_title", editor: "input" },
      { title: "Owner", field: "assigned_manager", editor: "input", formator: this.ownerFormatter },
      {
        title: "Start",
        field: "start_date",
        sorter: "date",
        editor: "date",
        editorParams: { min: "1900-01-01", max: "2100-12-31", format: "yyyy-MM-dd" }
      },
      {
        title: "End",
        field: "end_date",
        sorter: "date",
        editor: "date",
        editorParams: { min: "1900-01-01", max: "2100-12-31", format: "yyyy-MM-dd" }
      },




      {
        title: "Department",
        field: "department_name",
        editor: "list",
        editorParams: {
          // values: this.departments
        }
      },
      {
        title: "Status", field: "isactive", formatter: "tickCross", editor: true, hozAlign: "center",

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
      layout: "fitDataStretch"

    };

    this.table = new Tabulator(
      this.el.nativeElement.querySelector('.tabulator-table'),
      defaultOptions
    );

    this.table.on("cellEdited", (cell: any) => {
      if (cell.getColumn().getField() == 'department_name') {

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

    if (this.projectForm.valid) {
      console.log('Project Data:', this.projectForm.value);
    } else {
      this.projectForm.markAllAsTouched();
    }
  }

  onCancel() {
    this.projectForm.reset({
      username: 'admin@gmail.com',
      ispublic: false,
      employee_list: []
    });
  }
  // Formatters:
  ownerFormatter = function (cell: any) {
    const src = cell.getValue();
    const name = cell.getData().firstname;
    const initial = name ? name.charAt(0).toUpperCase() : '?';
    const colors = ['bg-blue-400', 'bg-purple-400', 'bg-pink-400', 'bg-indigo-400'];
    const colorClass = colors[cell.getData().id % colors.length];

    return `
      <div class="flex items-center gap-2">
          <div class="relative w-6 h-6">
              <img class="user-avatar" src="${src}" alt="${name}" 
                  onerror="this.onerror=null; this.parentElement.innerHTML='<div class=\\'w-6 h-6 rounded-full ${colorClass} flex items-center justify-center text-white text-[10px] font-bold\\'>${initial}</div>'">
          </div>
          <span class="text-gray-600 truncate">${name}</span>
      </div>
  `;
  };
  
  taskNameFormatter = function (cell: any) {
    const row = cell.getData();
    return `
        <div class="flex items-center gap-2">
            <span class="text-gray-400"><i class="fa-regular fa-file-lines"></i></span>
            <div class="flex flex-col">
                <span class="font-medium text-gray-700 hover:text-blue-600 cursor-pointer">${row.firstname} ${row.lastname}</span>
                <span class="text-[10px] text-gray-400">${row.position}</span>
            </div>
        </div>
    `;
  };

  priorityFormatter = function (cell: any) {
    const val = cell.getValue();
    if (val && val.includes("Manager")) {
      return `<div class="flex items-center gap-1 text-red-500 font-medium"><i class="fa-solid fa-circle-exclamation text-[10px]"></i> High</div>`;
    }
    return `<div class="flex items-center gap-1 text-gray-400"><i class="fa-solid fa-minus text-[10px]"></i> None</div>`;
  }

  dateWithRelativeFormatter = function (cell: any) {
    const val = cell.getValue();
    if (!val) return "-";
    const dt = luxon.DateTime.fromISO(val);
    if (!dt.isValid) return val; // Fallback if edit breaks format

    const relative = dt.toRelative();
    const isOld = dt < luxon.DateTime.now().minus({ years: 1 });
    const relativeClass = isOld ? "text-red-400" : "text-gray-400";

    return `
        <div class="flex flex-col leading-tight">
            <span class="text-gray-700">${dt.toFormat('MM-dd-yyyy')}</span>
            <span class="text-[10px] ${relativeClass}">${relative}</span>
        </div>
    `;
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
}