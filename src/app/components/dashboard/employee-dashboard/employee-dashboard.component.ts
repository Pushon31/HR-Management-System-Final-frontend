import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { EmployeeService } from '../../../services/employee.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-employee-dashboard',
  templateUrl: './employee-dashboard.component.html',
  styleUrls: ['./employee-dashboard.component.scss']
})
export class EmployeeDashboardComponent implements OnInit {
  currentUser: any;
  employee: any;
  isLoading = true;
  
  // Dashboard Stats
  stats = {
    pendingTasks: 0,
    leaveBalance: 15, // Default annual leave
    attendanceThisMonth: 0,
    upcomingLeaves: 0,
    completedTasks: 0,
    totalProjects: 0
  };

  // Quick Actions
  quickActions = [
    { 
      icon: 'fas fa-calendar-check', 
      label: 'Check In', 
      description: 'Mark your attendance',
      route: '/employee/attendance/checkin',
      color: 'primary',
      enabled: true
    },
    { 
      icon: 'fas fa-clipboard-list', 
      label: 'Apply Leave', 
      description: 'Submit leave request',
      route: '/employee/leaves/apply',
      color: 'success',
      enabled: true
    },
    { 
      icon: 'fas fa-tasks', 
      label: 'My Tasks', 
      description: 'View assigned tasks',
      route: '/employee/tasks',
      color: 'info',
      enabled: true
    },
    { 
      icon: 'fas fa-file-invoice-dollar', 
      label: 'Payslips', 
      description: 'View salary details',
      route: '/employee/payroll/payslips',
      color: 'warning',
      enabled: true
    },
    { 
      icon: 'fas fa-user-edit', 
      label: 'Update Profile', 
      description: 'Edit personal information',
      route: '/employee/profile/edit',
      color: 'secondary',
      enabled: true
    },
    { 
      icon: 'fas fa-history', 
      label: 'Attendance History', 
      description: 'View attendance records',
      route: '/employee/attendance/history',
      color: 'dark',
      enabled: true
    }
  ];

  // Recent Activities (Mock data for now)
  recentActivities = [
    {
      icon: 'fas fa-tasks',
      title: 'Task Assigned',
      description: 'New task "Website Redesign" assigned by Manager',
      time: '2 hours ago',
      type: 'task'
    },
    {
      icon: 'fas fa-calendar-check',
      title: 'Attendance Marked',
      description: 'You checked in at 09:15 AM today',
      time: '4 hours ago',
      type: 'attendance'
    },
    {
      icon: 'fas fa-clipboard-check',
      title: 'Leave Approved',
      description: 'Your leave request for Dec 25-26 has been approved',
      time: '1 day ago',
      type: 'leave'
    },
    {
      icon: 'fas fa-file-invoice-dollar',
      title: 'Payslip Generated',
      description: 'November salary payslip is now available',
      time: '3 days ago',
      type: 'payroll'
    }
  ];

  // Upcoming Leaves (Mock data)
  upcomingLeaves = [
    {
      type: 'Annual Leave',
      startDate: '2024-12-25',
      endDate: '2024-12-26',
      status: 'APPROVED',
      days: 2
    },
    {
      type: 'Sick Leave',
      startDate: '2024-12-30',
      endDate: '2024-12-30',
      status: 'PENDING',
      days: 1
    }
  ];

  currentDate = new Date();
currentTime = new Date();

  constructor(
    private authService: AuthService,
    private employeeService: EmployeeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
    // Update time every minute
  setInterval(() => {
    this.currentTime = new Date();
    this.currentDate = new Date();
  }, 60000);
}
  loadDashboardData(): void {
    this.isLoading = true;
    this.currentUser = this.authService.getCurrentUser();

    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    // Load employee data
    this.employeeService.getEmployeeByUserId(this.currentUser.id).subscribe({
      next: (employee) => {
        this.employee = employee;
        this.loadDashboardStats();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading employee data:', error);
        // Fallback: Try to load by employee ID
        const employeeId = this.authService.getEmployeeId();
        if (employeeId) {
          this.employeeService.getEmployeeByEmployeeId(employeeId).subscribe({
            next: (emp) => {
              this.employee = emp;
              this.loadDashboardStats();
              this.isLoading = false;
            },
            error: (err) => {
              this.handleDashboardError(err);
            }
          });
        } else {
          this.handleDashboardError(error);
        }
      }
    });
  }

  loadDashboardStats(): void {
    // Mock stats - Replace with actual API calls when services are available
    this.stats = {
      pendingTasks: 3,
      leaveBalance: 12,
      attendanceThisMonth: 18,
      upcomingLeaves: 2,
      completedTasks: 15,
      totalProjects: 5
    };
  }

  handleDashboardError(error: any): void {
    console.error('Dashboard error:', error);
    this.isLoading = false;
    // Even if employee data fails, we can still show the dashboard with basic info
    this.employee = {
      firstName: this.currentUser?.fullName?.split(' ')[0] || 'Employee',
      lastName: this.currentUser?.fullName?.split(' ')[1] || '',
      designation: 'Employee'
    };
    this.loadDashboardStats();
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  }

  getWorkTypeBadgeClass(workType: string): string {
    switch (workType) {
      case 'ONSITE': return 'badge-primary';
      case 'REMOTE': return 'badge-success';
      case 'HYBRID': return 'badge-info';
      default: return 'badge-secondary';
    }
  }
}