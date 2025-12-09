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
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

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
    IssuesComponent],
  imports: [
    CommonModule,
    SharedModule,
    ReactiveFormsModule
  ],
  exports: [ProjectsContentComponent]
})
export class ProjectsContentModule { }
