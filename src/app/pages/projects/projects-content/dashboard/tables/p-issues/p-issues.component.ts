import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-p-issues',
  templateUrl: './p-issues.component.html',
  styleUrls: ['./p-issues.component.scss']
})
export class PIssuesComponent {
  @Input() tasks: any[] = [];
}
