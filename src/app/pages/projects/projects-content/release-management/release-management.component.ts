import { Component, ElementRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from 'src/app/core/services/auth.service';
import { StorageService } from 'src/app/core/services/storage.service';
import { ToasterService } from 'src/app/core/services/toaster.service';
import { ActivatedRoute, Router } from '@angular/router';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import Swal from 'sweetalert2';
import { CommonService } from 'src/app/core/services/common.service';

declare var luxon: any;
// -------------------------------------------------------------------------
//  1. Data Models & Types
// -------------------------------------------------------------------------

type LifecycleStatus =
  | 'Open'        // 1. Planning & Scoping
  | 'In-Progress' // 2. Build & Development
  | 'In-Testing'     // 3. Quality Assurance
  | 'In-Review'      // 4. UAT & Staging
  | 'Failed'      // 5. Blocked or Rolled Back
  | 'Completed';       // 6. Production Deployment

// View Model for the Dashboard
interface Release {
  id: string;
  version: string;
  title: string;
  status: LifecycleStatus;
  progress: number;
  date: string;       // Target or Release Date
  assignee_name: string;
  ownerInitials: string;
  ownerColor: string;
}

// -------------------------------------------------------------------------
//  2. Component Definition
// -------------------------------------------------------------------------

@Component({
  selector: 'app-release-management',
  templateUrl: './release-management.component.html',
  styleUrls: ['./release-management.component.scss']
})
export class ReleaseManagementComponent implements OnInit {
  // -------------------------------------------------------------------------
  //  3. Component Logic & State
  // -------------------------------------------------------------------------
  columns: any = [];
  isEdit: any = false;
  selecetedRelease: any = {}
  colorsList = [
    { label: 'Open', value: 'var(--c-teal)' },
    { label: 'In-Progress', value: 'var(--c-blue)' },
    { label: 'In-Testing', value: 'var(--c-orange)' },
    { label: 'In-Review', value: 'var(--c-purple)' },
    { label: 'failed', value: 'var(--c-red)' },
    { label: 'Completed', value: 'var(--c-green)' }
  ];

  filename: any = ''
  private table: Tabulator | undefined;
  empid: any = 0
  projectid: any = 0
  // State
  currentView: 'table' | 'kanban' = 'table';
  searchQuery: string = '';
  draggedReleaseId: string | null = null;
  showDrawer: boolean = false;


  constructor(private authService: AuthService, private el: ElementRef, private commonService: CommonService, private storageService: StorageService, private router: Router, private route: ActivatedRoute, private toasterService: ToasterService) {
    this.empid = this.storageService.getEmpId();
    this.projectid = this.route.snapshot.paramMap.get('id');
  }
  ngOnInit(): void {
    this.getProjects();
    this.getStatusList();
    this.getEmployeelistByProjectId();
    this.releaseForm.get('ismail')?.valueChanges.subscribe((checked: boolean | any) => {
      const fileCtrl = this.releaseForm.get('file_url');
      const mailCtrl = this.releaseForm.get('mail_content');
      if (checked) {
        // Enable + mandatory
        fileCtrl?.enable();
        mailCtrl?.enable();

        fileCtrl?.setValidators([Validators.required]);
        mailCtrl?.setValidators([Validators.required]);
      } else {
        // Disable + clear validation
        fileCtrl?.reset();
        mailCtrl?.reset();

        fileCtrl?.clearValidators();
        mailCtrl?.clearValidators();

        fileCtrl?.disable();
        mailCtrl?.disable();
      }

      fileCtrl?.updateValueAndValidity();
      mailCtrl?.updateValueAndValidity();
    });

    this.loadInitialData();

  }
  get isMail() {
    return this.releaseForm.get('ismail')?.value;
  }
  // Mock Data for Selects
  projectList: any = [];
  statusList: any = []
  employeeList: any = []
  releaseList: any = [];

  // Reactive Form Definition - ALL FIELDS REQUIRED
  releaseForm = new FormGroup({
    id: new FormControl(0),
    title: new FormControl('', Validators.required),
    projectid: new FormControl<number | null>(null, Validators.required),
    version: new FormControl('', Validators.required),
    planned_date: new FormControl(new Date().toISOString().split('T')[0], Validators.required),
    released_date: new FormControl('', Validators.required),
    assigned_to: new FormControl<number | null>(null, Validators.required),
    status: new FormControl<LifecycleStatus>('Open', { nonNullable: true, validators: Validators.required }),
    // Removed username field
    mail_content: new FormControl('', Validators.required),
    file_url: new FormControl('', Validators.required),
    ismail: new FormControl(false),
    release_type: new FormControl('Internal'),
    username: new FormControl(this.storageService.getUsername()),
  });



  // -------------------------------------------------------------------------
  //  4. Helpers & Actions
  // -------------------------------------------------------------------------

  get filteredReleases(): Release[] {
    const query = this.searchQuery.toLowerCase();
    return this.releaseList.filter((r: any) =>
      r.version.toLowerCase().includes(query) ||
      r.title.toLowerCase().includes(query)
    );
  }

  setView(view: 'table' | 'kanban') {
    this.currentView = view;
    this.loadInitialData()
  }

  onSearchChange(value: string) {
    this.searchQuery = value;
  }

  trackById(index: number, item: Release): string {
    return item.id;
  }

  getReleasesByStatus(status: string | string[]) {
    const statuses = Array.isArray(status) ? status : [status];
    return this.filteredReleases.filter(r => {
      if (statuses.includes(r.status)) {
        r.ownerColor = this.getStatusColor(r?.status);
        r.ownerInitials = this.getOwnerInitials(r.assignee_name);
        r.progress = this.getNumber0To100()
        return r;
      } else {
        return;
      }
    });
  }

  getCountByStatus(status: string | string[]) {
    return this.getReleasesByStatus(status).length;
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Open': return 'rls-release-open';
      case 'In-Progress': return 'rls-release-in-progress';
      case 'In-Testing': return 'rls-release-testing';
      case 'In-Review': return 'rls-release-review';
      case 'failed': return 'rls-release-failed';
      case 'Completed': return 'rls-release-done';
      default: return '';
    }
  }
  getOwnerInitials(label: any) {
    if (!label) return '??';
    return label.split(' ').map((n: any) => n[0]).join('').substring(0, 2).toUpperCase();
  }
  getStatusColor(status: string): string {
    switch (status) {
      case 'Open': return 'var(--c-green)';
      case 'In-Progress': return 'var(--c-blue)';
      case 'In-Testing': return 'var(--c-orange)';
      case 'In-Review': return 'var(--c-purple)';
      case 'failed': return 'var(--c-red)';
      case 'Completed': return 'var(--success)';
      default: return 'var(--text-muted)';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'Open': return 'Open';
      case 'In-Progress': return 'In Progress';
      case 'In-Testing': return 'Testing';
      case 'In-Review': return 'Review';
      case 'failed': return 'Failed';
      case 'Completed': return 'Completed';
      default: return status;
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.releaseForm.get(fieldName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  // -------------------------------------------------------------------------
  //  5. Drag & Drop Logic
  // -------------------------------------------------------------------------

  isDragging(id: string): boolean {
    return this.draggedReleaseId === id;
  }

  onDragStart(event: DragEvent, release: Release) {
    this.draggedReleaseId = release.id;
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', release.id);
    }
  }

  onDragEnd(event: DragEvent) {
    this.draggedReleaseId = null;
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  }

  onDrop(event: DragEvent, newStatus: string) {
    event.preventDefault();
    const id = this.draggedReleaseId;
    if (id) {
      this.updateReleaseStatus(id, newStatus as LifecycleStatus);
    }
    this.draggedReleaseId = null;
  }

  updateReleaseStatus(id: string, newStatus: LifecycleStatus) {
    this.releaseList = this.releaseList.map((item: any) =>
      item.id === id ? { ...item, status: newStatus } : item
    );
    let selecetedRelease = this.releaseList.find((e: any) => e.id === id);
    selecetedRelease.username = this.storageService.getUsername();
    this.authService.updateRelease(selecetedRelease).subscribe({
      next: (res: any) => {
        this.toasterService.success(res?.message);
        this.closeForm();
        this.getReleaseByProjectId()
      }, error: (err) => {
        this.toasterService.error(err?.error?.message);
      }
    })
  }

  // -------------------------------------------------------------------------
  //  6. Form & Drawer Logic
  // -------------------------------------------------------------------------

  openForm() {
    this.showDrawer = true;
    this.releaseForm.reset({
      title: '',
      projectid: null,
      version: '',
      planned_date: new Date().toISOString().split('T')[0],
      released_date: '',
      assigned_to: null,
      status: 'Open',
      mail_content: '',
      file_url: '',
      ismail: false,
      release_type: 'Internal',
      username: this.storageService.getUsername()
    });
  }

  closeForm() {
    this.showDrawer = false;
    this.isEdit = false;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      return;
    }

    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      // Store Data URL in the form
      this.filename = file.name
      this.releaseForm.patchValue({
        file_url: dataUrl
      });
      this.releaseForm.get('file_url')?.markAsTouched();
    };
    reader.onerror = () => {
      console.error('File reading failed');
    };
    reader.readAsDataURL(file);
  }


  saveRelease() {
    if (this.releaseForm.invalid) {
      this.releaseForm.markAllAsTouched();
      return;
    }
    const formValues = this.releaseForm.getRawValue();
    if (this.isEdit) {
      this.selecetedRelease = { ...this.selecetedRelease, ...formValues }
      this.authService.updateRelease(this.selecetedRelease).subscribe({
        next: (res: any) => {
          this.toasterService.success(res?.message);
          this.closeForm();
          this.getReleaseByProjectId()
        }, error: (err) => {
          this.toasterService.error(err?.error?.message);
        }
      })
    } else {
      this.authService.createRelease(formValues).subscribe({
        next: (res: any) => {
          this.toasterService.success(res?.message);
          this.closeForm();
          this.getReleaseByProjectId()
        }, error: (err) => {
          this.toasterService.error(err?.error?.message);
        }
      })
    }
  }

  // ==============
  getProjects() {
    this.authService.getAllProjectsByEmployeeId(this.empid).subscribe({
      next: (res: any) => {
        this.projectList = res
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
  getEmployeelistByProjectId() {
    this.authService.getEmployeelistByProjectId(this.projectid).subscribe({
      next: (res: any) => {
        this.employeeList = res?.employee_list;
      }
    });
  }
  getReleaseByProjectId(callback?: Function) {
    this.authService.getReleaseByProjectId(this.projectid).subscribe({
      next: (res: any) => {
        this.releaseList = res;
        this.table?.updateData(this.releaseList)
        if (callback) callback();
      }
    });
  }
  loadInitialData() {
    this.getStatusList()
    this.getReleaseByProjectId(() => {
      this.initTable();
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
                      <span class="text-main text-bold">${row.title}</span>
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
        title: "code",
        field: "code",
        formatter: (cell: any) => `<span class="text-light-gray">${cell.getValue()}</span>`

      },

      {
        title: "Tittle",
        field: "title",
        frozen: true,
        formatter: taskNameFormatter,
        editor: "input",
        cellClick: (e: any, cell: any) => {
          // Access Button Logic
          if (e.target.closest('.access-btn')) {
            e.stopPropagation();
            const rowData = cell.getRow().getData();
            localStorage.setItem('releaseDetails', JSON.stringify(rowData));
            sessionStorage.setItem('activeProjectTab', 'activity')
            this.router.navigate(
              [`/main/projects/projects-content/release/${this.projectid}/${rowData.id}`],
              { queryParams: { phaseid: rowData.id } }
            );
          }
        }
      },
      {
        title: "Type",
        field: "release_type",
        formatter: typeFormatter,
        hozAlign: "center",
        editor: "list",
        editorParams: {
          values: ['Internal', 'External']
        }
      }, {
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
        title: "Planned on",
        field: "planned_date",
        formatter: dateWithRelativeFormatter,
        editor: "date",
        editorParams: {
          format: "yyyy-MM-dd",
        }
      },
      {
        title: "Released Date",
        field: "released_date",
        formatter: dateWithRelativeFormatter,
        editor: "date",
        editorParams: {
          format: "yyyy-MM-dd",
        }
      },
      // {
      //   title: "project name",
      //   field: "project_name"
      // },

      {
        title: "remark",
        field: "remark",
        editor: "textarea"
      },

      // {
      //   title: "Created", field: "createddate", sorter: "datetime"
      // },
      // { title: "Updated", field: "updateddate", sorter: "datetime" },
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
            this.patchReleaseForm(rowData);
          }
        }
      }
    ];

    const defaultOptions: any = {
      data: this.releaseList,
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
                  <span class="text-muted" style="font-weight: 400;">(${count} Phases)</span>
              </div>
          `;
      },
    };

    this.table = new Tabulator(
      this.el.nativeElement.querySelector('.tabulator-table-release'),
      defaultOptions
    );
    this.table.on("cellEdited", (cell: any) => {

      var rowData = cell.getData();
      rowData.username = this.storageService.getUsername();
     
      this.authService.updateRelease(rowData).subscribe({
        next: (res: any) => {
          this.toasterService.success(res?.message);
          this.getReleaseByProjectId()
        }, error: (err) => {
          this.toasterService.error(err?.error?.message);
        }
      })

    });

  }

  patchReleaseForm(item: any): void {
    if (!item) {
      return;
    }
    this.selecetedRelease = item;
    this.isEdit = true;
    this.releaseForm.patchValue({
      id: item.id ?? null,
      title: item.title ?? '',
      projectid: item.projectid ?? null,
      version: item.version ?? '',
      planned_date: this.normalizeDate(item.planned_date),
      released_date: this.normalizeDate(item.released_date),
      assigned_to: item.assigned_to ?? null,
      status: item.status ?? 'Open',
      mail_content: item.mail_content ?? '',
      file_url: item.file_url ?? '',
      ismail: item.ismail ?? false,
      release_type: item.release_type ?? 'Internal',
      username: item.username ?? this.storageService.getUsername()
    });
    console.log(this.releaseForm.value);

    this.showDrawer = true;
  }
  private normalizeDate(date?: string): string {
    if (!date) {
      return '';
    }
    return date.split('T')[0];
  }

  getNumber0To100(): number {
    return Math.floor(Math.random() * 101);
  }
}