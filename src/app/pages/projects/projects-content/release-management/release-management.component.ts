import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from 'src/app/core/services/auth.service';
import { StorageService } from 'src/app/core/services/storage.service';

// -------------------------------------------------------------------------
//  1. Data Models & Types
// -------------------------------------------------------------------------

type LifecycleStatus =
  | 'open'        // 1. Planning & Scoping
  | 'in-progress' // 2. Build & Development
  | 'testing'     // 3. Quality Assurance
  | 'review'      // 4. UAT & Staging
  | 'failed'      // 5. Blocked or Rolled Back
  | 'done';       // 6. Production Deployment

// View Model for the Dashboard
interface Release {
  id: string;
  version: string;
  title: string;
  status: LifecycleStatus;
  progress: number;
  date: string;       // Target or Release Date
  owner: string;
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
  availableList = ['Open', 'In-Progress', 'In-Testing', 'In-Review', 'failed', 'Completed']

  // -------------------------------------------------------------------------
  //  3. Component Logic & State
  // -------------------------------------------------------------------------
  empid: any = 0
  // State
  currentView: 'table' | 'kanban' = 'table';
  searchQuery: string = '';
  draggedReleaseId: string | null = null;
  showDrawer: boolean = false;


  constructor(private authService: AuthService, private storageService: StorageService) {
    this.empid = this.storageService.getEmpId();
  }
  ngOnInit(): void {
    this.getProjects();
    this.getStatusList();
  }

  // Mock Data for Selects
  projectList: any = [];
  statusList: any = []
  users = [
    { id: 1, name: 'John Doe' },
    { id: 2, name: 'Alex M.' },
    { id: 3, name: 'Sarah J.' },
    { id: 4, name: 'Rob L.' },
    { id: 5, name: 'Mike K.' }
  ];



  // Reactive Form Definition - ALL FIELDS REQUIRED
  releaseForm = new FormGroup({
    code: new FormControl('', Validators.required),
    projectid: new FormControl<number | null>(null, Validators.required),
    version: new FormControl('', Validators.required),
    planned_date: new FormControl(new Date().toISOString().split('T')[0], Validators.required),
    released_date: new FormControl('', Validators.required),
    assigned_to: new FormControl<number | null>(null, Validators.required),
    status: new FormControl<LifecycleStatus>('open', { nonNullable: true, validators: Validators.required }),
    // Removed username field
    mail_content: new FormControl('', Validators.required),
    file_url: new FormControl('', Validators.required)
  });

  // Mock Data
  releases: Release[] = [
    {
      id: '1', version: 'v2.5.0-plan', title: 'Q4 Strategy Features',
      status: 'open', progress: 10, date: 'Dec 01, 2025',
      owner: 'John D.', ownerInitials: 'JD', ownerColor: 'var(--c-teal)'
    },
    {
      id: '2', version: 'v2.4.2', title: 'Payment Integration',
      status: 'in-progress', progress: 45, date: 'Nov 15, 2025',
      owner: 'Alex M.', ownerInitials: 'AM', ownerColor: 'var(--c-blue)'
    },
    {
      id: '3', version: 'v2.4.1', title: 'Bugfix: Auth Timeout',
      status: 'testing', progress: 85, date: 'Oct 30, 2025',
      owner: 'Sarah J.', ownerInitials: 'SJ', ownerColor: 'var(--c-orange)'
    },
    {
      id: '4', version: 'v2.4.0', title: 'New Dashboard UI',
      status: 'review', progress: 95, date: 'Oct 28, 2025',
      owner: 'Rob L.', ownerInitials: 'RL', ownerColor: '#7c3aed'
    },
    {
      id: '5', version: 'v2.3.9', title: 'Legacy Cleanup',
      status: 'failed', progress: 90, date: 'Oct 26, 2025',
      owner: 'Mike K.', ownerInitials: 'MK', ownerColor: 'var(--c-red)'
    },
    {
      id: '6', version: 'v2.3.0', title: 'Initial Release',
      status: 'done', progress: 100, date: 'Sep 01, 2025',
      owner: 'Anna B.', ownerInitials: 'AB', ownerColor: 'var(--c-green)'
    },
    {
      id: '7', version: 'v2.6.0', title: 'Future AI features',
      status: 'open', progress: 0, date: 'Jan 01, 2026',
      owner: 'Sam W.', ownerInitials: 'SW', ownerColor: 'var(--c-teal)'
    }
  ];

