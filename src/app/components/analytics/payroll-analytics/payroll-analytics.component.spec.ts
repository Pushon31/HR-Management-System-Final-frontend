import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PayrollAnalyticsComponent } from './payroll-analytics.component';

describe('PayrollAnalyticsComponent', () => {
  let component: PayrollAnalyticsComponent;
  let fixture: ComponentFixture<PayrollAnalyticsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PayrollAnalyticsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PayrollAnalyticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
