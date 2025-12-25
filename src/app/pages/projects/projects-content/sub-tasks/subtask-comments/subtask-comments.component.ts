import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { StorageService } from 'src/app/core/services/storage.service';
import { ToasterService } from 'src/app/core/services/toaster.service';
import Swal from 'sweetalert2';
interface RawData {
  id: number;
  code: string;
  empid: number;
  taskid: number;
  sub_taskid: number;
  phaseid: number;
  releaseid: number;
  comments: string;
  isdelete: boolean;
  created_date: string;
  updated_date: string;
  employee_name: string;
}

interface AppComment {
  id: number;
  author: { id: string; name: string; avatarUrl?: string; };
  content: string;
  timestamp: Date;
  isEditing?: boolean;
}

@Component({
  selector: 'app-subtask-comments',
  templateUrl: './subtask-comments.component.html',
  styleUrls: ['./subtask-comments.component.scss']
})
export class SubtaskCommentsComponent {

  taskid: any = 0;
  empid: any = 0;
  constructor(private authService: AuthService, private storageService: StorageService, private toasterService: ToasterService, private route: ActivatedRoute) {
    this.taskid = this.route.snapshot.paramMap.get('taskid');
    this.empid = this.storageService.getEmpId();
  }


  createComments(payload: any) {
    this.authService.createComments(payload).subscribe({
      next: (res) => {
        this.getComments();
      }, error: (err) => {

      }
    })
  }
  getComments() {
    this.authService.getComments('task', this.taskid).subscribe({
      next: (res: any) => {
        this.rawComments = res;
        this.processComments();
      }, error: (err) => {

      }
    })
  }
  rawComments: RawData[] = [
    {
      "id": 1, "code": "CMD000001", "empid": 4, "taskid": 2, "sub_taskid": 0, "phaseid": 0, "releaseid": 0,
      "comments": "Work started on the backend integration.", "isdelete": false, "created_date": "2025-12-24T17:59:54",
      "updated_date": "2025-12-24T17:59:54", "employee_name": "Raj babu p"
    }
  ];

  comments: AppComment[] = [];
  editCache: any = '';
  commentControl = new FormControl('', [Validators.required, Validators.minLength(1)]);
  ngOnInit() {
    this.getComments()
  }

  processComments() {
    this.comments = this.rawComments.map(raw => ({
      id: raw.id,
      author: { id: raw.empid.toString(), name: raw.employee_name },
      content: raw.comments,
      timestamp: new Date(raw.created_date),
      isEditing: false
    })).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  trackById(index: number, item: AppComment) { return item.id; }

  addComment() {
    if (this.commentControl.valid && this.commentControl.value?.trim()) {
      const content = this.commentControl.value.trim();
      let payload = {
        "empid": this.empid,
        "taskid": this.taskid,
        "sub_taskid": 0,
        "phaseid": 0,
        "releaseid": 0,
        "comments": this.commentControl.value?.trim(),
        username: this.storageService.getUsername()
      }

      this.createComments(payload)
      this.commentControl.reset();
    }
  }

  deleteComment(id: number) {

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
        this.authService.deleteComment(this.storageService.getUsername(), id).subscribe({
          next: (res: any) => {
            this.toasterService.success(res?.message)
            this.comments = this.comments.filter(c => c.id !== id);
          }, error: (err) => {
            this.toasterService.error(err?.error?.message)
          }
        });


      }
    });

  }

  enableEdit(comment: AppComment) {
    this.comments.forEach(x => x.isEditing = false);
    this.editCache = comment.content;
    comment.isEditing = true;
  }

  cancelEdit(comment: AppComment) {
    comment.isEditing = false;
    this.editCache = '';
  }

  saveEdit(comment: AppComment) {
    console.log(comment);
    if (this.editCache.trim()) {
      comment.content = this.editCache.trim();
      comment.isEditing = false;
      let oldComment: any = this.rawComments.find(e => e.id === comment?.id)
      oldComment.comments = this.editCache.trim();
      this.authService.updatecomments(oldComment).subscribe({
        next: (res: any) => {
          this.toasterService.success(res?.message);
        }, error: (err) => {
          this.toasterService.error(err?.error?.message)
        }
      })
    }

  }

  getInitials(name: string) { return name ? name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : '??'; }

  getAvatarColor(name: string) {
    if (!name) return "#EF4444";
    const colors = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash % colors.length)];
  }

  formatTime(d: Date) {
    const diff = new Date().getTime() - d.getTime();
    if (diff < 0) return 'Just now';
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago';
    if (diff < 86400000) return Math.floor(diff / 3600000) + 'h ago';
    return d.toLocaleDateString();
  }
}