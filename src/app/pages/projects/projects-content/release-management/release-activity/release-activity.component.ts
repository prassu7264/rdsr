import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
interface LogEntry {
  id: number;
  empid: number;
  taskid: number | null;
  sub_taskid: number | null;
  phaseid: number | null;
  releaseid: number | null;
  action: string;
  remark: string;
  logdate: string;
  employee_name: string;
}

interface LogGroup {
  dateLabel: string;
  items: LogEntry[];
}
@Component({
  selector: 'app-release-activity',
  templateUrl: './release-activity.component.html',
  styleUrls: ['./release-activity.component.scss']
})
export class ReleaseActivityComponent implements OnInit {

  releaseid: any = 0;
  constructor(private authService: AuthService, private route: ActivatedRoute) {
    this.releaseid = this.route.snapshot.paramMap.get('releaseid');

  }

  ngOnInit(): void {
   

    this.getActivityLogs(this.releaseid)
  }

  getActivityLogs(taskid: any) {
    this.authService.getActivityLogs('release', taskid, 'all').subscribe({
      next: (res: any) => {
        console.log(res);
        this.logs = res;
        this.filterLogs()
      }
    })
  }

  searchQuery: string = '';
  totalEvents: number = 0;

  logs: LogEntry[] = [];

  groupedLogs: LogGroup[] = [];



  filterLogs() {
    const query = this.searchQuery.toLowerCase();

    let filtered = this.logs.filter(item => {
      return (
        item.action.toLowerCase().includes(query) ||
        item.remark.toLowerCase().includes(query) ||
        item.employee_name.toLowerCase().includes(query)
      );
    });

    // Sort by Date Descending
    filtered.sort((a, b) => new Date(b.logdate).getTime() - new Date(a.logdate).getTime());

    this.groupedLogs = this.groupByDate(filtered);
    // this.filteredCount = filtered.length;
  }

  groupByDate(items: LogEntry[]): LogGroup[] {
    const groups: { [key: string]: LogEntry[] } = {};

    items.forEach(item => {
      const date = new Date(item.logdate);
      const today = new Date();
      const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);

      let label = date.toLocaleDateString();

      if (date.toDateString() === today.toDateString()) label = 'Today';
      else if (date.toDateString() === yesterday.toDateString()) label = 'Yesterday';
      else label = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

      if (!groups[label]) groups[label] = [];
      groups[label].push(item);
    });

    return Object.keys(groups).map(key => ({ dateLabel: key, items: groups[key] }));
  }

  refreshFeed() {
    const btn = document.querySelector('.btn-icon i');
    btn?.classList.add('spin');
    setTimeout(() => btn?.classList.remove('spin'), 1000);
    this.searchQuery = '';
    this.filterLogs();
  }

  clearSearch() {
    this.searchQuery = '';
    this.filterLogs();
  }

  // --- HELPERS ---

  getActionStyle(action: string): { icon: string, class: string } {
    const lower = action.toLowerCase();
    if (lower.includes('creat')) return { icon: 'ri-add-line', class: 'style-create' };
    if (lower.includes('edit') || lower.includes('update')) return { icon: 'ri-pencil-line', class: 'style-update' };
    if (lower.includes('delet') || lower.includes('remov')) return { icon: 'ri-delete-bin-line', class: 'style-delete' };
    if (lower.includes('assign')) return { icon: 'ri-user-add-line', class: 'style-update' };
    return { icon: 'ri-information-line', class: 'style-default' };
  }

  getInitials(name: string): string {
    if (!name) return 'RS';
    const parts = name.split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  }

  getAvatarColor(name: string): string {
    if (!name) return '#3B82F6';
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#EC4899'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  }

  formatTime(isoStr: string): string {
    return new Date(isoStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}

