import { AfterViewInit, Component, OnChanges, OnInit } from '@angular/core';
import { LayoutService } from 'src/app/core/services/layout.service';


@Component({
  selector: 'app-projects-content',
  templateUrl: './projects-content.component.html',
  styleUrls: ['./projects-content.component.scss'],

})
export class ProjectsContentComponent implements AfterViewInit, OnInit {
  activeProjectTab: any = "";
  projectDetails: any;
  constructor(private layoutService: LayoutService) {
    sessionStorage.setItem("activeProjectTab", 'tasks');
   }

  ngOnInit(): void {
    const saved = localStorage.getItem('projectDetails');
    this.projectDetails = saved ? JSON.parse(saved) : null;
  }

  ngAfterViewInit(): void {
    Promise.resolve().then(() => {
      this.layoutService.initResponsiveTabs();
      this.activeProjectTab = sessionStorage.getItem("activeProjectTab") || "tasks";
    });
  }
  setActiveTab(tab: string) {
    this.activeProjectTab = tab;
  }
}
