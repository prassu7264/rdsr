import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { CommonService } from 'src/app/core/services/common.service';
import { StorageService } from 'src/app/core/services/storage.service';

import { ToasterService } from 'src/app/core/services/toaster.service';
import { TableFilterComponent } from 'src/app/shared/components/table-filter/table-filter.component';
import Swal from 'sweetalert2';
import { TabulatorFull as Tabulator } from 'tabulator-tables';

declare var luxon: any;
@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.scss']
})
export class TasksComponent {
  @ViewChild(TableFilterComponent) viewSelector!: TableFilterComponent;
  isFilterOpen: any;
  isEditMode = false;
  viewOptions: any = {};
  selectTask: any;
  projectid: any = 0;
  statusList: any = []
  cUsername = this.storageService.getUsername();
  empid: any = 0;
  taskForm: FormGroup | any;
  private table: Tabulator | undefined;
  constructor(
    private el: ElementRef,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private toasterService: ToasterService,
    private authService: AuthService,
    private commonService: CommonService,
    private storageService: StorageService,
    private router: Router
  ) {

    this.projectid = this.route.snapshot.paramMap.get('id');
    this.empid = this.storageService.getEmpId();

  }

  apppTypeList: any[] = [];
  employeeList: any[] = [];
  projectList: any[] = [];
  taskList: any[] = []
  columns: any = [];



  isTeamDropdownOpen = false;
  teamSearch = '';
  toggleSideTab(type?: any) {
    console.log(type);

    this.isFilterOpen = !this.isFilterOpen;
    if (type === 'New') {
      this.onCancel();
    }
  }
  ngOnInit() {
    this.getProjects();
    this.getAppsTypes();
    this.getEmployees();
    this.loadInitialData();

    this.taskForm = this.fb.group({
      id: [0],
      projectid: [this.projectid, Validators.required],
      // app_type: [null, Validators.required],
      version: ['v1.0.0', Validators.required],
      task: ['', Validators.required],
      description: ['', Validators.required],
      task_type: [null, Validators.required],
      priority: [null, Validators.required],
      assigned_from: [this.storageService.getEmpId(), Validators.required],
      assigned_to: [null, Validators.required],
      start_date: ['', Validators.required],
      end_date: ['', Validators.required],
      status: [null, Validators.required],
      username: [this.storageService.getUsername()]
    });
  }
  get rf() {
    return {
      projectid: this.taskForm.get('projectid'),
      app_type: this.taskForm.get('app_type'),
      version: this.taskForm.get('version'),
      task: this.taskForm.get('task'),
      description: this.taskForm.get('description'),
      task_type: this.taskForm.get('task_type'),
      priority: this.taskForm.get('priority'),
      assigned_from: this.taskForm.get('assigned_from'),
      assigned_to: this.taskForm.get('assigned_to'),
      start_date: this.taskForm.get('start_date'),
      end_date: this.taskForm.get('end_date'),
      status: this.taskForm.get('status'),
      username: this.taskForm.get('username')
    };
  }

  onSubmit() {
    console.log('taskForm Data:', this.taskForm.value);

    if (!this.taskForm.valid) {
      this.taskForm.markAllAsTouched();
      return;
    }
    if (this.isEditMode) {
      this.selectTask = { ...this.selectTask, ...this.taskForm.value }
      this.authService.updateTask(this.selectTask).subscribe({
        next: ((res: any) => {
          this.toasterService.success(res?.message);
          this.isEditMode = false;
          this.toggleSideTab();
          this.loadInitialData();
        }),
        error: (err: any) => {
          this.toasterService.error(err?.error?.message);
        }
      })
    } else {
      this.authService.createTask(this.taskForm.value).subscribe({
        next: ((res: any) => {
          this.toasterService.success(res?.message);
          this.toggleSideTab();
          this.loadInitialData();
        }),
        error: (err: any) => {
          this.toasterService.error(err?.error?.message);
        }
      })
    }
  }

  onCancel() {
    this.taskForm.reset({
      username: this.storageService.getUsername(),
      projectid: this.projectid,
      assigned_from: this.storageService.getEmpId()
    });
  }

