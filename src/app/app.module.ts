import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';

import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { SidebarComponent } from './layout/sidebar/sidebar.component';
import { HeaderComponent } from './layout/header/header.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AnalyticsComponent } from './pages/analytics/analytics.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { SecurityComponent } from './pages/security/security.component';
import { GeneralComponent } from './pages/general/general.component';
import { BillingComponent } from './pages/billing/billing.component';
import { LogsComponent } from './pages/logs/logs.component';

import { AppRoutingModule } from './app-routing.module';
import { ProjectsComponent } from './pages/projects/projects.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { LoginComponent } from './pages/login/login.component';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { AuthInterceptor } from './_helper/auth.interceptor';
import { ToastrModule } from 'ngx-toastr';
import { MatIconModule } from '@angular/material/icon';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ViewSelectorComponent } from './shared/components/view-selector/view-selector.component';
import { UserFormComponent } from './shared/components/user-form/user-form.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

import { ProjectsContentModule } from './pages/projects/projects-content/projects-content.module';
import { SharedModule } from './shared/shared.module';
import { ProjectStatusComponent } from './pages/dashboard/charts/project-status/project-status.component';
import { ProjectTeamReportComponent } from './pages/dashboard/charts/project-team-report/project-team-report.component';
import { A11yModule } from "@angular/cdk/a11y";
import { IssuesComponent } from './pages/dashboard/tables/issues/issues.component';
import { DueTableComponent } from './pages/dashboard/tables/due-table/due-table.component';

@NgModule({
  declarations: [
    AppComponent,
    MainLayoutComponent,
    SidebarComponent,
    HeaderComponent,
    DashboardComponent,
    AnalyticsComponent,
    ProfileComponent,
    SecurityComponent,
    GeneralComponent,
    BillingComponent,
    LogsComponent,
    ProjectsComponent,
    SettingsComponent,
    LoginComponent,
    ViewSelectorComponent,
    UserFormComponent,
    ProjectStatusComponent,
    ProjectTeamReportComponent,
    IssuesComponent,
    DueTableComponent,
  ],
  imports: [
    BrowserAnimationsModule,
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    MatIconModule,
    MatDialogModule,
    MatButtonModule,
    SharedModule,
    ProjectsContentModule,
    ToastrModule.forRoot({
        positionClass: 'toast-top-right',
        preventDuplicates: true,
        closeButton: true,
        progressBar: true,
    }),
    A11yModule
],
  providers: [{
    provide: HTTP_INTERCEPTORS,
    useClass: AuthInterceptor,
    multi: true
  }],
  bootstrap: [AppComponent]
})
export class AppModule { }
