import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { AttendanceService } from '../../../services/attendance.service';
import { EmployeeService } from '../../../services/employee.service';
import { Router } from '@angular/router';
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
  errorMessage = ''; // ✅ ADDED: Error handling

  constructor(
    private authService: AuthService,
    private attendanceService: AttendanceService,
    private employeeService: EmployeeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    console.log('👤 Current User:', this.currentUser);
    console.log('🆔 Employee ID:', this.authService.getEmployeeId()); // ✅ ADDED
    
    if (this.currentUser) {
      this.loadEmployeeData();
    } else {
      console.error('❌ No user found, redirecting to login');
      this.router.navigate(['/login']);
    }
    
    // Update current time every second
    this.timeInterval = setInterval(() => {
      this.currentTime = new Date();
    }, 1000);
  }

  ngOnDestroy(): void {
    console.log('🧹 Cleaning up attendance checkin component...');
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
      console.log('✅ Time interval cleared');
    }
  }

  loadEmployeeData(): void {
    if (!this.currentUser) return;

    this.loading = true;
    this.errorMessage = '';
    
    // ✅ FIXED: Use employee ID from auth service
    const employeeId = this.authService.getEmployeeId();
    
    if (employeeId) {
      console.log('🔄 Loading employee data for employee ID:', employeeId);
      
      this.employeeService.getEmployeeByEmployeeId(employeeId).subscribe({
        next: (employee) => {
          console.log('✅ Employee data loaded:', employee);
          this.employeeData = employee;
          this.loadTodayAttendance();
        },
        error: (error) => {
          console.error('❌ Error loading employee data:', error);
          this.errorMessage = 'Employee data not found. Please contact administrator.';
          this.loading = false;
          this.loadTodayAttendance(); // Still try to load attendance
        }
      });
    } else {
      console.warn('⚠️ No employee ID found for user');
      this.errorMessage = 'No employee record found. Please contact administrator.';
      this.loading = false;
      this.loadTodayAttendance(); // Still try to load attendance
    }
  }

  loadTodayAttendance(): void {
    if (!this.currentUser) {
      this.loading = false;
      return;
    }

    console.log('🔄 Loading today attendance');
    
    this.attendanceService.getTodayAttendance().subscribe({
      next: (attendance) => {
        console.log('✅ Today attendance:', attendance);
        this.todayAttendance = attendance;
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Error loading today attendance:', error);
        this.todayAttendance = null;
        this.loading = false;
        
        // Don't show error if it's just "no attendance record found"
        if (error.status !== 404) {
          this.errorMessage = 'Failed to load attendance data. Please try again.';
        }
      }
    });
  }

  checkIn(): void {
    if (!this.currentUser) {
      alert('Please login first');
      return;
    }

    this.checkingIn = true;
    this.errorMessage = '';
    
    console.log('🔄 Checking in...');
    
    this.attendanceService.checkIn().subscribe({
      next: (attendance) => {
        console.log('✅ Check-in successful:', attendance);
        this.todayAttendance = attendance;
        this.checkingIn = false;
        
        if (this.isLateCheckIn()) {
          alert('Checked in successfully! 🟡 (Late arrival)');
        } else {
          alert('Checked in successfully! ✅ (On time)');
        }
      },
      error: (error) => {
        console.error('❌ Check-in error:', error);
        this.checkingIn = false;
        
        const errorMessage = error.error?.message || error.message || 'Please try again.';
        this.errorMessage = 'Check-in failed: ' + errorMessage;
        alert('Check-in failed: ' + errorMessage);
      }
    });
  }

  checkOut(): void {
    if (!this.currentUser) return;

    this.checkingOut = true;
    this.errorMessage = '';

    this.attendanceService.checkOut().subscribe({
      next: (attendance) => {
        this.todayAttendance = attendance;
        this.checkingOut = false;
        
        const hours = attendance.totalHours || this.calculateWorkingHours();
        alert(`Check-out successful! ✅\nTotal working hours: ${hours}`);
      },
      error: (error) => {
        console.error('Error during check-out:', error);
        this.checkingOut = false;
        const errorMessage = error.error?.message || 'Please try again.';
        this.errorMessage = 'Check-out failed: ' + errorMessage;
        alert('Error during check-out: ' + errorMessage);
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
    
    if (this.todayAttendance.checkinTime) {
      return 'CHECKED_IN';
    }
    
    return 'NOT_CHECKED_IN';
  }

  formatTime(timeString: string): string {
    if (!timeString) return 'N/A';
    
    try {
      const timePart = timeString.includes('T') 
        ? timeString.split('T')[1]?.split('.')[0]
        : timeString;
      
      const [hours, minutes, seconds] = timePart.split(':');
      const time = new Date();
      time.setHours(
        parseInt(hours, 10), 
        parseInt(minutes, 10), 
        seconds ? parseInt(seconds, 10) : 0
      );
      
      return time.toLocaleTimeString('en-BD', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
    } catch (error) {
      console.error('Error formatting time:', error);
      return 'Invalid Time';
    }
  }

  calculateWorkingHours(): string {
    if (!this.todayAttendance?.checkinTime) {
      return '0h 0m';
    }

    const checkinTime = this.todayAttendance.checkinTime;
    const checkoutTime = this.todayAttendance.checkoutTime || new Date().toTimeString().split(' ')[0];
    
    const [checkinHours, checkinMinutes] = checkinTime.split(':').map(Number);
    const [checkoutHours, checkoutMinutes] = checkoutTime.split(':').map(Number);
    
    let totalMinutes = (checkoutHours * 60 + checkoutMinutes) - (checkinHours * 60 + checkinMinutes);
    
    if (totalMinutes < 0) {
      totalMinutes += 24 * 60;
    }
    
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    return `${hours}h ${minutes}m`;
  }

  isLateCheckIn(): boolean {
    if (!this.todayAttendance?.checkinTime) return false;
    
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
    // ✅ FIXED: Use employee ID from auth service
    return this.authService.getEmployeeId() || this.currentUser?.username || 'N/A';
  }

  getDepartmentName(): string {
    if (this.employeeData) {
      return this.employeeData.departmentName || 'No Department';
    }
    
    if (this.todayAttendance && this.todayAttendance.departmentName) {
      return this.todayAttendance.departmentName;
    }
    return 'No Department';
  }

  formatTotalHours(): string {
    if (!this.todayAttendance || this.todayAttendance.totalHours === null || this.todayAttendance.totalHours === undefined) {
      return this.calculateWorkingHours();
    }
    
    return this.todayAttendance.totalHours.toFixed(2) + ' hours';
  }

  // ✅ ADDED: Refresh data method
  refreshData(): void {
    this.loadEmployeeData();
  }

  // ✅ ADDED: Check if user has employee record
  hasEmployeeRecord(): boolean {
    return this.authService.hasEmployeeRecord();
  }
}