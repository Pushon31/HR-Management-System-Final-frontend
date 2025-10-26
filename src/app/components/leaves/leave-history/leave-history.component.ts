// leave-history.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { LeaveService } from '../../../services/leave.service';
import { EmployeeService } from '../../../services/employee.service';
import { LeaveApplication, LeaveStatus } from '../../../models/leave.model';
import { Employee } from '../../../models/employee.model';

@Component({
  selector: 'app-leave-history',
  templateUrl: './leave-history.component.html',
  styleUrls: ['./leave-history.component.scss']
})
export class LeaveHistoryComponent implements OnInit {
  currentUser: any;
  employeeData: Employee | null = null;
  leaveHistory: LeaveApplication[] = [];
  filteredHistory: LeaveApplication[] = [];
  loading = false;
  searchForm: FormGroup;

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  Math = Math;

  // Statistics properties
  pendingCount = 0;
  approvedCount = 0;
  rejectedCount = 0;
  totalDaysCount = 0;

  constructor(
    private authService: AuthService,
    private leaveService: LeaveService,
    private employeeService: EmployeeService,
    private fb: FormBuilder
  ) {
    this.searchForm = this.createSearchForm();
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadEmployeeData();
  }

  createSearchForm(): FormGroup {
    const today = new Date();
    const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
    const lastDayOfYear = new Date(today.getFullYear(), 11, 31);

    return this.fb.group({
      startDate: [firstDayOfYear.toISOString().split('T')[0]],
      endDate: [lastDayOfYear.toISOString().split('T')[0]],
      status: ['']
    });
  }

  loadEmployeeData(): void {
    if (!this.currentUser) return;

    this.employeeService.getEmployeeByEmployeeId(this.currentUser.username).subscribe({
      next: (employee) => {
        this.employeeData = employee;
        this.loadLeaveHistory();
      },
      error: (error) => {
        console.error('Error loading employee data:', error);
        this.loading = false;
      }
    });
  }

  loadLeaveHistory(): void {
    if (!this.employeeData) return;

    this.loading = true;
    const formValue = this.searchForm.value;

    this.leaveService.getLeaveApplicationsByEmployee(this.employeeData.id).subscribe({
      next: (applications) => {
        this.leaveHistory = applications;
        this.applyFilters();
        this.calculateStatistics();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading leave history:', error);
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    const formValue = this.searchForm.value;
    let filtered = [...this.leaveHistory];

    // Filter by date range
    if (formValue.startDate && formValue.endDate) {
      filtered = filtered.filter(leave => {
        const startDate = new Date(leave.startDate);
        const endDate = new Date(leave.endDate);
        const filterStart = new Date(formValue.startDate);
        const filterEnd = new Date(formValue.endDate);
        
        return startDate >= filterStart && endDate <= filterEnd;
      });
    }

    // Filter by status
    if (formValue.status) {
      filtered = filtered.filter(leave => leave.status === formValue.status);
    }

    this.filteredHistory = filtered;
    this.totalItems = filtered.length;
    this.currentPage = 1;
    this.calculateStatistics();
  }

  calculateStatistics(): void {
    this.pendingCount = this.filteredHistory.filter(leave => leave.status === 'PENDING').length;
    this.approvedCount = this.filteredHistory.filter(leave => leave.status === 'APPROVED').length;
    this.rejectedCount = this.filteredHistory.filter(leave => leave.status === 'REJECTED').length;
    this.totalDaysCount = this.filteredHistory.reduce((sum, leave) => sum + (leave.totalDays || 0), 0);
  }

  onSearch(): void {
    this.applyFilters();
  }

  onReset(): void {
    const today = new Date();
    const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
    const lastDayOfYear = new Date(today.getFullYear(), 11, 31);

    this.searchForm.patchValue({
      startDate: firstDayOfYear.toISOString().split('T')[0],
      endDate: lastDayOfYear.toISOString().split('T')[0],
      status: ''
    });
    
    this.applyFilters();
  }

  cancelLeave(leaveId: number): void {
    if (!this.employeeData || !confirm('Are you sure you want to cancel this leave application?')) {
      return;
    }

    this.leaveService.cancelLeave(leaveId, this.employeeData.id).subscribe({
      next: () => {
        alert('Leave application cancelled successfully!');
        this.loadLeaveHistory();
      },
      error: (error) => {
        console.error('Error cancelling leave:', error);
        alert('Error cancelling leave: ' + (error.error?.message || 'Please try again.'));
      }
    });
  }

  // Pagination methods
  get paginatedHistory(): LeaveApplication[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredHistory.slice(startIndex, startIndex + this.itemsPerPage);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  get paginationArray(): number[] {
    return Array(this.totalPages).fill(0).map((x, i) => i + 1);
  }

  getDisplayRange(): string {
    const start = (this.currentPage - 1) * this.itemsPerPage + 1;
    const end = Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
    return `Showing ${start} to ${end} of ${this.totalItems} entries`;
  }

  // Helper methods
  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
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

  canCancel(leave: LeaveApplication): boolean {
    return leave.status === LeaveStatus.PENDING;
  }

  getStatusText(status: LeaveStatus): string {
    const statusText: { [key: string]: string } = {
      'PENDING': 'Pending Approval',
      'APPROVED': 'Approved',
      'REJECTED': 'Rejected',
      'CANCELLED': 'Cancelled'
    };
    return statusText[status] || status;
  }
}