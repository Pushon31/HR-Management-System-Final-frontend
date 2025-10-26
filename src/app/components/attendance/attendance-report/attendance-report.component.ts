// attendance-report.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { AttendanceService } from '../../../services/attendance.service';
import { EmployeeService } from '../../../services/employee.service';
import { Attendance, AttendanceStatus } from '../../../models/attendance.model';
import { Employee } from '../../../models/employee.model';

@Component({
  selector: 'app-attendance-report',
  templateUrl: './attendance-report.component.html',
  styleUrls: ['./attendance-report.component.scss']
})
export class AttendanceReportComponent implements OnInit {
  currentUser: any;
  loading = false;
  reportForm: FormGroup;
  attendanceData: Attendance[] = [];
  employees: Employee[] = [];
  summary: any = {};
  chartData: any = {};

  // Report types
  reportTypes = [
    { value: 'daily', label: 'Daily Report' },
    { value: 'monthly', label: 'Monthly Report' },
    { value: 'employee', label: 'Employee Report' }
  ];

  constructor(
    private authService: AuthService,
    private attendanceService: AttendanceService,
    private employeeService: EmployeeService,
    private fb: FormBuilder
  ) {
    this.reportForm = this.createReportForm();
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadEmployees();
    this.generateReport();
  }

  createReportForm(): FormGroup {
    const today = new Date();
    return this.fb.group({
      reportType: ['daily'],
      reportDate: [today.toISOString().split('T')[0]],
      month: [today.getMonth() + 1],
      year: [today.getFullYear()],
      employeeId: ['']
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

  generateReport(): void {
    this.loading = true;
    const formValue = this.reportForm.value;

    switch (formValue.reportType) {
      case 'daily':
        this.generateDailyReport(formValue.reportDate);
        break;
      case 'monthly':
        this.generateMonthlyReport(formValue.year, formValue.month);
        break;
      case 'employee':
        this.generateEmployeeReport(formValue.employeeId, formValue.year, formValue.month);
        break;
    }
  }

  generateDailyReport(date: string): void {
    this.attendanceService.getAttendanceByDate(date).subscribe({
      next: (attendance) => {
        this.attendanceData = attendance;
        this.calculateDailySummary();
        this.prepareChartData();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error generating daily report:', error);
        this.loading = false;
      }
    });
  }

  generateMonthlyReport(year: number, month: number): void {
    // For monthly report, we need to get attendance for each employee for the month
    // This is a simplified version - in real scenario, you might need a dedicated endpoint
    this.attendanceService.getAllAttendance().subscribe({
      next: (allAttendance) => {
        // Filter attendance for the selected month and year
        this.attendanceData = allAttendance.filter(attendance => {
          const attDate = new Date(attendance.attendanceDate);
          return attDate.getFullYear() === year && attDate.getMonth() + 1 === month;
        });
        this.calculateMonthlySummary();
        this.prepareChartData();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error generating monthly report:', error);
        this.loading = false;
      }
    });
  }

  generateEmployeeReport(employeeId: string, year: number, month: number): void {
    if (!employeeId) {
      this.loading = false;
      return;
    }

    this.attendanceService.getMonthlyAttendance(employeeId, year, month).subscribe({
      next: (attendance) => {
        this.attendanceData = attendance;
        this.calculateEmployeeSummary();
        this.prepareChartData();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error generating employee report:', error);
        this.loading = false;
      }
    });
  }

  calculateDailySummary(): void {
    const summary = {
      totalEmployees: this.employees.length,
      present: 0,
      absent: 0,
      late: 0,
      halfDay: 0,
      presentPercentage: 0
    };

    this.attendanceData.forEach(attendance => {
      switch (attendance.status) {
        case AttendanceStatus.PRESENT:
          summary.present++;
          break;
        case AttendanceStatus.LATE:
          summary.late++;
          break;
        case AttendanceStatus.HALF_DAY:
          summary.halfDay++;
          break;
      }
    });

    // Calculate absent employees (total employees - those with attendance records)
    const employeesWithAttendance = new Set(this.attendanceData.map(a => a.employeeId));
    summary.absent = summary.totalEmployees - employeesWithAttendance.size;

    summary.presentPercentage = summary.totalEmployees > 0 
      ? ((summary.present + summary.late + summary.halfDay) / summary.totalEmployees) * 100 
      : 0;

    this.summary = summary;
  }

  calculateMonthlySummary(): void {
    // Group attendance by employee and calculate monthly stats
    const employeeStats = new Map();

    this.attendanceData.forEach(attendance => {
      if (!employeeStats.has(attendance.employeeId)) {
        employeeStats.set(attendance.employeeId, {
          employeeId: attendance.employeeId,
          employeeName: attendance.employeeName,
          present: 0,
          late: 0,
          halfDay: 0,
          totalDays: 0
        });
      }

      const stats = employeeStats.get(attendance.employeeId);
      stats.totalDays++;

      switch (attendance.status) {
        case AttendanceStatus.PRESENT:
          stats.present++;
          break;
        case AttendanceStatus.LATE:
          stats.late++;
          break;
        case AttendanceStatus.HALF_DAY:
          stats.halfDay++;
          break;
      }
    });

    this.summary = {
      employeeStats: Array.from(employeeStats.values()),
      totalWorkingDays: this.getWorkingDaysInMonth(
        this.reportForm.value.year, 
        this.reportForm.value.month
      )
    };
  }

  calculateEmployeeSummary(): void {
    if (this.attendanceData.length === 0) return;

    const summary = this.attendanceService.calculateAttendanceSummary(this.attendanceData);
    this.summary = {
      ...summary,
      totalWorkingDays: this.getWorkingDaysInMonth(
        this.reportForm.value.year, 
        this.reportForm.value.month
      )
    };
  }

  prepareChartData(): void {
    const formValue = this.reportForm.value;

    if (formValue.reportType === 'daily') {
      this.chartData = {
        labels: ['Present', 'Late', 'Half Day', 'Absent'],
        datasets: [{
          data: [
            this.summary.present,
            this.summary.late,
            this.summary.halfDay,
            this.summary.absent
          ],
          backgroundColor: ['#28a745', '#ffc107', '#17a2b8', '#dc3545']
        }]
      };
    }
  }

  getWorkingDaysInMonth(year: number, month: number): number {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    let workingDays = 0;

    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      const day = date.getDay();
      // Exclude weekends (Sunday = 0, Saturday = 6)
      if (day !== 0 && day !== 6) {
        workingDays++;
      }
    }

    return workingDays;
  }

  onReportTypeChange(): void {
    const reportType = this.reportForm.get('reportType')?.value;
    
    // Reset form based on report type
    if (reportType === 'daily') {
      this.reportForm.patchValue({
        employeeId: ''
      });
    }
  }

  exportToPDF(): void {
    // In a real application, you would generate a PDF here
    alert('PDF export functionality would be implemented here with a PDF library.');
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-BD');
  }

  getStatusBadgeClass(status: AttendanceStatus): string {
    const statusClasses: { [key: string]: string } = {
      'PRESENT': 'bg-success',
      'ABSENT': 'bg-danger',
      'LATE': 'bg-warning',
      'HALF_DAY': 'bg-info'
    };
    return statusClasses[status] || 'bg-secondary';
  }
}