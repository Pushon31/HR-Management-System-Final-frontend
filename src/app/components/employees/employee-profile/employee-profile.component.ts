import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { EmployeeService } from '../../../services/employee.service';
import { AuthService } from '../../../services/auth.service';
import { Employee, EmployeeType, EmployeeStatus, EmployeeWorkType, Gender, MaritalStatus } from '../../../models/employee.model';

@Component({
  selector: 'app-employee-profile',
  templateUrl: './employee-profile.component.html',
  styleUrls: ['./employee-profile.component.scss']
})
export class EmployeeProfileComponent implements OnInit {
  employee: Employee | null = null;
  profileForm: FormGroup;
  isEditing = false;
  isLoading = false;
  isSaving = false;
  errorMessage = '';
  successMessage = '';

  // Enums for dropdowns
  genders = Object.values(Gender);
  maritalStatuses = Object.values(MaritalStatus);
  employeeTypes = Object.values(EmployeeType);
  employeeStatuses = Object.values(EmployeeStatus);
  workTypes = Object.values(EmployeeWorkType);

  constructor(
    private employeeService: EmployeeService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.profileForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadEmployeeProfile();
  }

  createForm(): FormGroup {
    return this.fb.group({
      // Personal Information
      firstName: [{ value: '', disabled: true }, [Validators.required, Validators.minLength(2)]],
      lastName: [{ value: '', disabled: true }, [Validators.required, Validators.minLength(2)]],
      employeeId: [{ value: '', disabled: true }],
      email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
      
      // Contact Information
      phoneNumber: [{ value: '', disabled: true }, [Validators.pattern(/^[0-9+\-\s()]+$/)]],
      emergencyContact: [{ value: '', disabled: true }],
      address: [{ value: '', disabled: true }],
      
      // Personal Details
      nidNumber: [{ value: '', disabled: true }],
      bankAccountNumber: [{ value: '', disabled: true }],
      gender: [{ value: '', disabled: true }],
      maritalStatus: [{ value: '', disabled: true }],
      birthDate: [{ value: '', disabled: true }],
      
      // Employment Details
      designation: [{ value: '', disabled: true }],
      employeeType: [{ value: '', disabled: true }],
      workType: [{ value: '', disabled: true }],
      shift: [{ value: '', disabled: true }],
      basicSalary: [{ value: '', disabled: true }, [Validators.min(0)]],
      
      // Department Information
      departmentName: [{ value: '', disabled: true }],
      managerName: [{ value: '', disabled: true }],
      
      // Dates
      joinDate: [{ value: '', disabled: true }]
    });
  }

  // Type-safe form control getters
  get phoneNumberControl(): FormControl {
    return this.profileForm.get('phoneNumber') as FormControl;
  }

  get emergencyContactControl(): FormControl {
    return this.profileForm.get('emergencyContact') as FormControl;
  }

  get addressControl(): FormControl {
    return this.profileForm.get('address') as FormControl;
  }

  get bankAccountNumberControl(): FormControl {
    return this.profileForm.get('bankAccountNumber') as FormControl;
  }
  loadEmployeeProfile(): void {
    this.isLoading = true;
    this.errorMessage = '';

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.errorMessage = 'User not authenticated';
      this.isLoading = false;
      return;
    }

    console.log('🔍 Loading profile for user:', currentUser);

