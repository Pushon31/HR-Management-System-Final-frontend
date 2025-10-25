import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeAnalyticsComponent } from './employee-analytics.component';

describe('EmployeeAnalyticsComponent', () => {
  let component: EmployeeAnalyticsComponent;
  let fixture: ComponentFixture<EmployeeAnalyticsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmployeeAnalyticsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeAnalyticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
