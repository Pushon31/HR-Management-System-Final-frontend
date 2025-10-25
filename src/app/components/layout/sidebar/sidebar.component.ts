import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

// Define UserRole type to fix the TypeScript error
type UserRole = 'ROLE_ADMIN' | 'ROLE_MANAGER' | 'ROLE_HR' | 'ROLE_ACCOUNTANT' | 'ROLE_EMPLOYEE';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  @Input() currentUser: any;
  @Input() userRole: string = '';
  @Input() sidebarCollapsed: boolean = false;

  constructor(private router: Router) {}

  // Navigation items based on user role
  get navigationItems(): any[] {
    const basePath = this.getBasePath();
    const items = [];

    if (this.currentUser?.roles.includes('ROLE_ADMIN')) {
      items.push(
        { path: `/${basePath}/dashboard`, icon: 'fas fa-tachometer-alt', label: 'Dashboard', active: true },
        { path: `/${basePath}/employees`, icon: 'fas fa-users', label: 'Employees' },
        { path: `/${basePath}/departments`, icon: 'fas fa-building', label: 'Departments' },
        { path: `/${basePath}/attendance/reports`, icon: 'fas fa-calendar-check', label: 'Attendance' },
        { path: `/${basePath}/leaves/approvals`, icon: 'fas fa-clipboard-list', label: 'Leave Management' },
        { path: `/${basePath}/recruitment/jobs`, icon: 'fas fa-briefcase', label: 'Recruitment' },
        { path: `/${basePath}/payroll/process`, icon: 'fas fa-calculator', label: 'Payroll' },
        { path: `/${basePath}/tasks`, icon: 'fas fa-tasks', label: 'Tasks' },
        { path: `/${basePath}/projects`, icon: 'fas fa-project-diagram', label: 'Projects' },
        { path: `/${basePath}/analytics/employees`, icon: 'fas fa-chart-bar', label: 'Analytics' }
      );
    } else if (this.currentUser?.roles.some((role: UserRole) => 
      ['ROLE_MANAGER', 'ROLE_HR', 'ROLE_ACCOUNTANT'].includes(role))) {
      items.push(
        { path: `/${basePath}/dashboard`, icon: 'fas fa-tachometer-alt', label: 'Dashboard', active: true },
        { path: `/${basePath}/team`, icon: 'fas fa-users', label: 'My Team' },
        { path: `/${basePath}/attendance`, icon: 'fas fa-calendar-check', label: 'Attendance' },
        { path: `/${basePath}/leaves/approvals`, icon: 'fas fa-clipboard-list', label: 'Leave Approvals' },
        { path: `/${basePath}/tasks`, icon: 'fas fa-tasks', label: 'Tasks' },
        { path: `/${basePath}/projects`, icon: 'fas fa-project-diagram', label: 'Projects' }
      );

      // HR specific items
      if (this.currentUser?.roles.includes('ROLE_HR')) {
        items.push(
          { path: `/${basePath}/recruitment/jobs`, icon: 'fas fa-briefcase', label: 'Recruitment' }
        );
      }

      // Accountant specific items
      if (this.currentUser?.roles.includes('ROLE_ACCOUNTANT')) {
        items.push(
          { path: `/${basePath}/payroll/process`, icon: 'fas fa-calculator', label: 'Payroll' }
        );
      }
    } else {
      // Employee items
      items.push(
        { path: `/${basePath}/dashboard`, icon: 'fas fa-tachometer-alt', label: 'Dashboard', active: true },
        { path: `/${basePath}/profile`, icon: 'fas fa-user', label: 'Profile' },
        { path: `/${basePath}/attendance/checkin`, icon: 'fas fa-calendar-check', label: 'Attendance' },
        { path: `/${basePath}/leaves/apply`, icon: 'fas fa-clipboard-list', label: 'Leave' },
        { path: `/${basePath}/tasks`, icon: 'fas fa-tasks', label: 'Tasks' },
        { path: `/${basePath}/payroll/payslips`, icon: 'fas fa-calculator', label: 'Payslips' }
      );
    }

    return items;
  }

  private getBasePath(): string {
    const roles = this.currentUser?.roles || [];
  
    if (roles.includes('ROLE_ADMIN')) {
      return 'admin';
    } else if (roles.some((role: UserRole) => 
      ['ROLE_MANAGER', 'ROLE_HR', 'ROLE_ACCOUNTANT'].includes(role))) {
      return 'manager';
    } else {
      return 'employee';
    }
  }

  isActiveRoute(route: string): boolean {
    return this.router.url.includes(route);
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }
}