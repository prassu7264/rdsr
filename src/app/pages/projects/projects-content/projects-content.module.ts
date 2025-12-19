import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectsContentComponent } from './projects-content.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { TasksComponent } from './tasks/tasks.component';
import { UsersComponent } from './users/users.component';
import { ReportsComponent } from './reports/reports.component';
import { PhasesComponent } from './phases/phases.component';
import { TimeLogsComponent } from './time-logs/time-logs.component';
import { TimesheetComponent } from './timesheet/timesheet.component';
import { DocumentsComponent } from './documents/documents.component';
import { IssuesComponent } from './issues/issues.component';
import { SharedModule } from 'src/app/shared/shared.module';
import {  FormsModule, ReactiveFormsModule } from '@angular/forms';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatIconModule} from '@angular/material/icon';
import { SubTasksComponent } from './sub-tasks/sub-tasks.component';
import { SubTasklistComponent } from './sub-tasks/sub-tasklist/sub-tasklist.component';
import {MatSelectModule} from '@angular/material/select';
import {MatMenuModule} from '@angular/material/menu';
@NgModule({
  declarations: [
    ProjectsContentComponent,
    DashboardComponent,
    TasksComponent,
    UsersComponent,
    ReportsComponent,
    PhasesComponent,
    TimeLogsComponent,
    TimesheetComponent,
    DocumentsComponent,
    IssuesComponent,
    SubTasksComponent,
    SubTasklistComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    MatExpansionModule,
    MatIconModule,
    MatSelectModule,
    MatMenuModule
  ],
  exports: [ProjectsContentComponent]
})
export class ProjectsContentModule { }
