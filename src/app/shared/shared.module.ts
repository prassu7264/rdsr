import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableFilterComponent } from './components/table-filter/table-filter.component';
import { FormsModule } from '@angular/forms';
import { LoaderComponent } from './components/loader/loader.component';




@NgModule({
  declarations: [
    TableFilterComponent,
    LoaderComponent
  ],
  imports: [
    CommonModule,
    FormsModule
  ],
  exports: [TableFilterComponent,LoaderComponent]
})
export class SharedModule { }
