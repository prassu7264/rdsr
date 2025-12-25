import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
// Raw data interface matching your JSON
interface TaskLog {
  id: number;
  empid: number;
  taskid: number;
  sub_taskid: number | null;
  phaseid: number | null;
  releaseid: number | null;
  action: string;
  remark: string;
  status: string;
  logdate: string;
  employee_name: string | null;
}

// Display interface
interface TimelineEvent {
  id: number;
  title: string;
  description: string;
  status: string;
  assignee: string;
  duration: string; // Display string for time/duration
}
@Component({
  selector: 'app-subtask-status-timeline',
  templateUrl: './subtask-status-timeline.component.html',
  styleUrls: ['./subtask-status-timeline.component.scss']
})
export class SubtaskStatusTimelineComponent {
  taskid: any = 0;
  constructor(private authService: AuthService, private route: ActivatedRoute) {
    this.taskid = this.route.snapshot.paramMap.get('taskid');
  }

  ngOnInit(): void {
    console.log(this.taskid);

    this.getActivityLogs(this.taskid);
  }

  getActivityLogs(taskid: any) {
    this.authService.getActivityLogs('task', taskid, 'status').subscribe({
      next: (res: any) => {
        // this.logs = res;
        this.rawLogs = res;
        this.processData();
      }
    })
  }
  // Provided JSON Data
  rawLogs: TaskLog[] = [
  ];

  events: TimelineEvent[] = [];



  processData() {
    // 1. Sort by Logdate (Time)
    const sorted = [...this.rawLogs].sort((a, b) => {
      return new Date(a.logdate).getTime() - new Date(b.logdate).getTime();
    });

    // 2. Map to display format and calculate durations
    this.events = sorted.map((log, index) => {
      let durationStr = "";

      if (index === 0) {
        // First event: Display relative time from now with "ago"
        const date = new Date(log.logdate);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();

        // Handle potential future dates or extremely small diffs
        if (diffMs < 0) {
          durationStr = "Just now";
        } else {
          durationStr = this.formatDuration(diffMs) + " ago";
        }
      } else {
        // Subsequent events: Calculate diff from previous
        const prev = sorted[index - 1];
        const diffMs = new Date(log.logdate).getTime() - new Date(prev.logdate).getTime();
        durationStr = this.formatDuration(diffMs);
      }

      return {
        id: log.id,
        title: log.action,
        description: log.remark,
        status: log.status,
        assignee: log.employee_name || '', // Handle null
        duration: durationStr
      };
    });
  }

  // Helper to format milliseconds into readable duration with full words
  formatDuration(ms: number): string {
    if (ms < 1000) return "0 seconds";

    // Constants for approximations
    const ONE_SECOND = 1000;
    const ONE_MINUTE = 60 * ONE_SECOND;
    const ONE_HOUR = 60 * ONE_MINUTE;
    const ONE_DAY = 24 * ONE_HOUR;
    const ONE_MONTH = 30 * ONE_DAY; // Approximate
    const ONE_YEAR = 365 * ONE_DAY; // Approximate

    const years = Math.floor(ms / ONE_YEAR);
    const months = Math.floor((ms % ONE_YEAR) / ONE_MONTH);
    const days = Math.floor((ms % ONE_MONTH) / ONE_DAY);
    const hours = Math.floor((ms % ONE_DAY) / ONE_HOUR);
    const minutes = Math.floor((ms % ONE_HOUR) / ONE_MINUTE);
    const seconds = Math.floor((ms % ONE_MINUTE) / ONE_SECOND);

    const parts = [];
    if (years > 0) parts.push(`${years} ${years === 1 ? 'year' : 'years'}`);
    if (months > 0) parts.push(`${months} ${months === 1 ? 'month' : 'months'}`);
    if (days > 0) parts.push(`${days} ${days === 1 ? 'day' : 'days'}`);
    if (hours > 0) parts.push(`${hours} ${hours === 1 ? 'hour' : 'hours'}`);
    if (minutes > 0) parts.push(`${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`);
    if (seconds > 0) parts.push(`${seconds} ${seconds === 1 ? 'second' : 'seconds'}`);

    return parts.join(' ');
  }

  getStatusClass(status: string): string {
    const s = status;

    if (["Open", "Approved", "Completed", "Invoiced", "Closed", "Planning"].includes(s)) {
      return 'open';
    }

    if (["In-Progress", "Active", "On-Track", "In-Testing", "In-Review", "To-be-Tested"].includes(s)) {
      return 'progress';
    }

    if (["Delayed", "Cancelled", "On-Hold"].includes(s)) {
      return 'delayed pending';
    }

    return 'pending';
  }
}