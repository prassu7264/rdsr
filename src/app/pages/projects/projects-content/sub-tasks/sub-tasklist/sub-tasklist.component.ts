import { Component, ElementRef, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { CommonService } from 'src/app/core/services/common.service';
import { StorageService } from 'src/app/core/services/storage.service';
import { ToasterService } from 'src/app/core/services/toaster.service';
import Swal from 'sweetalert2';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
declare var luxon: any
@Component({
  selector: 'app-sub-tasklist',
  templateUrl: './sub-tasklist.component.html',
  styleUrls: ['./sub-tasklist.component.scss']
})
export class SubTasklistComponent implements OnInit {
  isEditMode: any = false;
  cUsername = this.storageService.getUsername();
  selectTask: any = {}
  taskid: any = 0;
  statusList: any = [];
  subTaskList: any = [];
  viewOptions: any = {};
  columns: any = [];
  isFilterOpen: any = false;
  drawerType: 'filter' | 'dsr' | null = 'filter';
  minDate: string = new Date().toISOString().split('T')[0];
  private table: Tabulator | undefined;
  constructor(private el: ElementRef, private authService: AuthService,
    private toasterService: ToasterService, private storageService: StorageService,
    private route: ActivatedRoute, private commonService: CommonService,
    private fb: FormBuilder) {
    this.taskid = this.route.snapshot.paramMap.get('taskid');
  }


  ngOnInit(): void {
    console.log(this.taskid);
    this.loadInitialData(this.taskid);
  }

  loadInitialData(taskid?: any) {
    this.taskid = taskid
    this.getStatusList();
    this.getSubtasks(() => {
      this.initTable();
    });
  }
  closeDrawer() {
    this.drawerType = 'filter';
    this.toggleSideTab()
  }
  toggleSideTab(type?: any) {
    console.log(type);
    this.isFilterOpen = !this.isFilterOpen;
    if (type === 'New') {
      this.isEditMode = false;
      let empid = this.storageService.getEmpId();
      this.taskForm.reset({
        id: null,
        worked_hours: '08:00:00',
        completion_percentage: 0,
        taskid: this.taskid,
        employeeid: empid
      });
    }
  }
  onViewSelected(item: any) {
    this.initTable(item.id)
  }
  getStatusList() {
    this.authService.getStatusList().subscribe({
      next: (res: any) => {
        this.statusList = res;
      }
    });
  }

  getSubtasks(callback?: Function) {
    this.authService.getSubtasks(this.taskid).subscribe({
      next: (res: any) => {
        this.subTaskList = res;
        this.table?.replaceData(res);
        this.viewOptions = this.commonService.getFieldLabels(this.subTaskList);
        if (callback) callback();
      }
    });
  }

  createSubtask(payload: any) {
    this.authService.createSubtask(payload).subscribe({
      next: (res: any) => {
        this.toasterService.success(res?.message);
        // this.loadInitialData(this.taskid);
        this.getSubtasks()
        this.toggleSideTab();
      }, error: (err) => {
        this.toasterService.error(err?.error?.message)
      }
    });
  }
  updateSubtask(payload: any) {
    this.authService.updateSubtask(payload).subscribe({
      next: (res: any) => {
        this.toasterService.success(res?.message);
        // this.loadInitialData(payload.taskid);
        this.getSubtasks()
        this.toggleSideTab();
      }, error: (err) => {
        this.toasterService.error(err?.error?.message)
      }
    });
  }
  private initTable(viewby: any = "") {

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
                  </div>
              </div>
             
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

    this.columns = [
      {
        title: "Task Name",
        field: "task",
        frozen: true,
        formatter: taskNameFormatter,
        minWidth: 300,
        widthGrow: 2,
        editor: "textarea",
        cellClick: (e: any, cell: any) => {
          // Access Button Logic
          if (e.target.closest('.access-btn')) {
            e.stopPropagation();
            const rowData = cell.getRow().getData();
            // localStorage.setItem('projectDetails', JSON.stringify(rowData));
            // this.router.navigate([`/main/projects/projects-content/${this.projectid}/${rowData.id}`]);
          }
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
      // {
      //   title: "Owner",
      //   field: "assigned_to_name",
      //   hozAlign: "center",
      // },
      {
        title: "Start Date",
        field: "start_date",
        // formatter: dateWithRelativeFormatter,

      },
      {
        title: "Due Date",
        field: "end_date",
        formatter: dateWithRelativeFormatter,
        width: 140,
        // editor: "date",
        // editorParams: {
        //   format: "yyyy-MM-dd",
        // }
      },
      {
        title: "Duration",
        field: "estimated_hours",
        formatter: officeHoursDaysFormatter
      },
      {
        title: "Work hours",
        field: "worked_hours",
        formatter: officeHoursDaysFormatter
      },
      {
        title: "Completion", field: "tasks_done", width: 180, headerSort: false,
        formatter: taskProgressFormatter, editorParams: { min: 0, max: 100 }
      },
      { title: "Description", field: "description", editor: "textarea" },
      {
        title: "Actions",
        field: "actions",
        headerSort: false,
        frozen: true,
        hozAlign: "center",
        formatter: () => {
          return `
            <button  class="edit"
              style="border:none;background:transparent;cursor:pointer;padding:4px;">
              <i class="ri-edit-2-line edit" style="font-size:18px;color:var(--c-blue);"></i>
            </button>
             <button class="dsr"
              style="border:none;background:transparent;cursor:pointer;padding:4px; ">
              <i class="ri-question-answer-line dsr" style="font-size:18px;color:var(--warning);"></i>
            </button>
     
            <button class="delete"
              style="border:none;background:transparent;cursor:pointer;padding:4px;">
              <i class="ri-delete-bin-6-line delete" style="font-size:18px;color:var(--danger);"></i>
            </button>
          `;
        }
        ,
        cellClick: (e: any, cell: any) => {
          const rowData = cell.getRow().getData();
          this.selectTask = rowData;
          if (e.target.classList.contains("edit")) {
            this.patchTaskForm(rowData);
            this.toggleSideTab();
          }
          if (e.target.classList.contains("dsr")) {
            this.drawerType = 'dsr';
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
                this.authService.deleteSubtask(this.cUsername, rowData.id).subscribe({
                  next: (res: any) => {
                    this.toasterService.success(res?.message)
                    this.loadInitialData(this.taskid);
                    // this.getSubtasks()
                  }
                });


              }
            });
          }

        }
      }
    ];

    const defaultOptions: any = {
      data: this.subTaskList,
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
      groupStartOpen: true,
      groupHeader: function (value: any, count: any, data: any, group: any) {
        return `
              <div class="flex-row">
                  <i class="ri-stack-line" style="color: var(--primary); font-size: 16px;"></i>
                  <span class="text-main text-bold">${value || 'Unassigned'}</span>
                  <span class="text-muted" style="font-weight: 400;">(${count} sub-tasks)</span>
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
      this.authService.updateSubtask(this.selectTask).subscribe({
        next: (res: any) => {
          this.toasterService.success(res?.message);
          // this.loadInitialData(this.taskid);
          this.getSubtasks()
        }, error: (err) => {
          this.toasterService.error(err?.error?.message)
        }
      });
    });

  }

  taskForm = this.fb.group({
    id: [null],
    task: ['Sub task for task 1', Validators.required],
    priority: ['High', Validators.required],
    status: ['In-Progress', Validators.required],
    start_date: ['2025-12-09', Validators.required],
    end_date: ['2025-12-10', Validators.required],
    // estHours: ['16:00', Validators.required],
    worked_hours: ['08:00:00', Validators.required],
    completion_percentage: [75], // Optional, handled by slider
    description: ['sub task for task 1', Validators.required],
    taskid: [this.taskid, Validators.required],
    employeeid: ['0', Validators.required]
  });


  // Helper method to check validation status
  isFieldInvalid(fieldName: string): boolean {
    const field = this.taskForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getProgressColor(): string {
    const completion = this.taskForm.get('completion_percentage')?.value || 0;
    if (completion < 30) return 'var(--color-low)';
    if (completion < 70) return 'var(--color-med)';
    return 'var(--color-high)';
  }

  setCompletion(val: number) {
    this.taskForm.patchValue({ completion_percentage: val });
  }

  saveTask() {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return
    }
    console.log(this.isEditMode);

    if (!this.isEditMode) {
      this.taskForm.get('taskid')?.setValue(this.taskid);
      let empid = this.storageService.getEmpId();
      this.taskForm.get('employeeid')?.setValue(empid);
      this.createSubtask(this.taskForm.value)
    } else {
      this.selectTask = { ...this.selectTask, ...this.taskForm.value }
      this.updateSubtask(this.selectTask);
    }
  }

  patchTaskForm(data: any): void {
    if (!this.taskForm) {
      return;
    }
    this.isEditMode = true;
    this.taskForm.patchValue({
      id: data.id ?? null,
      task: data.task,
      priority: data.priority,
      status: data.status,
      start_date: data.start_date,
      end_date: data.end_date,
      worked_hours: data.worked_hours,
      completion_percentage: data.completion_percentage ?? 0,
      description: data.description,
      taskid: data.taskid,
      employeeid: data.employeeid
    });


  }



}