  // -------------------------------------------------------------------------
  //  4. Helpers & Actions
  // -------------------------------------------------------------------------

  get filteredReleases(): Release[] {
    const query = this.searchQuery.toLowerCase();
    return this.releases.filter(r =>
      r.version.toLowerCase().includes(query) ||
      r.title.toLowerCase().includes(query)
    );
  }

  setView(view: 'table' | 'kanban') {
    this.currentView = view;
  }

  onSearchChange(value: string) {
    this.searchQuery = value;
  }

  trackById(index: number, item: Release): string {
    return item.id;
  }

  getReleasesByStatus(status: string | string[]) {
    const statuses = Array.isArray(status) ? status : [status];
    return this.filteredReleases.filter(r => statuses.includes(r.status));
  }

  getCountByStatus(status: string | string[]) {
    return this.getReleasesByStatus(status).length;
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'open': return 'rls-release-open';
      case 'in-progress': return 'rls-release-in-progress';
      case 'testing': return 'rls-release-testing';
      case 'review': return 'rls-release-review';
      case 'failed': return 'rls-release-failed';
      case 'done': return 'rls-release-done';
      default: return '';
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'open': return 'var(--c-green)';
      case 'in-progress': return 'var(--c-blue)';
      case 'testing': return 'var(--c-orange)';
      case 'review': return 'var(--c-purple)';
      case 'failed': return 'var(--c-red)';
      case 'done': return 'var(--success)';
      default: return 'var(--text-muted)';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'open': return 'Open';
      case 'in-progress': return 'In Progress';
      case 'testing': return 'Testing';
      case 'review': return 'Review';
      case 'failed': return 'Failed';
      case 'done': return 'Done';
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
    this.releases = this.releases.map(item =>
      item.id === id ? { ...item, status: newStatus } : item
    );
  }

  // -------------------------------------------------------------------------
  //  6. Form & Drawer Logic
  // -------------------------------------------------------------------------

  openForm() {
    this.showDrawer = true;
    this.releaseForm.reset({
      code: '',
      projectid: null,
      version: '',
      planned_date: new Date().toISOString().split('T')[0],
      released_date: '',
      assigned_to: null,
      status: 'open',
      mail_content: '',
      file_url: ''
    });
  }

  closeForm() {
    this.showDrawer = false;
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.releaseForm.patchValue({ file_url: file.name });
      // Mark as touched so validation shows up if they select then cancel (rare but good practice)
      this.releaseForm.get('file_url')?.markAsTouched();
    }
  }

  saveRelease() {
    if (this.releaseForm.invalid) {
      this.releaseForm.markAllAsTouched(); // Trigger validation UI
      return;
    }

    const formValues = this.releaseForm.getRawValue();

    // Map assigned user name based on ID for display
    let assignedUserName = 'Current User';
    if (formValues.assigned_to) {
      const foundUser = this.users.find(u => u.id === formValues.assigned_to);
      if (foundUser) assignedUserName = foundUser.name;
    }

    const releaseToAdd: Release = {
      id: (this.releases.length + 1).toString(),
      version: formValues.version || 'vX.X.X',
      title: formValues.code || 'Untitled Release',
      status: formValues.status,
      progress: 0,
      date: formValues.planned_date || 'TBD',
      owner: assignedUserName,
      ownerInitials: (assignedUserName || 'U').substring(0, 2).toUpperCase(),
      ownerColor: 'var(--c-blue)'
    };
console.log(formValues);

    this.releases.push(releaseToAdd);
    this.closeForm();
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
}