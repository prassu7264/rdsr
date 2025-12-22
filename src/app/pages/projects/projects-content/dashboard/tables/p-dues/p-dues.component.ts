import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-p-dues',
  templateUrl: './p-dues.component.html',
  styleUrls: ['./p-dues.component.scss']
})
export class PDuesComponent {
  @Input() dues: any = []
}
