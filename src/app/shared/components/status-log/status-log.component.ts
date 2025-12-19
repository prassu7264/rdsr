import {
  Component,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService } from 'src/app/core/services/auth.service';
import { StorageService } from 'src/app/core/services/storage.service';
import { ToasterService } from 'src/app/core/services/toaster.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-status-log',
  templateUrl: './status-log.component.html',
  styleUrls: ['./status-log.component.scss']
})
export class StatusLogComponent implements OnInit, OnChanges {
  date = new Date();
  @Input() projects: any[] = [];
  @Input() selectedTask: any;
  selectedDsr: any = {};
  data: any[] = [];

  currFilter: 'all' | 'green' | 'amber' | 'red' = 'all';
  editId: number | null = null;

  /* ================= FORM ================= */

  taskForm = this.fb.group({
    id: [0],
    subtaskid: [{ value: null, disabled: true }, Validators.required],
    worked_hours: ['08:00:00', Validators.required],
    comments: ['', Validators.required],
    completion_percentage: [25, Validators.required],
    username: [this.storageService.getUsername()],
    date: [this.formattedDate]
  });

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toasterService: ToasterService,
    private storageService: StorageService
  ) { }

  /* ================= LIFECYCLE ================= */

  ngOnInit(): void {
    this.patchTask();
    this.getDsrDetailsBySubtaskId();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedTask']) {
      this.patchTask();
    }
  }

  private patchTask(): void {
    if (this.selectedTask?.id) {
      this.taskForm.patchValue({
        subtaskid: this.selectedTask.id,
        date: this.formattedDate,
        username: this.storageService.getUsername(),
      });
    }
  }

  /* ================= FILTERS ================= */
  private readonly FILTER_RANGES: any = {
    green: { min: 70, max: 100 },
    amber: { min: 30, max: 69 },
    red: { min: 0, max: 29 }
  };

  get filteredData(): any[] {
    if (this.currFilter === 'all') {
      return this.data;
    }

    const range = this.FILTER_RANGES[this.currFilter];

    return this.data.filter(d =>
      d.completion_percentage >= range.min &&
      d.completion_percentage <= range.max
    );
  }


  get totalTime(): string {
    const seconds = this.filteredData.reduce(
      (sum, d) => sum + this.timeToSeconds(d.worked_hours),
      0
    );
    return this.secondsToTime(seconds);
  }

  /* ================= UI HELPERS ================= */

  getProgressColor(): string {
    const v = this.taskForm.get('completion_percentage')?.value || 0;
    if (v < 30) return 'var(--color-low)';
    if (v < 70) return 'var(--color-med)';
    return 'var(--color-high)';
  }

  setCompletion(val: number): void {
    this.taskForm.patchValue({ completion_percentage: val });
  }

  getStatus(v: number): 'green' | 'amber' | 'red' {
    if (v < 30) return 'red';
    if (v < 70) return 'amber';
    return 'green';
  }

  /* ================= TIME UTILS ================= */

  private timeToSeconds(time: string): number {
    if (!time) return 0;
    const p = time.split(':').map(Number);
    return p.length === 3
      ? p[0] * 3600 + p[1] * 60 + p[2]
      : p[0] * 3600 + p[1] * 60;
  }

  private secondsToTime(total: number): string {
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
  }

  /* ================= ACTIONS ================= */
  submit(): void {
    if (this.taskForm.invalid) return;

    // Always get raw value (includes disabled controls)
    const form = this.taskForm.getRawValue();

    // Build payload cleanly
    const payload = this.editId
      ? { ...this.selectedDsr, ...form, id: this.editId }
      : { ...form };

    this.authService.createDailyStatus(payload).subscribe({
      next: (res: any) => {
        this.toasterService.success(res?.message);
        this.getDsrDetailsBySubtaskId();
        this.resetForm(payload.subtaskid);
      },
      error: (err) => {
        this.toasterService.error(err?.error?.message);
      }
    });
  }

  private resetForm(subtaskid: any): void {
    this.editId = null;

    this.taskForm.reset({
      subtaskid,
      worked_hours: '08:00:00',
      completion_percentage: 25,
      comments: '',
      username: this.storageService.getUsername(),
      date: this.formattedDate
    });

    // ensure subtask remains disabled
    this.taskForm.get('subtaskid')?.disable();
  }

  edit(item: any): void {
    this.editId = item.id;
    this.selectedDsr = item;
    console.log(item);
    this.taskForm.patchValue({
      worked_hours: item.worked_hours,
      comments: item.comments,
      completion_percentage: item.completion_percentage
    });
  }

  delete(id: number): void {
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
        this.authService.deleteDsr(this.storageService.getUsername(), id).subscribe({
          next: (res: any) => {
            this.toasterService.success(res?.message);
            this.data = this.data.filter(d => d.id !== id);
            if (this.editId === id) {
              this.editId = null;
            }
          },
          error: (err) => {
            this.toasterService.success(err?.error?.message)
          }
        })
      }
    });
  }
  get formattedDate(): string {
    const d = this.date;
    const month = String(d.getMonth() + 1).padStart(2, '0'); // month 0-11
    const day = String(d.getDate()).padStart(2, '0');
    const year = d.getFullYear();
    return `${year}-${month}-${day}`;
  }

  getDsrDetailsBySubtaskId() {
    this.authService.getDsrDetailsBySubtaskId(this.selectedTask?.id).subscribe({
      next: (value: any) => {
        this.data = value;
      }
    })
  }

}
