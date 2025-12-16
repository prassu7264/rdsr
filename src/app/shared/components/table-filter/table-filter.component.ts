import { Component, ElementRef, EventEmitter, HostListener, Input, Output } from '@angular/core';
interface ViewOption {
  id: string;
  label: string;
  selected?: boolean;
}
@Component({
  selector: 'app-table-filter',
  templateUrl: './table-filter.component.html',
  styleUrls: ['./table-filter.component.scss']
})
export class TableFilterComponent {
  @Input() viewOptions: ViewOption[] = [];
  @Input() btntext: any;
  @Input() triggerTxt: any = "select view"
  @Input() isRightSectionNeeded: any = true
  @Output() selectionChange = new EventEmitter<ViewOption>();
  @Output() createCustom = new EventEmitter<void>();
  @Output() toggleSideTab = new EventEmitter<any>();
  isFilterOpen = false;
  isCollapsed = false;
  isOpen = false;
  searchText = '';
  @Input() selectedItem: ViewOption | null = null;
  filteredItems: ViewOption[] = [];
  constructor(private elementRef: ElementRef) { }
  toggleSection() {
    this.isCollapsed = !this.isCollapsed;
  }
  toggleDropdown(event: Event) {
    event.stopPropagation();
    this.isOpen = !this.isOpen;

    if (this.isOpen) {
      this.searchText = '';
      this.filterItems();
    }
  }
  filterItems() {
    const term = this.searchText.toLowerCase();
    this.filteredItems = term
      ? this.viewOptions.filter(i => i.label.toLowerCase().includes(term))
      : [...this.viewOptions];
  }
  selectItem(item: ViewOption) {
    this.selectedItem = item;
    this.isOpen = false;
    this.selectionChange.emit(item); // Emit to parent
  }
  onCreateCustom() {
    this.isOpen = false;
    this.createCustom.emit(); // Emit event to parent
  }

  toggleFilter(type: any = '') {
    this.isFilterOpen = !this.isFilterOpen;
    this.toggleSideTab.emit('New')
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }
}
