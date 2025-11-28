import { Component } from '@angular/core';
import { LayoutService } from 'src/app/core/services/layout.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  isDarkMode$ = this.layoutService.isDarkMode$;
  currentPageTitle$ = this.layoutService.currentPageTitle$;

  constructor(private layoutService: LayoutService) { }

  onMenuToggle(): void {
    this.layoutService.toggleSidebar();
  }

  onThemeToggle(): void {
    this.layoutService.toggleTheme();
  }
}