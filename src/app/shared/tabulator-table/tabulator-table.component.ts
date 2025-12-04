import { Component, OnInit, OnDestroy, ElementRef, Input, OnChanges, SimpleChanges } from '@angular/core';

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



    const defaultOptions = {
      data: this.data,
      columns: this.columns,
      movableColumns: true,
      resizableRows: true,
      movableRows: true,
      pagination: "local",
      paginationSize: 15,
      paginationSizeSelector: [5, 10, 15, 25, 35, 45, 100],
      groupBy: viewby,
      rowClick: (e: any, row: any) => console.log("Row clicked:", row.getData()),
      cellEdited: (cell: any) => console.log("Cell edited:", cell.getField(), cell.getValue()),
      rowHeader: {
        headerSort: false, resizable: false, frozen: true, headerHozAlign: "center", hozAlign: "center", formatter: "rowSelection", titleFormatter: "rowSelection", cellClick: function (e: any, cell: any) {
          cell.getRow().toggleSelect();
          console.log(e);

        }
      },
    };

    const tableOptions = { ...defaultOptions, ...this.options };
    this.table = new Tabulator(this.el.nativeElement.querySelector('.tabulator-table'), tableOptions);
  }

  onViewSelected(item: any) {
    console.log('Parent got selected:', item);
    this.initTable(item.id)
  }

  onCreateCustomView() {
    console.log('Parent received Create Custom View click!');

  }

}
