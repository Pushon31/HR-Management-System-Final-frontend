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
    console.log('🚀 LeaveApprovalComponent initialized');
    this.currentUser = this.authService.getCurrentUser();
    console.log('👤 Current User:', this.currentUser);
    
    if (this.currentUser) {
      console.log('🔍 User Roles:', this.currentUser.roles);
      console.log('👮 Is Admin?', this.authService.hasRole('ROLE_ADMIN'));
      console.log('👨‍💼 Is Manager?', this.authService.hasRole('ROLE_MANAGER'));
    }
    
    this.loadPendingLeaves();
  }

loadPendingLeaves(): void {
  this.loading = true;
  console.log('🔄 Starting loadPendingLeaves...');

  // ✅ FIX: Use direct role checking with the actual role strings
  if (this.currentUser.roles.includes('ROLE_ADMIN')) {
    console.log('🔍 ADMIN DETECTED - Calling getPendingLeaveApplications()');
    
    this.leaveService.getPendingLeaveApplications().subscribe({
      next: (leaves: LeaveApplication[]) => {
        console.log('✅ ADMIN - Successfully received leaves:', leaves);
        console.log('📊 Number of pending leaves:', leaves.length);
        this.pendingLeaves = leaves;
        this.loading = false;
      },
      error: (error: any) => {
        console.error('❌ ADMIN - Error loading pending leaves:', error);
        console.error('🔧 Error details:', error);
        console.error('📡 Error status:', error.status);
        console.error('📄 Error message:', error.message);
        this.loading = false;
      }
    });
  } 
  // ✅ FIX: For Manager users
  else if (this.currentUser.roles.includes('ROLE_MANAGER')) {
    console.log('🔍 MANAGER DETECTED - Loading manager data');
    this.loadManagerData();
  }
  else {
    console.log('🚫 User does not have permission to approve leaves');
    this.loading = false;
  }
}


canApproveLeaves(): boolean {
  return this.currentUser.roles.includes('ROLE_ADMIN') || this.currentUser.roles.includes('ROLE_MANAGER');
}

  loadManagerData(): void {
    if (!this.currentUser) return;

    this.loading = true;
    console.log('🔍 Loading manager data for:', this.currentUser.email);
    
    // Use email to find the manager's employee record from the list
    this.employeeService.getAllEmployees().subscribe({
      next: (employees: Employee[]) => {
        console.log('📋 Total employees found:', employees.length);
        const currentEmployee = employees.find(emp => 
          emp.email === this.currentUser?.email
        );
        
        if (currentEmployee) {
          console.log('✅ Manager employee record found:', currentEmployee);
          this.managerData = currentEmployee;
          this.loadPendingLeavesForManager(currentEmployee.id);
        } else {
          console.error('❌ Current user not found in employees. User:', this.currentUser);
          this.loading = false;
          // Show user-friendly message
          alert('Your user account is not linked to an employee record. Please contact administrator.');
        }
      },
      error: (error: any) => {
        console.error('❌ Error loading employees:', error);
        this.loading = false;
      }
    });
  }

  loadPendingLeavesForManager(managerId: number): void {
    console.log('🔍 Loading pending leaves for manager ID:', managerId);
    
    this.leaveService.getPendingLeavesForManager(managerId).subscribe({
      next: (leaves: LeaveApplication[]) => {
        console.log('✅ MANAGER - Received leaves:', leaves);
        console.log('📊 Number of pending leaves for manager:', leaves.length);
        this.pendingLeaves = leaves;
        this.loading = false;
      },
      error: (error: any) => {
        console.error('❌ Error loading pending leaves for manager:', error);
        this.loading = false;
      }
    });
  }

  // ... rest of your methods remain the same
  approveLeave(leaveId: number, remarks: string = ''): void {
    this.processing = true;
    console.log('🔄 Approving leave:', leaveId);
    
    // ✅ FIX: For admin, we don't need manager data
    if (this.authService.hasRole('ROLE_ADMIN')) {
      // Use a default approver ID or leave it null for admin
      const adminApproverId = 1; // You might want to set this differently
      console.log('👮 Admin approving with ID:', adminApproverId);
      
      this.leaveService.approveLeave(leaveId, adminApproverId, remarks).subscribe({
        next: () => {
          console.log('✅ Leave approved successfully!');
          this.processing = false;
          alert('Leave approved successfully!');
          this.loadPendingLeaves();
        },
        error: (error: any) => {
          this.processing = false;
          console.error('❌ Error approving leave:', error);
          alert('Error approving leave: ' + (error.error?.message || 'Please try again.'));
        }
      });
    } 
    // ✅ FIX: For manager, use their employee ID
    else if (this.managerData) {
      console.log('👨‍💼 Manager approving with ID:', this.managerData.id);
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



getApproverName(): string {
  if (this.currentUser.roles.includes('ROLE_ADMIN')) {
    return 'Administrator';
  } else if (this.managerData) {
    return `${this.managerData.firstName} ${this.managerData.lastName}`;
  }
  return 'Unknown';
}
}