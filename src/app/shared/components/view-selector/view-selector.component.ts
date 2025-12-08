import { Component, Input, Output, EventEmitter, HostListener, ElementRef, inject, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

interface ViewOption {
  id: string;
  label: string;
  selected?: boolean;
}

@Component({
  selector: 'app-view-selector',
  templateUrl: './view-selector.component.html',
  styleUrls: ['./view-selector.component.scss']
})
export class ViewSelectorComponent implements OnChanges {
  isFilterOpen = false;
  isOpen = false;
  isCollapsed = false;
  searchText = '';

  constructor(private elementRef: ElementRef) { }
  @Input() items: ViewOption[] = [];
  @Input() data: any = {};
  @Output() selectionChange = new EventEmitter<ViewOption>();
  @Output() initTable = new EventEmitter<any>();
  @Output() createCustom = new EventEmitter<void>();
  filteredItems: ViewOption[] = [];
  selectedItem: ViewOption | null = null;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['items']) {
      this.filteredItems = [...this.items];
      this.selectedItem = this.items.find(i => i.selected) || null;
    }
  }

  toggleDropdown(event: Event) {
    event.stopPropagation();
    this.isOpen = !this.isOpen;

    if (this.isOpen) {
      this.searchText = '';
      this.filterItems();
    }
  }

  toggleSection() {
    this.isCollapsed = !this.isCollapsed;
  }

  selectItem(item: ViewOption) {
    this.selectedItem = item;
    this.isOpen = false;
    this.selectionChange.emit(item); // Emit to parent
  }

  filterItems() {
    const term = this.searchText.toLowerCase();
    this.filteredItems = term
      ? this.items.filter(i => i.label.toLowerCase().includes(term))
      : [...this.items];
  }

  onCreateCustom() {
    this.isOpen = false;
    this.createCustom.emit(); // Emit event to parent
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }

  toggleFilter(type: any = '') {
    this.data = []
    this.isFilterOpen = !this.isFilterOpen;
    if (type) {
      this.initTable.emit()
    }
  }


}
