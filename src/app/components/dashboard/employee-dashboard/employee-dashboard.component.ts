import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-employee-dashboard',
  templateUrl: './employee-dashboard.component.html',
  styleUrls: ['./employee-dashboard.component.scss']
})
export class EmployeeDashboardComponent implements OnInit {
  currentUser: any;
  stats = {
    pendingTasks: 0,
    leaveBalance: 0,
    attendanceThisMonth: 0,
    upcomingLeaves: 0
  };

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadDashboardStats();
  }

  loadDashboardStats(): void {
    // Mock data
    this.stats = {
      pendingTasks: 3,
      leaveBalance: 12,
      attendanceThisMonth: 22,
      upcomingLeaves: 2
    };
  }
}