  getAppsTypes() {
    this.authService.getAppsTypes().subscribe({
      next: (res: any) => this.apppTypeList = res
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
        // this.viewOptions = this.commonService.getFieldLabels(this.projectList);
        if (callback) callback();
      }
    });
  }
  getAllTasks(callback?: Function) {
    this.authService.getAllTasks().subscribe({
      next: (res: any) => {
        this.taskList = res
        this.viewOptions = this.commonService.getFieldLabels(this.taskList);
        if (callback) callback();
      }
    });
  }
  getStatusList() {
    this.authService.getStatusList().subscribe({
      next: (res: any) => {
        this.statusList = res;
      }
    });
  }
  getTasksByProjectIdNdEmployeeId(callback?: Function) {
    this.authService.getTasksByProjectIdNdEmployeeId(this.projectid, this.empid || 0).subscribe({
      next: (res: any) => {
        this.taskList = res
        this.viewOptions = this.commonService.getFieldLabels(this.taskList);
        if (callback) callback();
      }
    });
  }
  loadInitialData() {
    this.getStatusList()
    this.getTasksByProjectIdNdEmployeeId(() => {
      this.initTable();
    });
  }
  onViewSelected(item: any) {
    this.initTable(item.id)
  }
  updateTask() {
    this.selectTask.username = this.storageService.getUsername();
    this.authService.updateTask(this.selectTask).subscribe({
      next: ((res: any) => {
        this.toasterService.success(res?.message);
        this.isEditMode = false
        this.loadInitialData();
      }),
      error: (err: any) => {
        this.toasterService.error(err?.error?.message);
      }
    })
  }
  patchtaskForm(data: any) {
    if (!data) return;

    this.isEditMode = true;

    this.taskForm.patchValue({
      id: data?.id ?? 0,
      projectid: data.projectid ?? null,
      // app_type: data.app_type ?? 1,
      version: data.version ?? 'V1.0.0',
      task: data.task ?? null,
      description: data.description ?? '',
      task_type: data.task_type ?? 'Requirement',
      priority: data.priority ?? 'Medium',
      assigned_from: data.assigned_from ?? this.storageService.getUserId(),
      assigned_to: data.assigned_to ?? null,
      start_date: data.start_date ?? '',
      end_date: data.end_date ?? '',
      status: data.status ?? 'Pending',
      username: this.storageService.getUsername()
    });
  }



  private initTable(viewby: any = "") {
    const myItemFormatter = function (label: any, value: any, item: any, element: any) {
      if (!label) return "";


      let hash = 0;
      for (let i = 0; i < label.length; i++) hash = label.charCodeAt(i) + ((hash << 5) - hash);
      const colors = ['bg-blue', 'bg-purple', 'bg-pink', 'bg-indigo', 'bg-teal'];


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

      const config: any = {
        "Open": { cls: "status-open", icon: "ri-door-open-fill" },
        "In Progress": { cls: "status-inprogress", icon: "ri-loader-4-fill" },
        "In Review": { cls: "status-review", icon: "ri-search-eye-fill" },
        "To be Tested": { cls: "status-testing", icon: "ri-flask-fill" },
        "On Hold": { cls: "status-hold", icon: "ri-pause-circle-fill" },
        "Delayed": { cls: "status-delayed", icon: "ri-timer-2-fill" },
        "Closed": { cls: "status-closed", icon: "ri-checkbox-circle-fill" },
        "Cancelled": { cls: "status-cancelled", icon: "ri-close-circle-fill" }
      };

      const item = config[val] || { cls: "status-default", icon: "ri-information-fill" };

      return `<span class="${val}">
                <i class="${item.icon}"></i> ${val}
              </span>`;
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
                      <span class="text-main text-bold">${row.task}</span>
                      <span class="text-muted">${row.description || 'No description'}</span>
                  </div>
              </div>
              <button class="access-btn">
                  Open <i class="ri-arrow-right-line"></i>
              </button>
          </div>
      `;
    };


    const officeHoursDaysFormatter = (cell: any) => {
      const raw = cell.getValue(); // example: "05:30", "12:00", "80:00"

      if (!raw) return "-";

      // Parse HH:mm or HH:mm:ss
      const parts = raw.split(":").map(Number);
      let hours = parts[0] || 0;
      let minutes = parts[1] || 0;
      let seconds = parts[2] || 0;

      // Convert to total hours using Luxon
      const dur = luxon.Duration.fromObject({ hours, minutes, seconds });
      const totalHours = dur.as("hours"); // decimal hours

      let display = "";
      let unit = "";

      // MAIN LOGIC 🌟
      if (totalHours < 8) {
        display = totalHours.toFixed(2);
        unit = "hrs";
      } else {
        const totalDays = totalHours / 8;
        display = totalDays.toFixed(2);
        unit = "days";
      }

      return `
        <div class="client-pill">
          <i class="ri-time-line" style="color:var(--text-muted)"></i>
          <span>${display} ${unit}</span>
        </div>
      `;
    };


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
      const done = row.tasks_done || 0;
      const pending = row.tasks_pending || 0;
      const total = done + pending;

      // Calculate percentage
      // const pct = total === 0 ? 0 : Math.round((done / total) * 100);

      const pct = row.completion_percentage || 0
      // <span class="task-count">${done}</span>
      // <span class="task-count right">${pending}</span>

      // Render: [Done] [Bar with Text Inside] [Pending]
      return `
          <div class="task-progress-container">
            
              <div class="task-bar-track">
                  <div class="task-bar-fill" style="width: ${pct}%"></div>
                  <span class="task-bar-text">${pct} %</span>
              </div>
             
          </div>
      `;
    };
    this.columns = [

      {
        title: "Taskcode",
        field: "taskcode",
        formatter: (cell: any) => `<span class="text-light-gray">${cell.getValue()}</span>`

      },

      {
        title: "Task Name",
        field: "task",
        frozen: true,
        formatter: taskNameFormatter,
        minWidth: 100,
        widthGrow: 2,
        editor: "input",
        cellClick: (e: any, cell: any) => {
          // Access Button Logic
          if (e.target.closest('.access-btn')) {
            e.stopPropagation();
            const rowData = cell.getRow().getData();
            // localStorage.setItem('projectDetails', JSON.stringify(rowData));
            this.router.navigate([`/main/projects/projects-content/${this.projectid}/${rowData.id}`]);
            sessionStorage.setItem('activeProjectTab', 'subtasks');
          }
        }
      },
      {
        title: "Owner",
        field: "assigned_to",
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
        title: "Status",
        field: "status",
        formatter: statusFormatter,
        hozAlign: "center",
        editor: "list",
        editorParams: {
          values: this.statusList
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
        title: "Duration",
        field: "estimated_hours",
        formatter: officeHoursDaysFormatter
      },

      {
        title: "Completion", field: "tasks_done", width: 180, headerSort: false,
        formatter: taskProgressFormatter, editorParams: { min: 0, max: 100 }
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
            this.selectTask = rowData;
            this.patchtaskForm(rowData);
            this.toggleSideTab();
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
                this.authService.deleteTask(this.cUsername, rowData.id).subscribe({
                  next: (res: any) => {
                    this.toasterService.success(res?.message)
                    this.loadInitialData();
                  }, error: (err) => {
                    this.toasterService.error(err?.error?.message)
                  }
                });


              }
            });
          }

        }
      }
    ];

    const defaultOptions: any = {
      data: this.taskList,
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
      this.el.nativeElement.querySelector('.tabulator-table-task'),
      defaultOptions
    );

    this.table.on("cellEdited", (cell: any) => {
      this.selectTask = cell.getRow().getData();
      if (cell.getField() === "assigned_to_name") {
        this.selectTask.assigned_to = cell.getValue();
      }
      this.updateTask();
      if (cell.getField() === "project_title" || cell.getField() === "manager_name") {
        cell.getRow().reformat();
      }

    });

  }


}