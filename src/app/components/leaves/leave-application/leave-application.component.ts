// leave-application.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { LeaveService } from '../../../services/leave.service';
import { EmployeeService } from '../../../services/employee.service';
import { LeaveApplication, LeaveType, LeaveStatus, calculateWorkingDays } from '../../../models/leave.model';
import { Employee } from '../../../models/employee.model';

@Component({
  selector: 'app-leave-application',
  templateUrl: './leave-application.component.html',
  styleUrls: ['./leave-application.component.scss']
})
export class LeaveApplicationComponent implements OnInit {
  currentUser: any;
  employeeData: Employee | null = null;
  leaveApplicationForm: FormGroup;
  leaveTypes: LeaveType[] = [];
  loading = false;
  submitting = false;
  availableDays = 0;
  calculatedDays = 0;

  // Add these properties to fix template errors
  today: string;
  maxStartDate: string;
  maxEndDate: string;

  constructor(
    private authService: AuthService,
    private leaveService: LeaveService,
    private employeeService: EmployeeService,
    private fb: FormBuilder
  ) {
    this.leaveApplicationForm = this.createLeaveForm();
    
    // Initialize date properties
    const today = new Date();
    this.today = today.toISOString().split('T')[0];
    
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() + 1);
    this.maxStartDate = maxDate.toISOString().split('T')[0];
    this.maxEndDate = maxDate.toISOString().split('T')[0];
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadEmployeeData();
    this.loadLeaveTypes();
    this.setupFormListeners();
  }

  createLeaveForm(): FormGroup {    
    return this.fb.group({
      leaveTypeId: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      reason: ['', [Validators.required, Validators.minLength(10)]],
      contactNumber: ['', Validators.required],
      addressDuringLeave: ['', Validators.required]
    });
  }

  setupFormListeners(): void {
    // Recalculate days when dates change
    this.leaveApplicationForm.get('startDate')?.valueChanges.subscribe(() => {
      this.calculateDays();
    });

    this.leaveApplicationForm.get('endDate')?.valueChanges.subscribe(() => {
      this.calculateDays();
    });

    // Check availability when leave type changes
    this.leaveApplicationForm.get('leaveTypeId')?.valueChanges.subscribe(leaveTypeId => {
      if (leaveTypeId) {
        this.checkLeaveAvailability(leaveTypeId);
      }
    });
  }

  loadEmployeeData(): void {
    if (!this.currentUser) return;

    this.employeeService.getEmployeeByEmployeeId(this.currentUser.username).subscribe({
      next: (employee) => {
        this.employeeData = employee;
        // Pre-fill contact number if available
        if (employee.phoneNumber) {
          this.leaveApplicationForm.patchValue({
            contactNumber: employee.phoneNumber
          });
        }
      },
      error: (error) => {
        console.error('Error loading employee data:', error);
      }
    });
  }

  loadLeaveTypes(): void {
    this.leaveService.getActiveLeaveTypes().subscribe({
      next: (leaveTypes) => {
        this.leaveTypes = leaveTypes;
      },
      error: (error) => {
        console.error('Error loading leave types:', error);
      }
    });
  }

  calculateDays(): void {
    const startDate = this.leaveApplicationForm.get('startDate')?.value;
    const endDate = this.leaveApplicationForm.get('endDate')?.value;

    if (startDate && endDate) {
      this.calculatedDays = calculateWorkingDays(startDate, endDate);
      
      // Validate end date is not before start date
      if (new Date(endDate) < new Date(startDate)) {
        this.leaveApplicationForm.get('endDate')?.setErrors({ invalidDate: true });
      } else {
        this.leaveApplicationForm.get('endDate')?.setErrors(null);
      }
    }
  }

  checkLeaveAvailability(leaveTypeId: number): void {
    if (!this.currentUser || !this.employeeData) return;

    const startDate = this.leaveApplicationForm.get('startDate')?.value;
    const endDate = this.leaveApplicationForm.get('endDate')?.value;

    if (startDate && endDate) {
      this.leaveService.checkLeaveAvailability(
        this.employeeData.id,
        leaveTypeId,
        startDate,
        endDate
      ).subscribe({
        next: (isAvailable) => {
          if (!isAvailable) {
            this.leaveApplicationForm.get('leaveTypeId')?.setErrors({ notAvailable: true });
          }
        },
        error: (error) => {
          console.error('Error checking leave availability:', error);
        }
      });
    }
  }

  onSubmit(): void {
    if (this.leaveApplicationForm.invalid || !this.employeeData) {
      this.markFormGroupTouched();
      return;
    }

    this.submitting = true;
    const formValue = this.leaveApplicationForm.value;

    const leaveApplication: LeaveApplication = {
      employeeId: this.employeeData.id,
      leaveTypeId: formValue.leaveTypeId,
      startDate: formValue.startDate,
      endDate: formValue.endDate,
      reason: formValue.reason,
      contactNumber: formValue.contactNumber,
      addressDuringLeave: formValue.addressDuringLeave,
      status: LeaveStatus.PENDING,
      totalDays: this.calculatedDays
    };

    this.leaveService.applyForLeave(leaveApplication).subscribe({
      next: (response) => {
        this.submitting = false;
        alert('Leave application submitted successfully!');
        this.leaveApplicationForm.reset();
        this.calculatedDays = 0;
        // Reset form to initial state
        if (this.employeeData?.phoneNumber) {
          this.leaveApplicationForm.patchValue({
            contactNumber: this.employeeData.phoneNumber
          });
        }
      },
      error: (error) => {
        this.submitting = false;
        console.error('Error submitting leave application:', error);
        alert('Error submitting leave application: ' + (error.error?.message || 'Please try again.'));
      }
    });
  }

  markFormGroupTouched(): void {
    Object.keys(this.leaveApplicationForm.controls).forEach(key => {
      const control = this.leaveApplicationForm.get(key);
      control?.markAsTouched();
    });
  }

  getSelectedLeaveType(): LeaveType | undefined {
    const leaveTypeId = this.leaveApplicationForm.get('leaveTypeId')?.value;
    return this.leaveTypes.find(lt => lt.id === leaveTypeId);
  }

  getMinEndDate(): string {
    const startDate = this.leaveApplicationForm.get('startDate')?.value;
    return startDate || this.today;
  }

  // Remove the old methods and use the properties instead
  // The properties are initialized in constructor
}