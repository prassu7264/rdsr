import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';

import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AnalyticsComponent } from './pages/analytics/analytics.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { SecurityComponent } from './pages/security/security.component';
import { GeneralComponent } from './pages/general/general.component';
import { BillingComponent } from './pages/billing/billing.component';
import { LogsComponent } from './pages/logs/logs.component';
import { ProjectsComponent } from './pages/projects/projects.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { LoginComponent } from './pages/login/login.component';
import { AuthGuard } from './core/services/auth.guard';
import { ProjectsContentComponent } from './pages/projects/projects-content/projects-content.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  { path: 'login', component: LoginComponent },
  {
    path: 'main',
    component: MainLayoutComponent, canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'analytics', component: AnalyticsComponent },
      { path: 'projects', component: ProjectsComponent },
      { path: 'profile', component: ProfileComponent },
      { path: 'security', component: SecurityComponent },
      { path: 'general', component: GeneralComponent },
      { path: 'billing', component: BillingComponent },
      { path: 'logs', component: LogsComponent },
      { path: 'settings', component: SettingsComponent },
      { path: 'projects/projects-content/:id', component: ProjectsContentComponent },
    ]
  },
  // Wildcard Route
  { path: '**', component: LoginComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
