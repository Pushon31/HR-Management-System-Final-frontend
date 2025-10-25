import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttendanceCheckinComponent } from './attendance-checkin.component';

describe('AttendanceCheckinComponent', () => {
  let component: AttendanceCheckinComponent;
  let fixture: ComponentFixture<AttendanceCheckinComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AttendanceCheckinComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AttendanceCheckinComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
