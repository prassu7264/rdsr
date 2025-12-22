import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-due-table',
  templateUrl: './due-table.component.html',
  styleUrls: ['./due-table.component.scss']
})
export class DueTableComponent {
  @Input() dues: any[] = [];
}
