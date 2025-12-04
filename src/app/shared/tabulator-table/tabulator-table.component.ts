import { Component, OnInit, OnDestroy, ElementRef, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';

import { TabulatorFull as Tabulator } from 'tabulator-tables';

@Component({
  selector: 'app-tabulator-employee',
  templateUrl: './tabulator-table.component.html',
  styleUrls: ['./tabulator-table.component.scss']
})
export class TabulatorTableComponent implements OnInit, OnDestroy, OnChanges {
  @Input() data: any[] = [];
  @Input() columns: any[] = [];
  @Input() options: any = {};
  @Input() viewOptions = [];
  @Output() cellEdit = new EventEmitter();
  @Output() editRow = new EventEmitter<any>();
  @Output() deleteRow = new EventEmitter<any>();

  private table: Tabulator | undefined;
  constructor(private el: ElementRef) { }

  ngOnInit(): void {
    this.initTable();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.table && changes['data'] && !changes['data'].firstChange) {
      this.table.replaceData(this.data);
    }
  }

  ngOnDestroy(): void {
    if (this.table) this.table.destroy();
  }

  private initTable(viewby: any = "") {

    const actionColumn = {
      title: "Actions",
      field: "actions",
      headerSort: false,
      hozAlign: "center",
      width: 150,
      formatter: () => {
        return `
          <button class="tbtn edit">Edit</button> 
          <button class="tbtn delete">Delete</button>
        `;
      },
      cellClick: (e: any, cell: any) => {
        const rowData = cell.getRow().getData();

        if (e.target.classList.contains("edit")) {
          console.log("Edit clicked:", rowData);
          this.editRow.emit(rowData);
        }

        if (e.target.classList.contains("delete")) {
          console.log("Delete clicked:", rowData);
          this.deleteRow.emit(rowData);
        }
      }
    };

    // Insert at end or beginning
    const updatedColumns = [...this.columns, actionColumn];

    const defaultOptions = {
      data: this.data,
      columns: updatedColumns,
      movableColumns: true,
      resizableRows: true,
      movableRows: true,
      pagination: "local",
      paginationSize: 15,
      columnDefaults: {
        tooltip: true,
      }, editTriggerEvent: "dblclick",
      paginationSizeSelector: [5, 10, 15, 25, 35, 45, 100],
      groupBy: viewby,
      // rowHeader: {
      //   headerSort: false, resizable: false, frozen: true, headerHozAlign: "center", hozAlign: "center", formatter: "rowSelection", titleFormatter: "rowSelection", cellClick: function (e: any, cell: any) {
      //     cell.getRow().toggleSelect();
      //     console.log(e);

      //   }
      // },
      
    };

    const tableOptions = {
      ...defaultOptions, ...this.options
    };
    this.table = new Tabulator(this.el.nativeElement.querySelector('.tabulator-table'), tableOptions);
    this.table.on("cellEdited", (cell: any) => {
      console.log(cell.getRow().getData());
      this.cellEdit.emit(cell.getRow().getData());
    })
  }

  onViewSelected(item: any) {
    console.log('Parent got selected:', item);
    this.initTable(item.id)
  }

  onCreateCustomView() {
    console.log('Parent received Create Custom View click!');
  }

}
