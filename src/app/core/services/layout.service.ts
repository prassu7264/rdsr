import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Title } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class LayoutService {
    // --- Internal State Subjects ---
    private isCollapsedSubject = new BehaviorSubject<boolean>(false);
    private isDarkModeSubject = new BehaviorSubject<boolean>(false);
    private isMobileMenuOpenSubject = new BehaviorSubject<boolean>(false);
    private currentPageTitleSubject = new BehaviorSubject<string>('Dashboard');
    private currentThemeSubject = new BehaviorSubject<string>('indigo'); // Default to the last, "best usual" theme (indigo)

    // --- Exposed Observables for Components ---
    isCollapsed$: Observable<boolean> = this.isCollapsedSubject.asObservable();
    isDarkMode$: Observable<boolean> = this.isDarkModeSubject.asObservable();
    isMobileMenuOpen$: Observable<boolean> = this.isMobileMenuOpenSubject.asObservable();
    currentPageTitle$: Observable<string> = this.currentPageTitleSubject.asObservable();
    currentTheme$: Observable<string> = this.currentThemeSubject.asObservable();

    // --- Theme Definitions and CSS Class Mapping ---
    // Note: The theme names must match the class names used in styles.scss (e.g., theme-light-indigo)
    private themeMap: { [key: string]: { light: string, dark: string } } = {
        original: { light: 'theme-light-original', dark: 'theme-dark-original' },
        forest: { light: 'theme-light-forest', dark: 'theme-dark-forest' },
        teal: { light: 'theme-light-teal', dark: 'theme-dark-teal' },
        mono: { light: 'theme-light-mono', dark: 'theme-dark-mono' },
        earthy: { light: 'theme-light-earthy', dark: 'theme-dark-earthy' },
        indigo: { light: 'theme-light-indigo', dark: 'theme-dark-indigo' }, // Standard/Best Usual Theme
    };

    // --- Synchronous Getter for Component Logic (FIX for 'value' error) ---
    get isCollapsedValue(): boolean {
        return this.isCollapsedSubject.value;
    }
    
    // --- Constructor & Initialization ---
    constructor(private titleService: Title) {
        if (typeof window !== 'undefined') {
            const savedThemeId = localStorage.getItem('themeId') || 'indigo';
            const savedMode = localStorage.getItem('themeMode');
            
            this.currentThemeSubject.next(savedThemeId);

            if (savedMode === 'dark-mode') {
                this.isDarkModeSubject.next(true);
            }
        }
        
        // Subscribe to state changes to always apply the correct CSS classes to the body
        this.currentTheme$.subscribe(() => this.applyThemeClasses());
        this.isDarkModeSubject.subscribe(() => this.applyThemeClasses());
    }

    // --- Layout Control Methods ---

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

    // --- Theme/Mode Control Methods ---

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

        // 1. Remove all existing theme classes from the body
        Object.keys(this.themeMap).forEach(key => {
            document.body.classList.remove(this.themeMap[key].light);
            document.body.classList.remove(this.themeMap[key].dark);
        });

        // 2. Control the base dark-mode class
        document.body.classList.toggle('dark-mode', isDark);

        // 3. Apply the specific theme class based on mode and selection
        if (themeId !== 'indigo') { // 'indigo' is the "best usual" theme, let its styles apply via default :root/:root.dark-mode if possible
            const themeClass = isDark ? this.themeMap[themeId].dark : this.themeMap[themeId].light;
            document.body.classList.add(themeClass);
        }
    }
    
    // --- Navigation/Title Methods ---

    setCurrentPageTitle(title: string): void {
        this.currentPageTitleSubject.next(title);
        this.titleService.setTitle(`R-SPACE | ${title}`);
    }
}