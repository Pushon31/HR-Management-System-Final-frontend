// attendance-history.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { AttendanceService } from '../../../services/attendance.service';
import { Attendance, AttendanceStatus } from '../../../models/attendance.model';

@Component({
  selector: 'app-attendance-history',
  templateUrl: './attendance-history.component.html',
  styleUrls: ['./attendance-history.component.scss']
})
export class AttendanceHistoryComponent implements OnInit {
  currentUser: any;
  attendanceHistory: Attendance[] = [];
  filteredHistory: Attendance[] = [];
  loading = false;
  searchForm: FormGroup;
  summary: any = {};

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;

  // Expose Math to template
  Math = Math;

  constructor(
    private authService: AuthService,
    private attendanceService: AttendanceService,
    private fb: FormBuilder
  ) {
    this.searchForm = this.createSearchForm();
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadAttendanceHistory();
  }

  createSearchForm(): FormGroup {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    return this.fb.group({
      startDate: [firstDayOfMonth.toISOString().split('T')[0]],
      endDate: [lastDayOfMonth.toISOString().split('T')[0]],
      status: ['']
    });
  }

  loadAttendanceHistory(): void {
    if (!this.currentUser) return;

    this.loading = true;
    const formValue = this.searchForm.value;
    const employeeId = this.currentUser.username;

    this.attendanceService.getEmployeeAttendanceHistory(
      employeeId, 
      formValue.startDate, 
      formValue.endDate
    ).subscribe({
      next: (attendance) => {
        this.attendanceHistory = attendance;
        this.applyFilters();
        this.calculateSummary();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading attendance history:', error);
        this.loading = false;
        this.attendanceHistory = [];
        this.filteredHistory = [];
      }
    });
  }

  applyFilters(): void {
    const formValue = this.searchForm.value;
    let filtered = [...this.attendanceHistory];

    // Filter by status
    if (formValue.status) {
      filtered = filtered.filter(attendance => attendance.status === formValue.status);
    }

    this.filteredHistory = filtered;
    this.totalItems = filtered.length;
    this.currentPage = 1;
    this.updatePaginationArray();
    this.updateDisplayRange();
  }

  calculateSummary(): void {
    const summary = this.attendanceService.calculateAttendanceSummary(this.attendanceHistory);
    this.summary = summary;
  }

  onSearch(): void {
    this.loadAttendanceHistory();
  }

  onReset(): void {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    this.searchForm.patchValue({
      startDate: firstDayOfMonth.toISOString().split('T')[0],
      endDate: lastDayOfMonth.toISOString().split('T')[0],
      status: ''
    });
    
    this.loadAttendanceHistory();
  }

  // Pagination methods
  get paginatedHistory(): Attendance[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredHistory.slice(startIndex, startIndex + this.itemsPerPage);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.updateDisplayRange();
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  // Add these missing methods
  get paginationArray(): number[] {
    return Array(this.totalPages).fill(0).map((x, i) => i + 1);
  }

  getDisplayRange(): string {
    const start = (this.currentPage - 1) * this.itemsPerPage + 1;
    const end = Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
    return `Showing ${start} to ${end} of ${this.totalItems} entries`;
  }

  // Helper methods to update display when data changes
  private updatePaginationArray(): void {
    // This forces the getter to recalculate
    this.paginationArray;
  }

  private updateDisplayRange(): void {
    // This forces the getter to recalculate
    this.getDisplayRange();
  }

  // Helper methods
  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-BD');
  }

  formatTime(timeString: string): string {
    if (!timeString) return 'N/A';
    
    try {
      // Handle both LocalTime string and full datetime string
      const timePart = timeString.includes('T') 
        ? timeString.split('T')[1]?.split('.')[0]
        : timeString;
      
      const [hours, minutes, seconds] = timePart.split(':');
      const time = new Date();
      time.setHours(parseInt(hours), parseInt(minutes), seconds ? parseInt(seconds) : 0);
      
      return time.toLocaleTimeString('en-BD', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
    } catch (error) {
      return 'Invalid Time';
    }
  }

  getStatusBadgeClass(status: AttendanceStatus): string {
    const statusClasses: { [key: string]: string } = {
      'PRESENT': 'badge-success',
      'ABSENT': 'badge-danger',
      'LATE': 'badge-warning',
      'HALF_DAY': 'badge-info'
    };
    return `badge ${statusClasses[status] || 'badge-secondary'}`;
  }

  calculateWorkingHours(attendance: Attendance): string {
    if (!attendance.checkinTime || !attendance.checkoutTime) {
      return 'N/A';
    }

    try {
      const checkinTime = this.parseTimeString(attendance.checkinTime);
      const checkoutTime = this.parseTimeString(attendance.checkoutTime);
      
      if (!checkinTime || !checkoutTime) return 'N/A';

      const diffMs = checkoutTime.getTime() - checkinTime.getTime();
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      
      return `${hours}h ${minutes}m`;
    } catch (error) {
      return 'N/A';
    }
  }

  private parseTimeString(timeString: string): Date | null {
    if (!timeString) return null;
    
    try {
      // Handle LocalTime format (HH:mm:ss)
      const [hours, minutes, seconds] = timeString.split(':').map(Number);
      const date = new Date();
      date.setHours(hours, minutes, seconds || 0, 0);
      return date;
    } catch (error) {
      return null;
    }
  }

  exportToCSV(): void {
    if (this.filteredHistory.length === 0) return;

    const headers = ['Date', 'Check-in', 'Check-out', 'Total Hours', 'Status', 'Remarks'];
    const csvData = this.filteredHistory.map(attendance => [
      this.formatDate(attendance.attendanceDate),
      this.formatTime(attendance.checkinTime),
      this.formatTime(attendance.checkoutTime),
      attendance.totalHours ? attendance.totalHours.toFixed(2) + ' hours' : this.calculateWorkingHours(attendance),
      attendance.status,
      attendance.remarks || 'N/A'
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `attendance-history-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}