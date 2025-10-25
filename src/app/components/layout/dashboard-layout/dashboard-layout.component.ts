import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-dashboard-layout',
  templateUrl: './dashboard-layout.component.html',
  styleUrls: ['./dashboard-layout.component.scss']
})
export class DashboardLayoutComponent implements OnInit {
  
  currentUser: any;
  userRole: string = '';
  sidebarCollapsed = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }
    this.determineUserRole();
  }

  private determineUserRole(): void {
    const roles = this.currentUser?.roles || [];
    
    if (roles.includes('ROLE_ADMIN')) {
      this.userRole = 'Admin';
    } else if (roles.includes('ROLE_MANAGER')) {
      this.userRole = 'Manager';
    } else if (roles.includes('ROLE_HR')) {
      this.userRole = 'HR Manager';
    } else if (roles.includes('ROLE_ACCOUNTANT')) {
      this.userRole = 'Accountant';
    } else if (roles.includes('ROLE_EMPLOYEE')) {
      this.userRole = 'Employee';
    } else {
      this.userRole = 'User';
    }
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  logout(): void {
    this.authService.logout();
  }

  navigateToProfile(): void {
    const basePath = this.getBasePath();
    this.router.navigate([`/${basePath}/profile`]);
  }

  private getBasePath(): string {
    const roles = this.currentUser?.roles || [];
    
    // Fix: Add type annotation to the role parameter
    if (roles.includes('ROLE_ADMIN')) {
      return 'admin';
    } else if (roles.some((role: string) => 
      ['ROLE_MANAGER', 'ROLE_HR', 'ROLE_ACCOUNTANT'].includes(role))) {
      return 'manager';
    } else {
      return 'employee';
    }
  }
}