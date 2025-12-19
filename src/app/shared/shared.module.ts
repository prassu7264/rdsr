import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableFilterComponent } from './components/table-filter/table-filter.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoaderComponent } from './components/loader/loader.component';
import { StatusLogComponent } from './components/status-log/status-log.component';

@NgModule({
  declarations: [
    TableFilterComponent,
    LoaderComponent,
    StatusLogComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  exports: [TableFilterComponent, LoaderComponent,StatusLogComponent]
})
export class SharedModule { }
