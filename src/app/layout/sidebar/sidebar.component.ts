import { Component, OnInit } from '@angular/core';
import { LayoutService } from 'src/app/core/services/layout.service';
import { Router } from '@angular/router';
import { StorageService } from 'src/app/core/services/storage.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  openMenuId: string | null = null;

  isMobileOpen$: any;

  constructor(
    private layoutService: LayoutService,
    public router: Router,
    public storageService: StorageService
  ) {
    this.isMobileOpen$ = this.layoutService.isMobileMenuOpen$;
  }

  ngOnInit(): void {

    this.storageService
  }


  toggleSubmenu(id: string): void {

    if (this.layoutService.isCollapsedValue && window.innerWidth > 768) {
      this.layoutService.toggleSidebar();
    }

    this.openMenuId = this.openMenuId === id ? null : id;
  }


  closeSubmenus(event: Event): void {
    const target = event.currentTarget as HTMLElement;
    let newTitle: string | null = null;

    if (target.tagName === 'DIV' && (target.classList.contains('nav-item') || target.classList.contains('submenu-item'))) {
      const span = target.querySelector('span');
      if (span) {
        newTitle = span.textContent;
      } else {
        newTitle = target.textContent;
      }
    }

    if (newTitle) {
      this.layoutService.setCurrentPageTitle(newTitle.trim());
    }

    this.layoutService.closeMobileMenu();
    if (target.classList.contains('nav-item') && !target.querySelector('.arrow')) {
      this.openMenuId = null;
    }
  }
}