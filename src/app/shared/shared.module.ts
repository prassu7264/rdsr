import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableFilterComponent } from './components/table-filter/table-filter.component';
import { FormsModule } from '@angular/forms';



@NgModule({
  declarations: [
    TableFilterComponent
  ],
  imports: [
    CommonModule,
    FormsModule
  ],
  exports: [TableFilterComponent]
})
export class SharedModule { }
