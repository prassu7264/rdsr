import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PIssuesComponent } from './p-issues.component';

describe('PIssuesComponent', () => {
  let component: PIssuesComponent;
  let fixture: ComponentFixture<PIssuesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PIssuesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PIssuesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
