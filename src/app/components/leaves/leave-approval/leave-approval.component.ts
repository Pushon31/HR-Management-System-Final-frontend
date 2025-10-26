// leave-approval.component.ts
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
    this.loadManagerData();
  }

  loadManagerData(): void {
    if (!this.currentUser) return;

    this.loading = true;
    
    this.employeeService.getEmployeeByEmployeeId(this.currentUser.username).subscribe({
      next: (employee) => {
        this.managerData = employee;
        this.loadPendingLeaves(employee.id);
      },
      error: (error) => {
        console.error('Error loading manager data:', error);
        this.loading = false;
      }
    });
  }

  loadPendingLeaves(managerId: number): void {
    this.leaveService.getPendingLeavesForManager(managerId).subscribe({
      next: (leaves) => {
        this.pendingLeaves = leaves;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading pending leaves:', error);
        this.loading = false;
      }
    });
  }

  approveLeave(leaveId: number, remarks: string = ''): void {
    if (!this.managerData) return;

    this.processing = true;
    
    this.leaveService.approveLeave(leaveId, this.managerData.id, remarks).subscribe({
      next: () => {
        this.processing = false;
        alert('Leave approved successfully!');
        this.loadPendingLeaves(this.managerData!.id);
      },
      error: (error) => {
        this.processing = false;
        console.error('Error approving leave:', error);
        alert('Error approving leave: ' + (error.error?.message || 'Please try again.'));
      }
    });
  }

  rejectLeave(leaveId: number, remarks: string = ''): void {
    if (!this.managerData) return;

    this.processing = true;
    
    this.leaveService.rejectLeave(leaveId, this.managerData.id, remarks).subscribe({
      next: () => {
        this.processing = false;
        alert('Leave rejected successfully!');
        this.loadPendingLeaves(this.managerData!.id);
      },
      error: (error) => {
        this.processing = false;
        console.error('Error rejecting leave:', error);
        alert('Error rejecting leave: ' + (error.error?.message || 'Please try again.'));
      }
    });
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-BD');
  }

  getStatusBadgeClass(status: LeaveStatus): string {
    const statusClasses: { [key: string]: string } = {
      'PENDING': 'badge-warning',
      'APPROVED': 'badge-success',
      'REJECTED': 'badge-danger',
      'CANCELLED': 'badge-secondary'
    };
    return `badge ${statusClasses[status] || 'badge-secondary'}`;
  }
}