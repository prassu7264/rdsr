import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PDuesComponent } from './p-dues.component';

describe('PDuesComponent', () => {
  let component: PDuesComponent;
  let fixture: ComponentFixture<PDuesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PDuesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PDuesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
