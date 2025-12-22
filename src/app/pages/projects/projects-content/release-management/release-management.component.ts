import { Component } from '@angular/core';

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
export class ReleaseManagementComponent {// State
  // -------------------------------------------------------------------------
  //  3. Component Logic & State
  // -------------------------------------------------------------------------

  // State
  currentView: 'table' | 'kanban' | 'add' = 'table';
  searchQuery: string = '';
  draggedReleaseId: string | null = null;

  // Mock Data (Release Management Guide Example)
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

  // Computed Getter for Filtering
  get filteredReleases(): Release[] {
    const query = this.searchQuery.toLowerCase();
    return this.releases.filter(r =>
      r.version.toLowerCase().includes(query) ||
      r.title.toLowerCase().includes(query)
    );
  }

  // View Switching
  setView(view: 'table' | 'kanban' | 'add') {
    this.currentView = view;
  }

  // Search Handling
  onSearchChange(value: string) {
    this.searchQuery = value;
  }

  // ngFor Optimization
  trackById(index: number, item: Release): string {
    return item.id;
  }

  // Filter by Status
  getReleasesByStatus(status: string | string[]) {
    const statuses = Array.isArray(status) ? status : [status];
    return this.filteredReleases.filter(r => statuses.includes(r.status));
  }

  // Count by Status
  getCountByStatus(status: string | string[]) {
    return this.getReleasesByStatus(status).length;
  }

  // Status Style Maps
  getStatusClass(status: string): string {
    switch (status) {
      case 'open': return 'status-open';
      case 'in-progress': return 'status-in-progress';
      case 'testing': return 'status-testing';
      case 'review': return 'status-review';
      case 'failed': return 'status-failed';
      case 'done': return 'status-done';
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
    event.preventDefault(); // Required to allow dropping
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
}