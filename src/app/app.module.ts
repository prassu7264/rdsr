import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { RouterOutlet } from "@angular/router";
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
import { ReactiveFormsModule } from '@angular/forms';





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
   
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule
],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
