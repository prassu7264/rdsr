import { Component, OnInit } from '@angular/core';
import { LayoutService } from 'src/app/core/services/layout.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  // List of themes available for selection
  availableThemes = [
    { id: 'original', name: 'Original Blue' },
    { id: 'forest', name: 'Forest Green' },
    { id: 'teal', name: 'Muted Teal' },
    { id: 'mono', name: 'Monochromatic' },
    { id: 'earthy', name: 'Warm Earthy' },
    // { id: 'indigo', name: 'Standard Indigo' }, // Include the default "best usual" theme
  ];

  // Observables to track current state for UI binding
  currentThemeId$: Observable<string> = this.layoutService.currentTheme$;
  isDarkMode$: Observable<boolean> = this.layoutService.isDarkMode$;

  constructor(private layoutService: LayoutService) { }

  ngOnInit(): void {
    // Update the header title when this page loads
    this.layoutService.setCurrentPageTitle('Themes Settings');
  }

  /**
   * Sets the active theme set (e.g., 'forest', 'indigo').
   * @param themeId The ID of the theme to apply.
   */
  selectTheme(themeId: string): void {
    this.layoutService.setTheme(themeId);
  }

  /**
   * Toggles between light and dark mode for the currently selected theme.
   */
  toggleDarkMode(): void {
    this.layoutService.toggleTheme();
  }
}