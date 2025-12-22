import { AfterViewInit, Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-issues',
  templateUrl: './issues.component.html',
  styleUrls: ['./issues.component.scss']
})
export class IssuesComponent {
  @Input() tasks: any[] = [];
  ngOnInit(): void { }
}