    // Method 1: Try to get employee by user ID
    if (currentUser.id) {
      this.employeeService.getEmployeeByUserId(currentUser.id).subscribe({
        next: (employee) => {
          this.handleEmployeeData(employee);
        },
        error: (error) => {
          console.error('Error loading by user ID:', error);
          this.tryAlternativeLoadingMethods(currentUser);
        }
      });
    } else {
      this.tryAlternativeLoadingMethods(currentUser);
    }
  }

  private tryAlternativeLoadingMethods(currentUser: any): void {
    // Method 2: Try to get by employee ID from auth service
    const employeeId = this.authService.getEmployeeId();
    if (employeeId) {
      this.employeeService.getEmployeeByEmployeeId(employeeId).subscribe({
        next: (employee) => {
          this.handleEmployeeData(employee);
        },
        error: (error) => {
          console.error('Error loading by employee ID:', error);
          this.handleProfileError(error);
        }
      });
    } else {
      // Method 3: Last resort - try to find in all employees by email
      this.employeeService.getAllEmployees().subscribe({
        next: (employees) => {
          const employee = employees.find(emp => 
            emp.email === currentUser.email || 
            emp.userId === currentUser.id
          );
          if (employee) {
            this.handleEmployeeData(employee);
          } else {
            this.handleProfileError(new Error('No employee record found'));
          }
        },
        error: (error) => {
          this.handleProfileError(error);
        }
      });
    }
  }

  private handleEmployeeData(employee: Employee): void {
    this.employee = employee;
    this.populateForm(employee);
    this.isLoading = false;
    console.log('✅ Employee profile loaded:', employee);
  }

  private handleProfileError(error: any): void {
    this.errorMessage = 'Unable to load employee profile. Please contact HR.';
    this.isLoading = false;
    console.error('Profile loading error:', error);
  }

  populateForm(employee: Employee): void {
    this.profileForm.patchValue({
      firstName: employee.firstName || '',
      lastName: employee.lastName || '',
      employeeId: employee.employeeId || '',
      email: employee.email || '',
      phoneNumber: employee.phoneNumber || '',
      emergencyContact: employee.emergencyContact || '',
      address: employee.address || '',
      nidNumber: employee.nidNumber || '',
      bankAccountNumber: employee.bankAccountNumber || '',
      gender: employee.gender || '',
      maritalStatus: employee.maritalStatus || '',
      birthDate: employee.birthDate ? new Date(employee.birthDate).toISOString().split('T')[0] : '',
      designation: employee.designation || '',
      employeeType: employee.employeeType || '',
      workType: employee.workType || '',
      shift: employee.shift || '',
      basicSalary: employee.basicSalary || '',
      departmentName: employee.departmentName || 'Not assigned',
      managerName: employee.managerName || 'Not assigned',
      joinDate: employee.joinDate ? new Date(employee.joinDate).toISOString().split('T')[0] : ''
    });
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    
    if (this.isEditing) {
      // Enable editable fields only
      const editableFields = ['phoneNumber', 'emergencyContact', 'address', 'bankAccountNumber'];
      editableFields.forEach(field => {
        this.profileForm.get(field)?.enable();
      });
    } else {
      // Disable all fields and reset form
      Object.keys(this.profileForm.controls).forEach(key => {
        this.profileForm.get(key)?.disable();
      });
      
      if (this.employee) {
        this.populateForm(this.employee);
      }
      
      this.successMessage = '';
      this.errorMessage = '';
    }
  }

  saveProfile(): void {
    if (this.profileForm.invalid || !this.employee) {
      this.errorMessage = 'Please fill all required fields correctly.';
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';
    this.successMessage = '';

    const formData = this.profileForm.value;
    
    // Create updated employee object with only allowed fields
    const updatedEmployee: Employee = {
      ...this.employee,
      phoneNumber: formData.phoneNumber,
      emergencyContact: formData.emergencyContact,
      address: formData.address,
      bankAccountNumber: formData.bankAccountNumber
    };

    this.employeeService.updateEmployee(this.employee.id, updatedEmployee).subscribe({
      next: (employee) => {
        this.employee = employee;
        this.isEditing = false;
        this.isSaving = false;
        this.successMessage = 'Profile updated successfully!';
        
        // Disable form after save
        Object.keys(this.profileForm.controls).forEach(key => {
          this.profileForm.get(key)?.disable();
        });
      },
      error: (error) => {
        console.error('Error updating profile:', error);
        this.errorMessage = error.message || 'Failed to update profile. Please try again.';
        this.isSaving = false;
      }
    });
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.errorMessage = '';
    this.successMessage = '';
    
    // Disable all fields and reset to original data
    Object.keys(this.profileForm.controls).forEach(key => {
      this.profileForm.get(key)?.disable();
    });
    
    if (this.employee) {
      this.populateForm(this.employee);
    }
  }

  

  // Helper methods for template
  getFieldError(fieldName: string): string {
    const field = this.profileForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return 'This field is required';
      if (field.errors['email']) return 'Please enter a valid email';
      if (field.errors['minlength']) return `Minimum ${field.errors['minlength'].requiredLength} characters required`;
      if (field.errors['pattern']) return 'Please enter a valid format';
      if (field.errors['min']) return 'Value must be positive';
    }
    return '';
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.profileForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  // Format date for display
  formatDate(dateString: string): string {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString();
  }
}