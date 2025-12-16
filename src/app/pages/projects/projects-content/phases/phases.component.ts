import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { CommonService } from 'src/app/core/services/common.service';
import { StorageService } from 'src/app/core/services/storage.service';
import { ToasterService } from 'src/app/core/services/toaster.service';
import { TableFilterComponent } from 'src/app/shared/components/table-filter/table-filter.component';
import Swal from 'sweetalert2';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
declare var luxon: any
@Component({
  selector: 'app-phases',
  templateUrl: './phases.component.html',
  styleUrls: ['./phases.component.scss']
})
export class PhasesComponent {
  @ViewChild(TableFilterComponent) viewSelector!: TableFilterComponent;
  isFilterOpen: any;
  isEditMode = false;
  viewOptions: any = {};
  selectPhase: any;
  projectid: any = 0;
  statusList: any = []
  cUsername = this.storageService.getUsername();
  empid: any = 0;
  phaseForm: FormGroup | any;
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
  Phases: any[] = []
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
    this.getEmployees();
    this.loadInitialData();
    this.phaseForm = this.fb.group({
      id: [null],
      phase_title: ['', Validators.required],
      phase_type: ['Internal', Validators.required],
      projectid: [null, Validators.required],

      version: [null],

      start_date: [null, Validators.required],
      end_date: [null],

      status: ['Open', Validators.required],
      assignee: [null],
      remark: [''],
      username: this.storageService.getUsername()
    });

  }
  get rf() {
    return {
      id: this.phaseForm.get('id'),
      phase_title: this.phaseForm.get('phase_title'),
      phase_type: this.phaseForm.get('phase_type'),

      projectid: this.phaseForm.get('projectid'),
      version: this.phaseForm.get('version'),
      start_date: this.phaseForm.get('start_date'),
      end_date: this.phaseForm.get('end_date'),

      status: this.phaseForm.get('status'),
      assignee: this.phaseForm.get('assignee'),
      remark: this.phaseForm.get('remark'),
    };
  }


  onSubmit() {
    console.log('taskForm Data:', this.phaseForm.value);

    if (!this.phaseForm.valid) {
      this.phaseForm.markAllAsTouched();
      return;
    }
    if (this.isEditMode) {
      this.selectPhase = { ...this.selectPhase, ...this.phaseForm.value }
      this.authService.updatePhase(this.selectPhase).subscribe({
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
      this.authService.createPhase(this.phaseForm.value).subscribe({
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
    this.phaseForm.reset({
      projectid: this.projectid,
      username: this.storageService.getUsername()
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
        this.Phases = res
        this.viewOptions = this.commonService.getFieldLabels(this.Phases);
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
  getPhaseByProjectId(callback?: Function) {
    this.authService.getPhaseByProjectId(this.projectid).subscribe({
      next: (res: any) => {
        this.Phases = res
        this.viewOptions = this.commonService.getFieldLabels(this.Phases);
        if (callback) callback();
      }
    });
  }

  loadInitialData() {
    this.getStatusList();
    this.getPhaseByProjectId(() => {
      this.initTable();
    });
  }
  onViewSelected(item: any) {
    this.initTable(item.id)
  }
  updatePhase() {
    this.selectPhase.username = this.storageService.getUsername();
    this.authService.updatePhase(this.selectPhase).subscribe({
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
  patchPhaseForm(data: any) {
    if (!data) return;

    this.isEditMode = true;

    this.phaseForm.patchValue({
      id: data.id,
      code: data.code,
      phase_title: data.phase_title,
      phase_type: data.phase_type,
      projectid: data.projectid,
      version: data.version,
      start_date: data.start_date,
      end_date: data.end_date,
      status: data.status,
      assignee: data.assignee,
      remark: data.remark
    });

  }



  private initTable(viewby: any = "") {

    const typeFormatter = function (cell: any) {
      const val = cell.getValue();

      const config: any = {
        "Internal": {
          cls: "type-internal",
          icon: "ri-building-2-fill"
        },
        "External": {
          cls: "type-external",
          icon: "ri-global-line"
        }
      };

      const item = config[val] || {
        cls: "type-default",
        icon: "ri-information-fill"
      };

      return `
        <span class="type-badge ${item.cls}">
          <i class="${item.icon}"></i>
          ${val}
        </span>
      `;
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
                      <span class="text-main text-bold">${row.phase_title}</span>
                  </div>
              </div>
              <button class="access-btn">
                  Open <i class="ri-arrow-right-line"></i>
              </button>
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
    this.columns = [

      {
        title: "Phase code",
        field: "code",
        formatter: (cell: any) => `<span class="text-light-gray">${cell.getValue()}</span>`

      },

      {
        title: "Phase",
        field: "phase_title",
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
            this.router.navigate(
              [`/main/projects/projects-content/${this.projectid}/${1}`],
              { queryParams: { phaseid: rowData.id } }
            );

            sessionStorage.setItem('activeProjectTab', 'subtasks');
          }
        }
      },
      {
        title: "Type",
        field: "phase_type",
        formatter: typeFormatter,
        hozAlign: "center",
        editor: "list",
        editorParams: {
          values: ['Internal', 'External']
        }
      }, {
        title: "Owner",
        field: "assignee",
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
        title: "project name",
        field: "project_name"
      },

      {
        title: "remark",
        field: "remark",
        editor: "textarea"
      },

      {
        title: "Created", field: "createddate", sorter: "datetime"
      },
      { title: "Updated", field: "updateddate", sorter: "datetime" },
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
          `;
        }
        ,
        cellClick: (e: any, cell: any) => {
          const rowData = cell.getRow().getData();
          if (e.target.classList.contains("edit")) {
            this.selectPhase = rowData;
            this.patchPhaseForm(rowData);
            this.toggleSideTab();
          }
        }
      }
    ];

    const defaultOptions: any = {
      data: this.Phases,
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
      this.selectPhase = cell.getRow().getData();
      if (cell.getField() === "assigned_to_name") {
        this.selectPhase.assigned_to = cell.getValue();
      }
      this.updatePhase();
      if (cell.getField() === "project_title" || cell.getField() === "manager_name") {
        cell.getRow().reformat();
      }

    });

  }


}