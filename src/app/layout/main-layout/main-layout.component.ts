import { Component, OnInit } from '@angular/core';
import { LayoutService } from 'src/app/core/services/layout.service';

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent implements OnInit {
  isCollapsed$ = this.layoutService.isCollapsed$;
  isMobileMenuOpen$ = this.layoutService.isMobileMenuOpen$;

  constructor(private layoutService: LayoutService) { }

  ngOnInit(): void {
    this.layoutService.isDarkMode$.subscribe(isDark => {
      document.body.classList.toggle('dark-mode', isDark);
    });

    this.layoutService.isCollapsed$.subscribe(isCollapsed => {
      document.body.classList.toggle('collapsed', isCollapsed);
    });
  }
}