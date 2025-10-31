import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalaryStructureFormComponent } from './salary-structure-form.component';

describe('SalaryStructureFormComponent', () => {
  let component: SalaryStructureFormComponent;
  let fixture: ComponentFixture<SalaryStructureFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SalaryStructureFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalaryStructureFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
