import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttendanceAnalyticsComponent } from './attendance-analytics.component';

describe('AttendanceAnalyticsComponent', () => {
  let component: AttendanceAnalyticsComponent;
  let fixture: ComponentFixture<AttendanceAnalyticsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AttendanceAnalyticsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AttendanceAnalyticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
