import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router'; 
import { PayrollService } from '../../../services/payroll.service';

@Component({
  selector: 'app-payroll-dashboard',
  templateUrl: './payroll-dashboard.component.html',
  styleUrls: ['./payroll-dashboard.component.scss']
})
export class PayrollDashboardComponent implements OnInit {
  
  currentMonth: string = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
  pendingPayrolls: number = 0;
  processedThisMonth: number = 0;
  totalEmployees: number = 0;
  upcomingBonuses: number = 0;

  quickActions = [
    { 
      title: 'Process Monthly Salary', 
      description: 'Process salary for current month', 
      icon: 'fa-calculator',
      route: '/admin/payroll/process',
      color: 'success'
    },
    { 
      title: 'Employee Salary Setup', 
      description: 'Setup salary structure for employees', 
      icon: 'fa-money-bill-wave',
      route: '/admin/payroll/structures',
      color: 'primary'
    },
    { 
      title: 'Add Employee Bonus', 
      description: 'Add bonuses for employees', 
      icon: 'fa-gift',
      route: '/admin/payroll/bonus',
      color: 'warning'
    },
    { 
      title: 'Generate Payslips', 
      description: 'View and generate employee payslips', 
      icon: 'fa-file-invoice-dollar',
      route: '/admin/payroll/payslips',
      color: 'info'
    }
  ];

  monthlyStatus = [
    { month: 'November 2024', status: 'Pending', processed: 0, total: 45 },
    { month: 'October 2024', status: 'Completed', processed: 45, total: 45 },
    { month: 'September 2024', status: 'Completed', processed: 42, total: 42 }
  ];

  // ✅ Constructor-এ Router inject করুন
  constructor(
    private payrollService: PayrollService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadRealisticData();
  }

  loadRealisticData(): void {
    this.payrollService.getPayrollDashboard().subscribe({
      next: (data: any) => {
        this.pendingPayrolls = data.pendingPayrolls || 0;
        this.processedThisMonth = data.processedThisMonth || 0;
        this.totalEmployees = data.totalEmployees || 0;
        this.upcomingBonuses = data.upcomingBonuses || 0;
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        this.pendingPayrolls = 45;
        this.processedThisMonth = 0;
        this.totalEmployees = 45;
        this.upcomingBonuses = 3;
      }
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 2
    }).format(amount);
  }

  // ✅ এই method টি যোগ করুন
  getProgressBarClass(): string {
    const progress = (this.processedThisMonth / this.totalEmployees) * 100;
    if (progress === 0) return 'bg-danger';
    if (progress < 50) return 'bg-warning';
    if (progress < 100) return 'bg-info';
    return 'bg-success';
  }

  // ✅ এই method টি যোগ করুন
  getStatusBadge(status: string): string {
    switch (status) {
      case 'Completed': return 'badge bg-success';
      case 'In Progress': return 'badge bg-info';
      case 'Pending': return 'badge bg-warning';
      case 'Not Started': return 'badge bg-secondary';
      default: return 'badge bg-secondary';
    }
  }

  // ✅ Router ব্যবহার করে method টি ঠিক করুন
  startCurrentMonthPayroll(): void {
    this.router.navigate(['/admin/payroll/process']);
  }
}