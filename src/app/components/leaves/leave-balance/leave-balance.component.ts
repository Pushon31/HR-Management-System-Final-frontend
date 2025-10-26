// leave-balance.component.ts
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { LeaveService } from '../../../services/leave.service';
import { EmployeeService } from '../../../services/employee.service';
import { LeaveBalance } from '../../../models/leave.model';
import { Employee } from '../../../models/employee.model';

@Component({
  selector: 'app-leave-balance',
  templateUrl: './leave-balance.component.html',
  styleUrls: ['./leave-balance.component.scss']
})
export class LeaveBalanceComponent implements OnInit {
  currentUser: any;
  employeeData: Employee | null = null;
  leaveBalances: LeaveBalance[] = [];
  loading = false;
  currentYear = new Date().getFullYear();

  constructor(
    private authService: AuthService,
    private leaveService: LeaveService,
    private employeeService: EmployeeService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadEmployeeData();
  }

  loadEmployeeData(): void {
    if (!this.currentUser) return;

    this.loading = true;
    
    this.employeeService.getEmployeeByEmployeeId(this.currentUser.username).subscribe({
      next: (employee) => {
        this.employeeData = employee;
        this.loadLeaveBalances(employee.id);
      },
      error: (error) => {
        console.error('Error loading employee data:', error);
        this.loading = false;
      }
    });
  }

  loadLeaveBalances(employeeId: number): void {
    this.leaveService.getEmployeeLeaveBalances(employeeId).subscribe({
      next: (balances) => {
        this.leaveBalances = balances;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading leave balances:', error);
        this.loading = false;
      }
    });
  }

  getProgressPercentage(balance: LeaveBalance): number {
    if (balance.totalDays === 0) return 0;
    return (balance.usedDays / balance.totalDays) * 100;
  }

  getProgressColor(balance: LeaveBalance): string {
    const percentage = this.getProgressPercentage(balance);
    if (percentage >= 80) return 'danger';
    if (percentage >= 60) return 'warning';
    return 'success';
  }

  getAvailableDays(balance: LeaveBalance): number {
    return balance.totalDays - balance.usedDays + balance.carryForwardDays;
  }
}