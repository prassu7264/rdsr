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

  // --- RESPONSIVE TABS LOGIC WITH LOCALSTORAGE ---
  initResponsiveTabs(): void {
    if (typeof window === 'undefined') return;

    // setTimeout(() => {
      const tabList: any = document.getElementById('tab-list');
      const moreBtn: any = document.getElementById('tab-more');
      const dropdown: any = document.getElementById('more-dropdown');

      if (!tabList || !moreBtn || !dropdown) return;

      let allTabs = Array.from(tabList.children);

      // ========= Restore State or Set Default =========
      let savedTabId = sessionStorage.getItem('activeProjectTab');

      if (!savedTabId) {
        savedTabId = "tasks"; // DEFAULT TAB
        sessionStorage.setItem('activeProjectTab', savedTabId);
      }

      allTabs.forEach((t: any) => t.classList.remove('active'));
      const activeTab: any = allTabs.find(
        (t: any) => t.getAttribute('data-id') === savedTabId
      );
      if (activeTab) activeTab.classList.add('active');

      // ========= Toggle Dropdown =========
      moreBtn.addEventListener('click', (e: any) => {
        e.stopPropagation();
        dropdown.classList.toggle('show');
      });

      document.addEventListener('click', () => dropdown.classList.remove('show'));

      // ========= Tab Click =========
      const handleTabClick = (e: any) => {
        const target =
          e.target.closest('.tab-item') ||
          e.target.closest('.dropdown-item');

        if (!target) return;

        const id = target.getAttribute('data-id');
        sessionStorage.setItem('activeProjectTab', id);

        allTabs.forEach((t: any) => t.classList.remove('active'));
        const selected: any = allTabs.find(
          (t: any) => t.getAttribute('data-id') === id
        );

        if (selected) selected.classList.add('active');

        checkActiveStateInDropdown();
      };

      tabList.addEventListener('click', handleTabClick);
      dropdown.addEventListener('click', handleTabClick);

      // ========= Resize Observer =========
      const wrapper: any = document.querySelector('.tabs-wrapper');
      if (!wrapper) return;

      const resizeObserver = new ResizeObserver(() => adjustTabs());
      resizeObserver.observe(wrapper);

      // ========= Adjust Tabs =========
      function adjustTabs() {
        const containerWidth = wrapper.clientWidth;
        const moreBtnWidth = 50;

        dropdown.innerHTML = '';

        allTabs.forEach((tab: any) => {
          tab.className =
            'tab-item ' + (tab.classList.contains('active') ? 'active' : '');
          tabList.appendChild(tab);
        });

        moreBtn.classList.remove('visible');

        let currentWidth = 0;
        let overflowing = false;

        const tabs = Array.from(tabList.children);

        for (let i = 0; i < tabs.length; i++) {
          const tab: any = tabs[i];
          const tabWidth = tab.offsetWidth + 20;

          const availableWidth = overflowing
            ? containerWidth - moreBtnWidth
            : containerWidth;

          if (currentWidth + tabWidth > availableWidth) {
            overflowing = true;
            moreBtn.classList.add('visible');

            tab.className =
              'dropdown-item ' +
              (tab.classList.contains('active') ? 'active' : '');

            dropdown.appendChild(tab);
          } else {
            currentWidth += tabWidth;
          }
        }

        checkActiveStateInDropdown();
      }

      // ========= Change "More" Button State =========
      function checkActiveStateInDropdown() {
        const activeInDropdown = dropdown.querySelector('.active');

        if (activeInDropdown) {
          moreBtn.classList.add('active-inside');
        } else {
          moreBtn.classList.remove('active-inside');
        }
      }

      // ========= Initial Load =========
      adjustTabs();
    // }, 10);
  }

}