import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DepartmentService } from '../../../services/department.service';
import { EmployeeService } from '../../../services/employee.service';
import { Department, DepartmentStatus } from '../../../models/department.model';
import { Employee } from '../../../models/employee.model';

@Component({
  selector: 'app-department-form',
  templateUrl: './department-form.component.html',
  styleUrls: ['./department-form.component.scss']
})
export class DepartmentFormComponent implements OnInit {
  departmentForm: FormGroup;
  isEditMode = false;
  departmentId: number | null = null;
  loading = false;
  submitting = false;
  employees: Employee[] = [];

  // Status options
  statusOptions = [
    { value: 'ACTIVE', label: 'Active' },
    { value: 'INACTIVE', label: 'Inactive' },
    { value: 'SUSPENDED', label: 'Suspended' }
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private departmentService: DepartmentService,
    private employeeService: EmployeeService
  ) {
    this.departmentForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadEmployees();
    this.checkEditMode();
  }

  createForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      code: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(20)]],
      description: ['', [Validators.maxLength(255)]],
      location: ['', [Validators.maxLength(100)]],
      budget: [0, [Validators.min(0)]],
      status: ['ACTIVE', [Validators.required]],
      establishedDate: [''],
      departmentHeadId: [null]
    });
  }

  checkEditMode(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.departmentId = +params['id'];
        this.loadDepartmentData(this.departmentId);
      }
    });
  }

  loadEmployees(): void {
    this.employeeService.getAllEmployees().subscribe({
      next: (employees) => {
        this.employees = employees;
      },
      error: (error) => {
        console.error('Error loading employees:', error);
      }
    });
  }

  loadDepartmentData(id: number): void {
    this.loading = true;
    this.departmentService.getDepartmentById(id).subscribe({
      next: (department) => {
        this.departmentForm.patchValue({
          name: department.name,
          code: department.code,
          description: department.description,
          location: department.location,
          budget: department.budget || 0,
          status: department.status,
          establishedDate: department.establishedDate ? new Date(department.establishedDate).toISOString().split('T')[0] : '',
          departmentHeadId: department.departmentHeadId || null
        });
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading department:', error);
        this.loading = false;
        alert('Error loading department data. Please try again.');
      }
    });
  }

  get f() { return this.departmentForm.controls; }

  onSubmit(): void {
    if (this.departmentForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.submitting = true;
    const formData = this.departmentForm.value;

    // Convert establishedDate to proper format
    if (formData.establishedDate) {
      formData.establishedDate = new Date(formData.establishedDate).toISOString().split('T')[0];
    }

    if (this.isEditMode && this.departmentId) {
      this.updateDepartment(formData);
    } else {
      this.createDepartment(formData);
    }
  }

  createDepartment(departmentData: any): void {
    this.departmentService.createDepartment(departmentData).subscribe({
      next: (response) => {
        this.submitting = false;
        alert('Department created successfully!');
        this.router.navigate(['/admin/departments']);
      },
      error: (error) => {
        console.error('Error creating department:', error);
        this.submitting = false;
        alert('Error creating department. Please try again.');
      }
    });
  }

  updateDepartment(departmentData: any): void {
    if (!this.departmentId) return;

    this.departmentService.updateDepartment(this.departmentId, departmentData).subscribe({
      next: (response) => {
        this.submitting = false;
        alert('Department updated successfully!');
        this.router.navigate(['/admin/departments']);
      },
      error: (error) => {
        console.error('Error updating department:', error);
        this.submitting = false;
        alert('Error updating department. Please try again.');
      }
    });
  }

  markFormGroupTouched(): void {
    Object.keys(this.departmentForm.controls).forEach(key => {
      const control = this.departmentForm.get(key);
      control?.markAsTouched();
    });
  }

  onCancel(): void {
    if (this.departmentForm.dirty) {
      if (confirm('You have unsaved changes. Are you sure you want to leave?')) {
        this.router.navigate(['/admin/departments']);
      }
    } else {
      this.router.navigate(['/admin/departments']);
    }
  }

  // Helper method to format employee name for dropdown
  getEmployeeDisplayName(employee: Employee): string {
    return `${employee.firstName} ${employee.lastName} (${employee.employeeId}) - ${employee.designation || 'No Designation'}`;
  }
}