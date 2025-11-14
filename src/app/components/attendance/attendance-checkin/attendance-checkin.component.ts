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
  errorMessage = '';

  // ✅ ADD: Location properties
  userLocation: { lat: number, lng: number } | null = null;
  locationError = '';
  locationLoading = false;
  locationSupported = true;

  constructor(
    private authService: AuthService,
    private attendanceService: AttendanceService,
    private employeeService: EmployeeService,
    private router: Router
  ) {}

ngOnInit(): void {
  this.currentUser = this.authService.getCurrentUser();
  console.log('👤 Current User:', this.currentUser);
  console.log('🆔 Employee ID:', this.authService.getEmployeeId());
  
  if (this.currentUser) {
    // ✅ FIX: Check if user has employee record BEFORE loading data
    if (this.hasEmployeeRecord()) {
      this.initializeLocation();
      this.loadEmployeeData();
    } else {
      console.warn('⚠️ User has no employee record, showing warning message');
      this.loading = false;
    }
  } else {
    console.error('❌ No user found, redirecting to login');
    this.router.navigate(['/login']);
  }
  
  // Update current time every second
  this.timeInterval = setInterval(() => {
    this.currentTime = new Date();
  }, 1000);
}



hasEmployeeRecord(): boolean {
  // Cache the result to avoid repeated calls
  if (this._hasEmployeeRecord !== undefined) {
    return this._hasEmployeeRecord;
  }
  
  this._hasEmployeeRecord = this.authService.hasEmployeeRecord();
  console.log('🔍 Employee record check (cached):', this._hasEmployeeRecord);
  return this._hasEmployeeRecord;
}
private _hasEmployeeRecord?: boolean;
  ngOnDestroy(): void {
    console.log('🧹 Cleaning up attendance checkin component...');
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
      console.log('✅ Time interval cleared');
    }
  }

  // ✅ ADD: Initialize location service
  private initializeLocation(): void {
    if (navigator.geolocation) {
      console.log('📍 Geolocation supported');
      this.locationSupported = true;
    } else {
      console.warn('📍 Geolocation not supported');
      this.locationSupported = false;
      this.locationError = 'Location services not supported by your browser';
    }
  }

  // ✅ ADD: Get current location
  private getCurrentLocation(): Promise<{ lat: number, lng: number }> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      this.locationLoading = true;
      this.locationError = '';
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.locationLoading = false;
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          console.log('📍 Location obtained:', location);
          this.userLocation = location;
          resolve(location);
        },
        (error) => {
          this.locationLoading = false;
          console.error('📍 Location error:', error);
          
          let errorMessage = 'Unable to get your location';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied. Please enable location services.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out.';
              break;
          }
          
          this.locationError = errorMessage;
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    });
  }



  loadEmployeeData(): void {
  if (!this.currentUser) return;

  this.loading = true;
  this.errorMessage = '';
  
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
        // Don't try to load attendance if employee data fails
      }
    });
  } else {
    console.warn('⚠️ No employee ID found for user');
    this.errorMessage = 'No employee record found. Please contact administrator to create your employee profile.';
    this.loading = false;
    // Don't try to load attendance without employee ID
  }
}

 

  loadTodayAttendance(): void {
  if (!this.currentUser) {
    this.loading = false;
    return;
  }

  const employeeId = this.authService.getEmployeeId();
  if (!employeeId) {
    console.warn('⚠️ No employee ID, skipping attendance load');
    this.loading = false;
    return;
  }

  console.log('🔄 Loading today attendance for employee:', employeeId);
  
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
      
      if (error.status !== 404) {
        this.errorMessage = 'Failed to load attendance data: ' + (error.message || 'Please try again.');
      }
    }
  });
}

  // ✅ UPDATE: Enhanced check-in with location
  async checkIn(): Promise<void> {
    if (!this.currentUser) {
      alert('Please login first');
      return;
    }

    this.checkingIn = true;
    this.errorMessage = '';
    this.locationError = '';

    try {
      // Get current location
      const location = await this.getCurrentLocation();
      console.log('🔄 Checking in with location:', location);

      // Call enhanced check-in with location
      this.attendanceService.checkIn(location.lat, location.lng, 'WEB').subscribe({
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

    } catch (locationError) {
      console.error('❌ Location error during check-in:', locationError);
      this.checkingIn = false;
      
      // Option 1: Allow check-in without location
      const proceedWithoutLocation = confirm(
        'Location access failed. Would you like to check-in without location verification?'
      );
      
      if (proceedWithoutLocation) {
        this.checkInWithoutLocation();
      }
    }
  }

  //  Check-in without location (fallback)
  public checkInWithoutLocation(): void {
    this.attendanceService.checkIn().subscribe({
      next: (attendance) => {
        console.log('✅ Check-in successful (without location):', attendance);
        this.todayAttendance = attendance;
        
        if (this.isLateCheckIn()) {
          alert('Checked in successfully! 🟡 (Late arrival - No location verification)');
        } else {
          alert('Checked in successfully! ✅ (On time - No location verification)');
        }
      },
      error: (error) => {
        console.error('❌ Check-in error:', error);
        const errorMessage = error.error?.message || 'Please try again.';
        this.errorMessage = 'Check-in failed: ' + errorMessage;
        alert('Check-in failed: ' + errorMessage);
      }
    });
  }

  //  check-out with location
  async checkOut(): Promise<void> {
    if (!this.currentUser) return;

    this.checkingOut = true;
    this.errorMessage = '';
    this.locationError = '';

    try {
      // Get current location
      const location = await this.getCurrentLocation();
      console.log('🔄 Checking out with location:', location);

      this.attendanceService.checkOut(location.lat, location.lng, 'WEB').subscribe({
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

    } catch (locationError) {
      console.error('❌ Location error during check-out:', locationError);
      this.checkingOut = false;
      
      // Allow check-out without location
      const proceedWithoutLocation = confirm(
        'Location access failed. Would you like to check-out without location verification?'
      );
      
      if (proceedWithoutLocation) {
        this.checkOutWithoutLocation();
      }
    }
  }

  //  Check-out without location (fallback)
  public checkOutWithoutLocation(): void {
    this.attendanceService.checkOut().subscribe({
      next: (attendance) => {
        this.todayAttendance = attendance;
        this.checkingOut = false;
        
        const hours = attendance.totalHours || this.calculateWorkingHours();
        alert(`Check-out successful! ✅\nTotal working hours: ${hours}\n(No location verification)`);
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

 
  getLocationStatus(): string {
    if (this.locationLoading) return '🔄 Getting location...';
    if (this.locationError) return '❌ ' + this.locationError;
    if (this.userLocation) return '📍 Location ready';
    return '📍 Click check-in to get location';
  }

  public retryLocation(): void {
  this.userLocation = null;
  this.locationError = '';
  console.log('🔄 Retrying location...');
}

  
  isLocationAvailable(): boolean {
    return this.locationSupported && !this.locationLoading && !this.locationError;
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

  refreshData(): void {
    this.loadEmployeeData();
  }

 
 
}