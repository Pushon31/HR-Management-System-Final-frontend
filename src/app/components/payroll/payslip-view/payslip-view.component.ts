import { Component, OnInit } from '@angular/core';
import { PayrollService } from '../../../services/payroll.service';
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

  // Calculated properties
  totalBasicSalary: number = 0;
  totalNetSalary: number = 0;
  generatedPayslipsCount: number = 0;

  // For employee view
  isEmployeeView: boolean = false;
  employeeId: string = '';

  constructor(private payrollService: PayrollService) {}

  ngOnInit(): void {
    this.loadPayslips();
  }

  loadPayslips(): void {
    this.isLoading = true;
    
    const currentDate = new Date();
    const currentYearMonth = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}`;
    this.payPeriodFilter = currentYearMonth;
    
    this.payrollService.getPayslipsByPayPeriod(currentYearMonth).subscribe({
      next: (payslips) => {
        this.payslips = payslips;
        this.filteredPayslips = payslips;
        this.calculatePayslipStats();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading payslips:', error);
        this.isLoading = false;
      }
    });
  }

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

  onPayPeriodChange(): void {
    if (this.payPeriodFilter) {
      this.isLoading = true;
      this.payrollService.getPayslipsByPayPeriod(this.payPeriodFilter).subscribe({
        next: (payslips) => {
          this.payslips = payslips;
          this.filteredPayslips = payslips;
          this.calculatePayslipStats();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading payslips:', error);
          this.isLoading = false;
        }
      });
    }
  }

  generatePayslip(payrollId: number): void {
    this.payrollService.generatePayslip(payrollId).subscribe({
      next: (payslip) => {
        alert('Payslip generated successfully!');
        this.loadPayslips();
      },
      error: (error) => {
        console.error('Error generating payslip:', error);
        alert('Error generating payslip. Please try again.');
      }
    });
  }

  downloadPayslip(payslip: Payslip): void {
    // Implement PDF generation/download logic
    console.log('Downloading payslip:', payslip);
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