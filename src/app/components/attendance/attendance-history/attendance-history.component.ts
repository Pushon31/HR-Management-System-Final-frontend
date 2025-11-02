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
    
    // ✅ FIXED: Use employee ID from auth service instead of username
    const employeeId = this.authService.getEmployeeId();

    if (!employeeId) {
      console.error('❌ No employee ID found for user');
      this.loading = false;
      alert('No employee record found. Please contact administrator.');
      return;
    }

    console.log('🔄 Loading attendance history for employee:', employeeId);

    // ✅ FIXED: Use the proper method that takes employee ID and date range
    this.attendanceService.getEmployeeAttendanceHistory(
      employeeId, 
      formValue.startDate, 
      formValue.endDate
    ).subscribe({
      next: (attendance) => {
        console.log('✅ Attendance history loaded:', attendance.length, 'records');
        this.attendanceHistory = attendance;
        this.applyFilters();
        this.calculateSummary();
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Error loading attendance history:', error);
        this.loading = false;
        this.attendanceHistory = [];
        this.filteredHistory = [];
        
        // Show appropriate error message
        if (error.status === 404) {
          this.errorMessage = 'No attendance records found for the selected period.';
        } else {
          this.errorMessage = 'Error loading attendance history. Please try again.';
          alert('Error loading attendance history. Please try again.');
        }
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
    this.updateDisplayRange();
  }

  calculateSummary(): void {
    if (this.attendanceHistory.length === 0) {
      this.summary = {
        totalWorkingDays: 0,
        totalPresent: 0,
        totalLate: 0,
        totalHalfDay: 0,
        totalAbsent: 0,
        attendancePercentage: 0
      };
      return;
    }

    const summary = {
      totalWorkingDays: this.attendanceHistory.length,
      totalPresent: this.attendanceHistory.filter(a => a.status === 'PRESENT').length,
      totalLate: this.attendanceHistory.filter(a => a.status === 'LATE').length,
      totalHalfDay: this.attendanceHistory.filter(a => a.status === 'HALF_DAY').length,
      totalAbsent: this.attendanceHistory.filter(a => a.status === 'ABSENT').length,
      attendancePercentage: 0
    };

    // ✅ FIXED: Calculate attendance percentage properly
    summary.attendancePercentage = summary.totalWorkingDays > 0 
      ? ((summary.totalPresent + summary.totalLate + summary.totalHalfDay) / summary.totalWorkingDays) * 100 
      : 0;

    this.summary = summary;
  }

  exportToCSV(): void {
    if (this.filteredHistory.length === 0) {
      alert('No data to export');
      return;
    }

    const headers = ['Date', 'Check-in', 'Check-out', 'Working Hours', 'Status', 'Remarks'];
    
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

    this.downloadCSV(csvContent, `attendance-history-${new Date().toISOString().split('T')[0]}.csv`);
  }

  private downloadCSV(content: string, filename: string): void {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  // ✅ FIXED: Pagination methods
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

  get paginationArray(): number[] {
    const pages = [];
    const totalPages = this.totalPages;
    
    // Show max 5 pages in pagination
    let startPage = Math.max(1, this.currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);
    
    if (endPage - startPage < 4) {
      startPage = Math.max(1, endPage - 4);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  getDisplayRange(): string {
    const start = (this.currentPage - 1) * this.itemsPerPage + 1;
    const end = Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
    return `Showing ${start} to ${end} of ${this.totalItems} entries`;
  }

  private updateDisplayRange(): void {
    // This method is called to update the display range text
  }

  // Helper methods
  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-BD');
    } catch {
      return 'Invalid Date';
    }
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

  // ✅ ADDED: Error message property
  errorMessage = '';

  // ✅ ADDED: Check if user has employee record
  hasEmployeeRecord(): boolean {
    return this.authService.hasEmployeeRecord();
  }

  // ✅ ADDED: Refresh data
  refreshData(): void {
    this.loadAttendanceHistory();
  }
}