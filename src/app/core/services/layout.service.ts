import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Title } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class LayoutService {

  private isCollapsedSubject = new BehaviorSubject<boolean>(true);
  private isDarkModeSubject = new BehaviorSubject<boolean>(false);
  private isMobileMenuOpenSubject = new BehaviorSubject<boolean>(false);
  private currentPageTitleSubject = new BehaviorSubject<string>('Dashboard');
  private currentThemeSubject = new BehaviorSubject<string>('indigo');

  isCollapsed$: Observable<boolean> = this.isCollapsedSubject.asObservable();
  isDarkMode$: Observable<boolean> = this.isDarkModeSubject.asObservable();
  isMobileMenuOpen$: Observable<boolean> = this.isMobileMenuOpenSubject.asObservable();
  currentPageTitle$: Observable<string> = this.currentPageTitleSubject.asObservable();
  currentTheme$: Observable<string> = this.currentThemeSubject.asObservable();

  private themeMap: { [key: string]: { light: string, dark: string } } = {
    original: { light: 'theme-light-original', dark: 'theme-dark-original' },
    forest: { light: 'theme-light-forest', dark: 'theme-dark-forest' },
    teal: { light: 'theme-light-teal', dark: 'theme-dark-teal' },
    mono: { light: 'theme-light-mono', dark: 'theme-dark-mono' },
    earthy: { light: 'theme-light-earthy', dark: 'theme-dark-earthy' },
    indigo: { light: 'theme-light-indigo', dark: 'theme-dark-indigo' },
  };

  get isCollapsedValue(): boolean {
    return this.isCollapsedSubject.value;
  }

  constructor(private titleService: Title) {
    if (typeof window !== 'undefined') {
      const savedThemeId = localStorage.getItem('themeId') || 'indigo';
      const savedMode = localStorage.getItem('themeMode');

      this.currentThemeSubject.next(savedThemeId);

      if (savedMode === 'dark-mode') {
        this.isDarkModeSubject.next(true);
      }
    }

    this.currentTheme$.subscribe(() => this.applyThemeClasses());
    this.isDarkModeSubject.subscribe(() => this.applyThemeClasses());
  }


  toggleSidebar(): void {
    if (window.innerWidth <= 768) {
      this.isMobileMenuOpenSubject.next(!this.isMobileMenuOpenSubject.value);
    } else {
      this.isCollapsedSubject.next(!this.isCollapsedSubject.value);
    }
  }

  closeMobileMenu(): void {
    if (this.isMobileMenuOpenSubject.value) {
      this.isMobileMenuOpenSubject.next(false);
    }
  }



  toggleTheme(): void {
    const isDark = !this.isDarkModeSubject.value;
    this.isDarkModeSubject.next(isDark);

    if (typeof window !== 'undefined') {
      localStorage.setItem('themeMode', isDark ? 'dark-mode' : 'light-mode');
    }
  }

  setTheme(themeId: string): void {
    if (this.themeMap[themeId]) {
      this.currentThemeSubject.next(themeId);
      if (typeof window !== 'undefined') {
        localStorage.setItem('themeId', themeId);
      }
    }
  }

  private applyThemeClasses(): void {
    const themeId = this.currentThemeSubject.value;
    const isDark = this.isDarkModeSubject.value;
    Object.keys(this.themeMap).forEach(key => {
      document.body.classList.remove(this.themeMap[key].light);
      document.body.classList.remove(this.themeMap[key].dark);
    });

    document.body.classList.toggle('dark-mode', isDark);


    if (themeId !== 'indigo') {
      const themeClass = isDark ? this.themeMap[themeId].dark : this.themeMap[themeId].light;
      document.body.classList.add(themeClass);
    }
  }

  setCurrentPageTitle(title: string): void {
    this.currentPageTitleSubject.next(title);
    this.titleService.setTitle(`R-SPACE | ${title}`);
  }
}