import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EmployeeService } from '../../../services/employee.service';
import { DepartmentService } from '../../../services/department.service';
import { Employee, Gender, MaritalStatus, EmployeeType, EmployeeStatus, EmployeeWorkType } from '../../../models/employee.model';
import { Department } from '../../../models/department.model';

@Component({
  selector: 'app-employee-form',
  templateUrl: './employee-form.component.html',
  styleUrls: ['./employee-form.component.scss']
})
export class EmployeeFormComponent implements OnInit {
  employeeForm: FormGroup;
  isEditMode = false;
  employeeId: number | null = null;
  isLoading = false;
  isSubmitting = false;
  departments: Department[] = [];
  managers: Employee[] = [];
  
  // Enums for dropdowns
  genders = Object.values(Gender);
  maritalStatuses = Object.values(MaritalStatus);
  employeeTypes = Object.values(EmployeeType);
  employeeStatuses = Object.values(EmployeeStatus);
  workTypes = Object.values(EmployeeWorkType);

  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeeService,
    private departmentService: DepartmentService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.employeeForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadDepartments();
    this.loadManagers();
    
    this.employeeId = this.route.snapshot.params['id'];
    this.isEditMode = !!this.employeeId;

    if (this.isEditMode) {
      this.loadEmployeeData();
    }
  }

  createForm(): FormGroup {
    return this.fb.group({
      // Personal Information
      firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      employeeId: ['', [Validators.required, Validators.maxLength(30)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
      nidNumber: ['', [Validators.maxLength(20)]],
      bankAccountNumber: ['', [Validators.maxLength(40)]],
      gender: ['', Validators.required],
      maritalStatus: [''],
      birthDate: [''],
      
      // Employment Information
      departmentId: [''],
      designation: ['', [Validators.maxLength(50)]],
      employeeType: ['', Validators.required],
      workType: ['', Validators.required],
      status: ['ACTIVE', Validators.required],
      joinDate: [''],
      shift: ['', [Validators.maxLength(30)]],
      basicSalary: [0, [Validators.min(0)]],
      managerId: [''],
      
      // Contact Information
      phoneNumber: ['', [Validators.maxLength(20)]],
      emergencyContact: ['', [Validators.maxLength(20)]],
      address: ['', [Validators.maxLength(500)]],
      
      // Additional Information
      profilePic: ['']
    });
  }

  loadDepartments(): void {
    this.departmentService.getAllDepartments().subscribe({
      next: (departments: Department[]) => {
        this.departments = departments;
      },
      error: (error: any) => {
        console.error('Error loading departments:', error);
      }
    });
  }

  loadManagers(): void {
    this.employeeService.getAllEmployees().subscribe({
      next: (employees: Employee[]) => {
        this.managers = employees;
      },
      error: (error: any) => {
        console.error('Error loading managers:', error);
      }
    });
  }

  loadEmployeeData(): void {
    if (!this.employeeId) return;

    this.isLoading = true;
    this.employeeService.getEmployeeById(this.employeeId).subscribe({
      next: (employee: Employee) => {
        this.employeeForm.patchValue({
          ...employee,
          birthDate: this.formatDateForInput(employee.birthDate),
          joinDate: this.formatDateForInput(employee.joinDate)
        });
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading employee:', error);
        this.isLoading = false;
      }
    });
  }

  formatDateForInput(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  }

  onSubmit(): void {
    if (this.employeeForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isLoading = true;
    const formData = this.employeeForm.value;

    // Convert empty strings to null for optional fields
    Object.keys(formData).forEach(key => {
      if (formData[key] === '') {
        formData[key] = null;
      }
    });

    if (this.isEditMode && this.employeeId) {
      this.employeeService.updateEmployee(this.employeeId, formData).subscribe({
        next: (response: Employee) => {
          this.isLoading = false;
          this.router.navigate(['/admin/employees']);
        },
        error: (error: any) => {
          console.error('Error updating employee:', error);
          this.isLoading = false;
        }
      });
    } else {
      this.employeeService.createEmployee(formData).subscribe({
        next: (response: Employee) => {
          this.isLoading = false;
          this.router.navigate(['/admin/employees']);
        },
        error: (error: any) => {
          console.error('Error creating employee:', error);
          this.isLoading = false;
        }
      });
    }
  }

  markFormGroupTouched(): void {
    Object.keys(this.employeeForm.controls).forEach(key => {
      const control = this.employeeForm.get(key);
      control?.markAsTouched();
    });
  }

  onCancel(): void {
    this.router.navigate(['/admin/employees']);
  }

  // Helper methods for template
  isFieldInvalid(fieldName: string): boolean {
    const field = this.employeeForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.employeeForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return 'This field is required';
      if (field.errors['email']) return 'Please enter a valid email';
      if (field.errors['minlength']) return `Minimum length is ${field.errors['minlength'].requiredLength}`;
      if (field.errors['maxlength']) return `Maximum length is ${field.errors['maxlength'].requiredLength}`;
      if (field.errors['min']) return `Minimum value is ${field.errors['min'].min}`;
    }
    return '';
  }
}