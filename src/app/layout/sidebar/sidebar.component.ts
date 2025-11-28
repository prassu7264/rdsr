import { Component, OnInit } from '@angular/core';
import { LayoutService } from 'src/app/core/services/layout.service'; 
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  openMenuId: string | null = null;
  
  isMobileOpen$: any; // Use 'any' or Observable<boolean> and async pipe in template

  constructor(
    private layoutService: LayoutService, 
    public router: Router
  ) { 
    this.isMobileOpen$ = this.layoutService.isMobileMenuOpen$;
  }

  ngOnInit(): void { }

  /**
   * Toggles the open/closed state of a submenu.
   * Uses the synchronous getter isCollapsedValue to check state.
   * @param id The ID of the submenu to toggle ('sub1' or 'sub2').
   */
  toggleSubmenu(id: string): void {
    // ✅ FIX USED HERE: Use the synchronous getter to check the collapsed state
    if (this.layoutService.isCollapsedValue && window.innerWidth > 768) {
      this.layoutService.toggleSidebar(); // Expands the sidebar
    }
    
    // Strict Accordion logic
    this.openMenuId = this.openMenuId === id ? null : id;
  }
  
  /**
   * Handles navigation clicks, updates the header title, and closes the mobile menu.
   */
  closeSubmenus(event: Event): void {
    const target = event.currentTarget as HTMLElement;
    let newTitle: string | null = null;
    
    // Find the text content for the title update
    if (target.tagName === 'DIV' && (target.classList.contains('nav-item') || target.classList.contains('submenu-item'))) {
      const span = target.querySelector('span');
      if (span) {
        // If it's a top-level item with a span
        newTitle = span.textContent;
      } else {
        // If it's a submenu item
        newTitle = target.textContent;
      }
    }
    
    if (newTitle) {
      this.layoutService.setCurrentPageTitle(newTitle.trim());
    }

    this.layoutService.closeMobileMenu();

    // If a top-level item *without* children is clicked, close submenus.
    if (target.classList.contains('nav-item') && !target.querySelector('.arrow')) {
        this.openMenuId = null;
    }
  }
}