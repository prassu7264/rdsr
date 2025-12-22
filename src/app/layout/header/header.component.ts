import { Component } from '@angular/core';
import { AuthService } from 'src/app/core/services/auth.service';
import { LayoutService } from 'src/app/core/services/layout.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  isDarkMode$ = this.layoutService.isDarkMode$;
  currentPageTitle$ = this.layoutService.currentPageTitle$;

  constructor(private layoutService: LayoutService,private authService:AuthService) { }

  onMenuToggle(): void {
    this.layoutService.toggleSidebar();
  }

  onThemeToggle(): void {
    this.layoutService.toggleTheme();
  }

  logOut() {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to log out ?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, log out!"
    }).then((result) => {
      if (result.isConfirmed) {
        this.authService.logout()
      }
    });
  }
}