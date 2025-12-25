import { Component } from '@angular/core';
import { LayoutService } from 'src/app/core/services/layout.service';

@Component({
  selector: 'app-release-notes',
  templateUrl: './release-notes.component.html',
  styleUrls: ['./release-notes.component.scss']
})
export class ReleaseNotesComponent {
  releaseDetails: any;
  activeProjectTab: string = '';

  constructor(private layoutService: LayoutService) {
    const storedData = localStorage.getItem('releaseDetails');

    this.releaseDetails = storedData ? JSON.parse(storedData) : null;

    console.log(this.releaseDetails);
  }
  ngAfterViewInit(): void {
    Promise.resolve().then(() => {
      this.layoutService.initResponsiveTabs();
      this.activeProjectTab = sessionStorage.getItem("activeProjectTab") || "subtasks";
    });
  }
  setActiveTab(tab: string): void {
    this.activeProjectTab = tab;
  }

}
