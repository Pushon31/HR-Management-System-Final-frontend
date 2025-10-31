import { Component, OnInit } from '@angular/core';
import { PayrollService } from '../../../services/payroll.service';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { Payslip } from '../../../models/payroll.model';

@Component({
  selector: 'app-payslip-view',
  templateUrl: './payslip-view.component.html',
  styleUrls: ['./payslip-view.component.scss']
})
export class PayslipViewComponent implements OnInit {
  payslips: Payslip[] = [];
  filteredPayslips: Payslip[] = [];
  searchTerm: string = '';
  payPeriodFilter: string = '';
  isLoading: boolean = false;

  totalBasicSalary: number = 0;
  totalNetSalary: number = 0;
  generatedPayslipsCount: number = 0;

  isEmployeeView: boolean = false;
  employeeId: string = '';

  constructor(
    private payrollService: PayrollService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log('🔐 Checking authentication before loading payslips');
    
    // Debug token info
    const tokenInfo = this.authService.getTokenInfo();
    console.log('🔐 Token Info:', tokenInfo);
    
    if (!this.authService.isAuthenticated()) {
      console.log('🔐 User not authenticated, redirecting to login');
      this.handleAuthenticationError();
      return;
    }
    
    console.log('🔐 User authenticated, loading payslips');
    this.loadPayslips();
  }

  loadPayslips(): void {
    this.isLoading = true;
    
    const currentDate = new Date();
    const currentYearMonth = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}`;
    this.payPeriodFilter = currentYearMonth;
    
    console.log('📄 Loading payslips for period:', currentYearMonth);
    
    this.payrollService.getPayslipsByPayPeriod(currentYearMonth).subscribe({
      next: (payslips) => {
        console.log('✅ Payslips loaded successfully:', payslips.length, 'records');
        this.payslips = payslips;
        this.filteredPayslips = payslips;
        this.calculatePayslipStats();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('❌ Error loading payslips:', error);
        
        if (error.status === 401) {
          console.log('🔐 401 Unauthorized - Session expired');
          this.handleAuthenticationError();
        } else {
          console.log('⚠️ Other error - showing generic message');
          alert('Failed to load payslips. Please try again.');
        }
        
        this.isLoading = false;
      }
    });
  }

  private handleAuthenticationError(): void {
    console.log('🔐 Handling authentication error - redirecting to login');
    alert('Your session has expired. Please login again.');
    this.authService.logout();
    this.router.navigate(['/login'], { 
      queryParams: { 
        returnUrl: this.router.url,
        error: 'session_expired'
      }
    });
  }

  onPayPeriodChange(): void {
    if (this.payPeriodFilter) {
      this.isLoading = true;
      console.log('📄 Changing period to:', this.payPeriodFilter);
      
      this.payrollService.getPayslipsByPayPeriod(this.payPeriodFilter).subscribe({
        next: (payslips) => {
          console.log('✅ Payslips loaded for new period:', payslips.length, 'records');
          this.payslips = payslips;
          this.filteredPayslips = payslips;
          this.calculatePayslipStats();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('❌ Error loading payslips for new period:', error);
          
          if (error.status === 401) {
            this.handleAuthenticationError();
          } else {
            alert('Failed to load payslips. Please try again.');
          }
          
          this.isLoading = false;
        }
      });
    }
  }

  // ... rest of your methods remain the same
  calculatePayslipStats(): void {
    this.totalBasicSalary = this.filteredPayslips.reduce((sum, p) => sum + p.basicSalary, 0);
    this.totalNetSalary = this.filteredPayslips.reduce((sum, p) => sum + p.netSalary, 0);
    this.generatedPayslipsCount = this.filteredPayslips.filter(p => p.status === 'GENERATED').length;
  }

  applyFilters(): void {
    this.filteredPayslips = this.payslips.filter(payslip => {
      const matchesSearch = payslip.employeeName?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           payslip.employeeCode?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           payslip.payslipCode?.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesPeriod = !this.payPeriodFilter || payslip.payPeriod === this.payPeriodFilter;
      
      return matchesSearch && matchesPeriod;
    });
    this.calculatePayslipStats();
  }

  generatePayslip(payrollId: number): void {
    console.log('🔄 Generating payslip for payroll ID:', payrollId);
    
    this.payrollService.generatePayslip(payrollId).subscribe({
      next: (payslip) => {
        console.log('✅ Payslip generated successfully');
        alert('Payslip generated successfully!');
        this.loadPayslips();
      },
      error: (error) => {
        console.error('❌ Error generating payslip:', error);
        
        if (error.status === 401) {
          this.handleAuthenticationError();
          return;
        }
        
        alert('Error generating payslip. Please try again.');
      }
    });
  }

  downloadPayslip(payslip: Payslip): void {
    console.log('📥 Downloading payslip:', payslip);
    alert('Payslip download functionality would be implemented here');
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 2
    }).format(amount);
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'GENERATED': return 'badge bg-success';
      case 'DOWNLOADED': return 'badge bg-info';
      case 'ARCHIVED': return 'badge bg-secondary';
      default: return 'badge bg-warning';
    }
  }

  getPayPeriodOptions(): string[] {
    const periods: string[] = [];
    const currentDate = new Date();
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const period = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      periods.push(period);
    }
    
    return periods;
  }
}