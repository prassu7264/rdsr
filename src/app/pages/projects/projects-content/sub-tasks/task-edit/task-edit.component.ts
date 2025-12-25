import { Component, inject, Input, OnInit, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/core/services/auth.service';
import { ToasterService } from 'src/app/core/services/toaster.service';
interface TaskData {
  id: number;
  taskcode: string;
  projectid: number;
  phaseid: number;
  version: string;
  task: string;
  description: string;
  task_type: string;
  priority: string;
  severity: string | null;
  assigned_from: number;
  assigned_to: number;
  estimated_hours: string;
  worked_hours: string | null;
  start_date: string;
  end_date: string;
  status: string;
  completion_percentage: string;
  isactive: boolean;
  isdelete: boolean;
  created_date: string;
  updated_date: string;
  remark: string | null;
  project_title: string;
  assigned_from_name: string | null;
  assigned_to_name: string;
  phase_title: string;
}
@Component({
  selector: 'app-task-edit',
  templateUrl: './task-edit.component.html',
  styleUrls: ['./task-edit.component.scss']
})
export class TaskEditComponent implements OnInit {
  employeeList: any[] = [];
  statusList: any = []
  constructor(private fb: FormBuilder, private authService: AuthService, private toasterService: ToasterService) {

  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['rawData'] && changes['rawData'].currentValue) {
      console.log(this.rawData);
      this.populateForm();
    }
  }
  @Input() rawData!: TaskData

  taskForm: FormGroup = this.fb.group({
    taskcode: [{ value: '', disabled: true }],
    project_title: [{ value: '', disabled: true }],
    phase_title: [{ value: '', disabled: true }],
    version: [''],
    task: ['', Validators.required],
    description: ['', Validators.required],
    task_type: [''],
    priority: [''],
    assigned_to: [''],
    start_date: [''],
    end_date: [''],
    status: [''],

  });

  ngOnInit() {
    this.getEmployees();
    this.getStatusList();
  }

  populateForm() {
    this.taskForm.patchValue({
      taskcode: this.rawData.taskcode,
      project_title: this.rawData.project_title,
      phase_title: this.rawData.phase_title,
      version: this.rawData.version,
      task: this.rawData.task,
      description: this.rawData.description,
      task_type: this.rawData.task_type,
      priority: this.rawData.priority,
      assigned_to: this.rawData.assigned_to,
      start_date: this.rawData.start_date,
      end_date: this.rawData.end_date,
      status: this.rawData.status
    });
  }

  resetForm() {
    if (confirm("Discard changes?")) {
      this.populateForm();
      this.taskForm.markAsPristine();
    }
  }

  onSubmit() {
    if (this.taskForm.valid) {
      console.log('Form Submitted', this.taskForm.getRawValue());
      const formValue = this.taskForm.getRawValue()
      let task = { ...this.rawData, ...formValue }
      console.log(this.rawData);

      this.authService.updateTask(task).subscribe({
        next: (res: any) => {
          this.toasterService.success(res.message)
        }, error: (err) => { this.toasterService.error(err?.error?.message) }
      })
      this.taskForm.markAsPristine();
    } else {
      this.taskForm.markAllAsTouched();
    }
  }

  getStatusList() {
    this.authService.getStatusList().subscribe({
      next: (res: any) => {
        this.statusList = res;
      }
    });
  }

  getEmployees() {
    this.authService.getEmployeeList().subscribe({
      next: (res: any) => this.employeeList = res
    });
  }
}