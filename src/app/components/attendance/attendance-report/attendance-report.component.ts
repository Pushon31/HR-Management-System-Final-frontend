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
      next: (employees: Employee[]) => {
        this.employees = employees;
        console.log('✅ Employees loaded:', employees.length);
      },
      error: (error: any) => {
        console.error('❌ Error loading employees:', error);
      }
    });
  }

  generateReport(): void {
    this.loading = true;
    const formValue = this.reportForm.value;
    console.log('🔄 Generating report with:', formValue);

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
      default:
        this.loading = false;
        break;
    }
  }

  generateDailyReport(date: string): void {
    this.attendanceService.getAttendanceByDate(date).subscribe({
      next: (attendance: Attendance[]) => {
        console.log('✅ Daily report data:', attendance);
        this.attendanceData = attendance;
        this.calculateDailySummary();
        this.prepareChartData();
        this.loading = false;
      },
      error: (error: any) => {
        console.error('❌ Error generating daily report:', error);
        this.loading = false;
        alert('Error generating daily report. Please try again.');
      }
    });
  }

  generateMonthlyReport(year: number, month: number): void {
    // ✅ FIXED: Now using getAllAttendance which exists
    this.attendanceService.getAllAttendance().subscribe({
      next: (allAttendance: Attendance[]) => {
        // Filter attendance for the selected month and year
        this.attendanceData = allAttendance.filter((attendance: Attendance) => {
          const attDate = new Date(attendance.attendanceDate);
          return attDate.getFullYear() === year && attDate.getMonth() + 1 === month;
        });
        console.log('✅ Monthly report data:', this.attendanceData);
        this.calculateMonthlySummary();
        this.prepareChartData();
        this.loading = false;
      },
      error: (error: any) => {
        console.error('❌ Error generating monthly report:', error);
        this.loading = false;
        alert('Error generating monthly report. Please try again.');
      }
    });
  }

  generateEmployeeReport(employeeId: string, year: number, month: number): void {
    if (!employeeId) {
      alert('Please select an employee');
      this.loading = false;
      return;
    }

    this.attendanceService.getMonthlyAttendance(employeeId, year, month).subscribe({
      next: (attendance: Attendance[]) => {
        console.log('✅ Employee report data:', attendance);
        this.attendanceData = attendance;
        this.calculateEmployeeSummary(employeeId);
        this.prepareChartData();
        this.loading = false;
      },
      error: (error: any) => {
        console.error('❌ Error generating employee report:', error);
        this.loading = false;
        alert('Error generating employee report. Please try again.');
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

    this.attendanceData.forEach((attendance: Attendance) => {
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
        case AttendanceStatus.ABSENT:
          summary.absent++;
          break;
      }
    });

    // Calculate employees with no attendance record as absent
    const employeesWithAttendance = new Set(this.attendanceData.map(a => a.employeeId));
    const actualAbsent = summary.totalEmployees - employeesWithAttendance.size;
    summary.absent += actualAbsent;

    summary.presentPercentage = summary.totalEmployees > 0 
      ? ((summary.present + summary.late + summary.halfDay) / summary.totalEmployees) * 100 
      : 0;

    this.summary = summary;
  }

  calculateMonthlySummary(): void {
    // Group attendance by employee and calculate monthly stats
    const employeeStats = new Map();

    this.attendanceData.forEach((attendance: Attendance) => {
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

  calculateEmployeeSummary(employeeId: string): void {
    if (this.attendanceData.length === 0) {
      this.summary = {
        totalPresent: 0,
        totalLate: 0,
        totalHalfDay: 0,
        totalAbsent: 0,
        totalWorkingDays: 0,
        attendancePercentage: 0,
        employeeName: this.getEmployeeName(employeeId),
        employeeId: employeeId
      };
      return;
    }

    const totalPresent = this.attendanceData.filter((a: Attendance) => a.status === AttendanceStatus.PRESENT).length;
    const totalLate = this.attendanceData.filter((a: Attendance) => a.status === AttendanceStatus.LATE).length;
    const totalHalfDay = this.attendanceData.filter((a: Attendance) => a.status === AttendanceStatus.HALF_DAY).length;
    const totalAbsent = this.attendanceData.filter((a: Attendance) => a.status === AttendanceStatus.ABSENT).length;
    const totalWorkingDays = this.getWorkingDaysInMonth(
      this.reportForm.value.year, 
      this.reportForm.value.month
    );

    const attendancePercentage = totalWorkingDays > 0 
      ? ((totalPresent + totalLate) / totalWorkingDays) * 100 
      : 0;

    this.summary = {
      totalPresent,
      totalLate,
      totalHalfDay,
      totalAbsent,
      totalWorkingDays,
      attendancePercentage: Math.round(attendancePercentage * 100) / 100,
      employeeName: this.attendanceData[0]?.employeeName || this.getEmployeeName(employeeId),
      employeeId: employeeId
    };
  }

  private getEmployeeName(employeeId: string): string {
    const employee = this.employees.find(emp => emp.employeeId === employeeId);
    return employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown Employee';
  }

  prepareChartData(): void {
    const formValue = this.reportForm.value;

    if (formValue.reportType === 'daily') {
      this.chartData = {
        labels: ['Present', 'Late', 'Half Day', 'Absent'],
        datasets: [{
          data: [
            this.summary.present || 0,
            this.summary.late || 0,
            this.summary.halfDay || 0,
            this.summary.absent || 0
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
    
    // Clear previous data
    this.attendanceData = [];
    this.summary = {};
    this.chartData = {};
  }

  exportToPDF(): void {
    if (this.attendanceData.length === 0) {
      alert('No data to export');
      return;
    }
    
    // Simple PDF export simulation
    const reportType = this.reportForm.get('reportType')?.value;
    const content = this.generatePDFContent();
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Attendance Report</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              table { width: 100%; border-collapse: collapse; margin: 20px 0; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
            </style>
          </head>
          <body>
            <h1>Attendance Report - ${reportType.toUpperCase()}</h1>
            ${content}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  }

  private generatePDFContent(): string {
    const formValue = this.reportForm.value;
    
    if (formValue.reportType === 'daily') {
      return `
        <h2>Date: ${this.formatDate(formValue.reportDate)}</h2>
        <p><strong>Total Employees:</strong> ${this.summary.totalEmployees}</p>
        <p><strong>Present:</strong> ${this.summary.present}</p>
        <p><strong>Late:</strong> ${this.summary.late}</p>
        <p><strong>Half Day:</strong> ${this.summary.halfDay}</p>
        <p><strong>Absent:</strong> ${this.summary.absent}</p>
        <p><strong>Attendance Rate:</strong> ${this.summary.presentPercentage?.toFixed(1)}%</p>
      `;
    }
    
    return '<p>Report content would be generated here</p>';
  }

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
      const timePart = timeString.includes('T') 
        ? timeString.split('T')[1]?.split('.')[0]
        : timeString;
      
      const [hours, minutes, seconds] = timePart.split(':');
      const time = new Date();
      time.setHours(parseInt(hours), parseInt(minutes), seconds ? parseInt(seconds) : 0);
      
      return time.toLocaleTimeString('en-BD', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      return 'Invalid Time';
    }
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