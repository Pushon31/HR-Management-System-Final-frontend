import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { AttendanceService } from '../../../services/attendance.service';
import { EmployeeService } from '../../../services/employee.service';
import { Attendance, AttendanceStatus } from '../../../models/attendance.model';
import { Employee } from '../../../models/employee.model';

@Component({
  selector: 'app-attendance-checkin',
  templateUrl: './attendance-checkin.component.html',
  styleUrls: ['./attendance-checkin.component.scss']
})
export class AttendanceCheckinComponent implements OnInit, OnDestroy {
  currentUser: any;
  employeeData: Employee | null = null;
  todayAttendance: Attendance | null = null;
  loading = false;
  checkingIn = false;
  checkingOut = false;
  currentTime = new Date();
  timeInterval: any;

  constructor(
    private authService: AuthService,
    private attendanceService: AttendanceService,
    private employeeService: EmployeeService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadEmployeeData();
    
    // Update current time every second
    this.timeInterval = setInterval(() => {
      this.currentTime = new Date();
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }
  }

  loadEmployeeData(): void {
    if (!this.currentUser) return;

    this.loading = true;
    
    // Get employee data using the current user's email or ID
    this.employeeService.getEmployeeByEmployeeId(this.currentUser.username).subscribe({
      next: (employee) => {
        this.employeeData = employee;
        this.loadTodayAttendance();
      },
      error: (error) => {
        console.error('Error loading employee data:', error);
        this.loading = false;
        // If employee not found, try to load attendance with username directly
        this.loadTodayAttendance();
      }
    });
  }

  loadTodayAttendance(): void {
    if (!this.currentUser) {
      this.loading = false;
      return;
    }

    // Use username (which should be employeeId) to get attendance
    const employeeId = this.currentUser.username;
    
    this.attendanceService.getTodayAttendance(employeeId).subscribe({
      next: (attendance) => {
        this.todayAttendance = attendance;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading today attendance:', error);
        this.todayAttendance = null;
        this.loading = false;
      }
    });
  }

  checkIn(): void {
    if (!this.currentUser) return;

    this.checkingIn = true;
    const employeeId = this.currentUser.username;

    this.attendanceService.checkIn(employeeId).subscribe({
      next: (attendance) => {
        this.todayAttendance = attendance;
        this.checkingIn = false;
        alert('Check-in successful!');
      },
      error: (error) => {
        console.error('Error during check-in:', error);
        this.checkingIn = false;
        alert('Error during check-in: ' + (error.error?.message || 'Please try again.'));
      }
    });
  }

  checkOut(): void {
    if (!this.currentUser) return;

    this.checkingOut = true;
    const employeeId = this.currentUser.username;

    this.attendanceService.checkOut(employeeId).subscribe({
      next: (attendance) => {
        this.todayAttendance = attendance;
        this.checkingOut = false;
        alert('Check-out successful!');
      },
      error: (error) => {
        console.error('Error during check-out:', error);
        this.checkingOut = false;
        alert('Error during check-out: ' + (error.error?.message || 'Please try again.'));
      }
    });
  }

  getCurrentStatus(): string {
    if (!this.todayAttendance) {
      return 'NOT_CHECKED_IN';
    }
    
    if (this.todayAttendance.checkoutTime) {
      return 'CHECKED_OUT';
    }
    
    return 'CHECKED_IN';
  }

  formatTime(timeString: string): string {
    if (!timeString) return 'N/A';
    
    // Convert LocalTime string to display format
    const [hours, minutes, seconds] = timeString.split(':');
    const time = new Date();
    time.setHours(parseInt(hours), parseInt(minutes), seconds ? parseInt(seconds) : 0);
    
    return time.toLocaleTimeString('en-BD', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  calculateWorkingHours(): string {
    if (!this.todayAttendance?.checkinTime || !this.todayAttendance?.checkoutTime) {
      return 'N/A';
    }

    // Calculate hours from checkinTime and checkoutTime strings
    const [checkinHours, checkinMinutes] = this.todayAttendance.checkinTime.split(':').map(Number);
    const [checkoutHours, checkoutMinutes] = this.todayAttendance.checkoutTime.split(':').map(Number);
    
    const checkinTotalMinutes = checkinHours * 60 + checkinMinutes;
    const checkoutTotalMinutes = checkoutHours * 60 + checkoutMinutes;
    const totalMinutes = checkoutTotalMinutes - checkinTotalMinutes;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    return `${hours}h ${minutes}m`;
  }

  isLateCheckIn(): boolean {
    if (!this.todayAttendance?.checkinTime) return false;
    
    // Check if check-in time is after 9:15 AM (15 minutes grace period)
    const [hours, minutes] = this.todayAttendance.checkinTime.split(':').map(Number);
    return hours > 9 || (hours === 9 && minutes > 15);
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

  getGreeting(): string {
    const hour = this.currentTime.getHours();
    
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  }

  getEmployeeDisplayName(): string {
    if (this.employeeData) {
      return `${this.employeeData.firstName} ${this.employeeData.lastName}`;
    }
    return this.currentUser?.fullName || 'Employee';
  }

  getEmployeeId(): string {
    if (this.employeeData) {
      return this.employeeData.employeeId;
    }
    return this.currentUser?.username || 'N/A';
  }

  getDepartmentName(): string {
    if (this.employeeData) {
      return this.employeeData.departmentName || 'No Department';
    }
    // Fix: Remove optional chaining since we're using non-null assertion in template
    if (this.todayAttendance && this.todayAttendance.departmentName) {
      return this.todayAttendance.departmentName;
    }
    return 'No Department';
  }

  // Helper method to safely format total hours
  formatTotalHours(): string {
    if (!this.todayAttendance || this.todayAttendance.totalHours === null || this.todayAttendance.totalHours === undefined) {
      return this.calculateWorkingHours();
    }
    
    // Fix: Remove optional chaining since we've checked for null/undefined
    return this.todayAttendance.totalHours.toFixed(2) + ' hours';
  }
}