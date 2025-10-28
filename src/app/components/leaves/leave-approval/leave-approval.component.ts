import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { LeaveService } from '../../../services/leave.service';
import { EmployeeService } from '../../../services/employee.service';
import { LeaveApplication, LeaveStatus } from '../../../models/leave.model';
import { Employee } from '../../../models/employee.model';

@Component({
  selector: 'app-leave-approval',
  templateUrl: './leave-approval.component.html',
  styleUrls: ['./leave-approval.component.scss']
})
export class LeaveApprovalComponent implements OnInit {
  currentUser: any;
  managerData: Employee | null = null;
  pendingLeaves: LeaveApplication[] = [];
  loading = false;
  processing = false;

  constructor(
    private authService: AuthService,
    private leaveService: LeaveService,
    private employeeService: EmployeeService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadPendingLeaves();
  }

  loadPendingLeaves(): void {
    this.loading = true;

    // ✅ FIX: For Admin users, get ALL pending leaves without manager filtering
    if (this.authService.hasRole('ROLE_ADMIN')) {
      this.leaveService.getPendingLeaveApplications().subscribe({
        next: (leaves: LeaveApplication[]) => {
          this.pendingLeaves = leaves;
          this.loading = false;
        },
        error: (error: any) => {
          console.error('Error loading pending leaves:', error);
          this.loading = false;
        }
      });
    } 
    // ✅ FIX: For Manager users, try to find their employee record first
    else if (this.authService.hasRole('ROLE_MANAGER')) {
      this.loadManagerData();
    }
    // ✅ FIX: For regular employees, show empty or redirect
    else {
      console.log('User does not have permission to approve leaves');
      this.loading = false;
    }
  }

  loadManagerData(): void {
    if (!this.currentUser) return;

    this.loading = true;
    
    this.employeeService.getAllEmployees().subscribe({
      next: (employees: Employee[]) => {
        // ✅ FIX: Better matching logic for manager
        const currentEmployee = employees.find(emp => {
          // Try multiple matching strategies
          return emp.email === this.currentUser.email || 
                 emp.employeeId === this.currentUser.username ||
                 (emp.firstName + ' ' + emp.lastName).toLowerCase() === this.currentUser.fullName?.toLowerCase();
        });
        
        if (currentEmployee) {
          this.managerData = currentEmployee;
          this.loadPendingLeavesForManager(currentEmployee.id);
        } else {
          console.error('Current user not found in employees. User:', this.currentUser);
          this.loading = false;
          // Show user-friendly message
          alert('Your user account is not linked to an employee record. Please contact administrator.');
        }
      },
      error: (error: any) => {
        console.error('Error loading employees:', error);
        this.loading = false;
      }
    });
  }

  loadPendingLeavesForManager(managerId: number): void {
    this.leaveService.getPendingLeavesForManager(managerId).subscribe({
      next: (leaves: LeaveApplication[]) => {
        this.pendingLeaves = leaves;
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading pending leaves for manager:', error);
        this.loading = false;
      }
    });
  }

  approveLeave(leaveId: number, remarks: string = ''): void {
    this.processing = true;
    
    // ✅ FIX: For admin, we don't need manager data
    if (this.authService.hasRole('ROLE_ADMIN')) {
      // Use a default approver ID or leave it null for admin
      const adminApproverId = 1; // You might want to set this differently
      this.leaveService.approveLeave(leaveId, adminApproverId, remarks).subscribe({
        next: () => {
          this.processing = false;
          alert('Leave approved successfully!');
          this.loadPendingLeaves();
        },
        error: (error: any) => {
          this.processing = false;
          console.error('Error approving leave:', error);
          alert('Error approving leave: ' + (error.error?.message || 'Please try again.'));
        }
      });
    } 
    // ✅ FIX: For manager, use their employee ID
    else if (this.managerData) {
      this.leaveService.approveLeave(leaveId, this.managerData.id, remarks).subscribe({
        next: () => {
          this.processing = false;
          alert('Leave approved successfully!');
          this.loadPendingLeaves();
        },
        error: (error: any) => {
          this.processing = false;
          console.error('Error approving leave:', error);
          alert('Error approving leave: ' + (error.error?.message || 'Please try again.'));
        }
      });
    }
  }

  rejectLeave(leaveId: number, remarks: string = ''): void {
    this.processing = true;
    
    // ✅ FIX: For admin, we don't need manager data
    if (this.authService.hasRole('ROLE_ADMIN')) {
      const adminApproverId = 1;
      this.leaveService.rejectLeave(leaveId, adminApproverId, remarks).subscribe({
        next: () => {
          this.processing = false;
          alert('Leave rejected successfully!');
          this.loadPendingLeaves();
        },
        error: (error: any) => {
          this.processing = false;
          console.error('Error rejecting leave:', error);
          alert('Error rejecting leave: ' + (error.error?.message || 'Please try again.'));
        }
      });
    } 
    // ✅ FIX: For manager, use their employee ID
    else if (this.managerData) {
      this.leaveService.rejectLeave(leaveId, this.managerData.id, remarks).subscribe({
        next: () => {
          this.processing = false;
          alert('Leave rejected successfully!');
          this.loadPendingLeaves();
        },
        error: (error: any) => {
          this.processing = false;
          console.error('Error rejecting leave:', error);
          alert('Error rejecting leave: ' + (error.error?.message || 'Please try again.'));
        }
      });
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-BD');
  }

  getStatusBadgeClass(status: LeaveStatus): string {
    const statusClasses: { [key: string]: string } = {
      'PENDING': 'badge bg-warning',
      'APPROVED': 'badge bg-success',
      'REJECTED': 'badge bg-danger',
      'CANCELLED': 'badge bg-secondary'
    };
    return statusClasses[status] || 'badge bg-secondary';
  }

  // ✅ ADD: Check if user can approve leaves
  canApproveLeaves(): boolean {
    return this.authService.hasRole('ROLE_ADMIN') || this.authService.hasRole('ROLE_MANAGER');
  }

  // ✅ ADD: Get approver name for display
  getApproverName(): string {
    if (this.authService.hasRole('ROLE_ADMIN')) {
      return 'Administrator';
    } else if (this.managerData) {
      return `${this.managerData.firstName} ${this.managerData.lastName}`;
    }
    return 'Unknown';
  }
}