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
  payslips: any[] = [];
  filteredPayslips: any[] = [];
  isLoading: boolean = false;
  hasPayrollAccess: boolean = false;
  
  // Filters
  searchTerm: string = '';
  payPeriodFilter: string = '';
  statusFilter: string = 'ALL';
  
  // Stats
  totalPayslips: number = 0;
  totalNetSalary: number = 0;
  generatedCount: number = 0;

    downloadingPayslips: Set<number> = new Set();
  downloadProgress: { [key: number]: number } = {};


selectedPayslips: Set<number> = new Set();


// Bulk download progress
bulkDownloadProgress = {
  show: false,
  total: 0,
  completed: 0,
  percentage: 0
};
  

  constructor(
    private payrollService: PayrollService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.checkAccessAndLoad();
  }

  private checkAccessAndLoad(): void {
    // Check if user has required roles for payroll access
    const user = this.authService.getCurrentUser();
    const requiredRoles = ['ROLE_ACCOUNTANT', 'ROLE_ADMIN', 'ROLE_MANAGER'];
    
    this.hasPayrollAccess = requiredRoles.some(role => 
      user?.roles.includes(role)
    );

    console.log('🔐 Payroll Access Check:');
    console.log('   - User roles:', user?.roles);
    console.log('   - Required roles:', requiredRoles);
    console.log('   - Has access:', this.hasPayrollAccess);

    if (this.hasPayrollAccess) {
      this.loadPayslips();
    } else {
      console.log('❌ User lacks payroll access permissions');
    }
  }

 private loadPayslips(): void {
    this.isLoading = true;
    
    const currentDate = new Date();
    this.payPeriodFilter = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}`;

    console.log('📄 Loading payslips for period:', this.payPeriodFilter);
    
    // First, check if we have payrolls for this period
    this.payrollService.getPayrollsByPeriod(this.payPeriodFilter).subscribe({
        next: (payrolls) => {
            console.log('📊 Found payrolls:', payrolls.length);
            
            if (payrolls.length > 0) {
                // Now load payslips
                this.payrollService.getPayslipsByPayPeriod(this.payPeriodFilter).subscribe({
                    next: (payslips) => {
                        console.log('✅ Payslips loaded:', payslips.length);
                        this.payslips = payslips;
                        this.filteredPayslips = payslips;
                        this.calculateStats();
                        this.isLoading = false;
                        
                        // If no payslips but payrolls exist, suggest generating them
                        if (payslips.length === 0 && payrolls.length > 0) {
                            console.log('⚠️ Payrolls exist but no payslips found');
                            if (confirm('Payroll data exists but payslips are not generated. Generate payslips now?')) {
                                this.generateMissingPayslips(payrolls);
                            }
                        }
                    },
                    error: (error) => {
                        console.error('❌ Error loading payslips:', error);
                        this.isLoading = false;
                    }
                });
            } else {
                console.log('❌ No payrolls found for period:', this.payPeriodFilter);
                this.payslips = [];
                this.filteredPayslips = [];
                this.calculateStats();
                this.isLoading = false;
            }
        },
        error: (error) => {
            console.error('❌ Error checking payrolls:', error);
            this.isLoading = false;
        }
    });
}

private generateMissingPayslips(payrolls: any[]): void {
    payrolls.forEach(payroll => {
        this.payrollService.generatePayslip(payroll.id!).subscribe({
            next: (payslip) => {
                console.log('✅ Generated payslip for payroll:', payroll.id);
            },
            error: (error) => {
                console.error('❌ Failed to generate payslip for payroll:', payroll.id, error);
            }
        });
    });
    
    // Reload after a delay
    setTimeout(() => {
        this.loadPayslips();
    }, 2000);
}
  private handleLoadError(error: any): void {
    if (error.status === 401 || error.status === 403) {
      console.log('🔐 Access denied by server');
    } else {
      alert('Failed to load payslips. Please try again later.');
    }
  }

  onPayPeriodChange(): void {
    if (this.payPeriodFilter && this.hasPayrollAccess) {
      this.loadPayslips();
    }
  }

  applyFilters(): void {
    if (!this.hasPayrollAccess) return;
    
    this.filteredPayslips = this.payslips.filter(payslip => {
      const matchesSearch = 
        payslip.employeeName?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        payslip.employeeCode?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        payslip.payslipCode?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        false;
      
      const matchesStatus = this.statusFilter === 'ALL' || payslip.status === this.statusFilter;
      
      return matchesSearch && matchesStatus;
    });
    
    this.calculateStats();
  }

  private calculateStats(): void {
    this.totalPayslips = this.filteredPayslips.length;
    this.totalNetSalary = this.filteredPayslips.reduce((sum, p) => sum + (p.netSalary || 0), 0);
    this.generatedCount = this.filteredPayslips.filter(p => p.status === 'GENERATED').length;
  }

  generatePayslip(payrollId: number): void {
    if (!this.authService.isAuthenticated()) {
      this.redirectToLogin();
      return;
    }

    if (!this.hasPayrollAccess) {
      alert('You do not have permission to generate payslips.');
      return;
    }

    console.log('🔄 Generating payslip for payroll:', payrollId);

    this.payrollService.generatePayslip(payrollId).subscribe({
      next: (payslip) => {
        console.log('✅ Payslip generated successfully');
        alert('Payslip generated successfully!');
        this.loadPayslips();
      },
      error: (error) => {
        console.error('❌ Error generating payslip:', error);
        
        if (error.status === 401) {
          this.redirectToLogin();
        } else if (error.status === 403) {
          alert('You do not have permission to generate payslips.');
        } else {
          alert('Error generating payslip. Please try again.');
        }
      }
    });
  }

 

    downloadPayslip(payslip: any): void {
    console.log('📥 Downloading payslip:', payslip.payslipCode);
    
    if (!this.authService.isAuthenticated()) {
      this.redirectToLogin();
      return;
    }

    if (!this.hasPayrollAccess) {
      alert('You do not have permission to download payslips.');
      return;
    }

    this.isLoading = true;
    
    this.payrollService.downloadPayslipPdf(payslip.id).subscribe({
      next: (pdfBlob: Blob) => {
        this.isLoading = false;
        this.handlePdfDownload(pdfBlob, payslip);
        console.log('✅ Payslip downloaded successfully');
      },
      error: (error) => {
        this.isLoading = false;
        console.error('❌ Error downloading payslip:', error);
        
        if (error.status === 404) {
          alert('Payslip PDF not found. Please generate the payslip first.');
        } else if (error.status === 500) {
          alert('Error generating PDF. Please try again.');
        } else {
          alert('Failed to download payslip. Please try again.');
        }
      }
    });
  }

    private handlePdfDownload(pdfBlob: Blob, payslip: any): void {
    // Create blob URL
    const blobUrl = URL.createObjectURL(pdfBlob);
    
    // Create download link
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = `payslip-${payslip.payslipCode}-${payslip.employeeCode}.pdf`;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    URL.revokeObjectURL(blobUrl);
    
    // Optional: Show success message
    this.showDownloadSuccess(payslip);
  }

  private showDownloadSuccess(payslip: any): void {
    // You can use a toast notification here
    console.log(`✅ Payslip downloaded: ${payslip.payslipCode}`);
    
    // Optional: Update UI to show downloaded status
    const foundPayslip = this.payslips.find(p => p.id === payslip.id);
    if (foundPayslip) {
      foundPayslip.status = 'DOWNLOADED';
    }
  }


  viewPayslipDetails(payslipId: number): void {
    if (!this.authService.isAuthenticated()) {
      this.redirectToLogin();
      return;
    }
    
    if (!this.hasPayrollAccess) {
      alert('You do not have permission to view payslip details.');
      return;
    }

    this.router.navigate(['/admin/payroll/payslips', payslipId]);
  }

  private redirectToLogin(): void {
    this.authService.logout();
    this.router.navigate(['/login'], {
      queryParams: { returnUrl: this.router.url }
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 2
    }).format(amount || 0);
  }

  getStatusBadgeClass(status: string): string {
    switch (status?.toUpperCase()) {
      case 'GENERATED': return 'badge bg-success';
      case 'PENDING': return 'badge bg-warning';
      case 'DOWNLOADED': return 'badge bg-info';
      case 'ARCHIVED': return 'badge bg-secondary';
      default: return 'badge bg-secondary';
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

  clearFilters(): void {
    this.searchTerm = '';
    this.statusFilter = 'ALL';
    this.filteredPayslips = this.payslips;
    this.calculateStats();
  }

  refreshData(): void {
    console.log('🔄 Refreshing payslip data');
    if (this.hasPayrollAccess) {
      this.loadPayslips();
    }
  }

  // Helper properties for template
  get hasData(): boolean {
    return this.payslips.length > 0;
  }

  get filteredCount(): number {
    return this.filteredPayslips.length;
  }



  togglePayslipSelection(payslipId: number): void {
  if (this.selectedPayslips.has(payslipId)) {
    this.selectedPayslips.delete(payslipId);
  } else {
    this.selectedPayslips.add(payslipId);
  }
}

isPayslipSelected(payslipId: number): boolean {
  return this.selectedPayslips.has(payslipId);
}

toggleSelectAll(): void {
  if (this.isAllSelected()) {
    this.selectedPayslips.clear();
  } else {
    this.filteredPayslips.forEach(payslip => {
      this.selectedPayslips.add(payslip.id);
    });
  }
}

isAllSelected(): boolean {
  return this.filteredPayslips.length > 0 && 
         this.selectedPayslips.size === this.filteredPayslips.length;
}

clearSelection(): void {
  this.selectedPayslips.clear();
}

// Download methods
isDownloading(payslipId: number): boolean {
  return this.downloadingPayslips.has(payslipId);
}

getDownloadProgress(payslipId: number): number {
  return this.downloadProgress[payslipId] || 0;
}

// Bulk download method
downloadMultiplePayslips(): void {
  if (this.selectedPayslips.size === 0) {
    alert('Please select at least one payslip to download.');
    return;
  }

  if (this.selectedPayslips.size > 10) {
    if (!confirm(`You are about to download ${this.selectedPayslips.size} payslips. This may take a while. Continue?`)) {
      return;
    }
  }

  this.startBulkDownload();
}

private startBulkDownload(): void {
  const selectedPayslips = this.filteredPayslips.filter(p => 
    this.selectedPayslips.has(p.id)
  );

  this.bulkDownloadProgress = {
    show: true,
    total: selectedPayslips.length,
    completed: 0,
    percentage: 0
  };

  // Download payslips sequentially with delay
  selectedPayslips.forEach((payslip, index) => {
    setTimeout(() => {
      this.downloadSinglePayslipForBulk(payslip);
    }, index * 500); // 0.5 second delay between downloads
  });
}

private downloadSinglePayslipForBulk(payslip: any): void {
  this.downloadingPayslips.add(payslip.id);
  
  this.payrollService.downloadPayslipPdf(payslip.id).subscribe({
    next: (pdfBlob: Blob) => {
      this.handlePdfDownload(pdfBlob, payslip);
      this.downloadingPayslips.delete(payslip.id);
      this.updateBulkDownloadProgress();
    },
    error: (error) => {
      this.downloadingPayslips.delete(payslip.id);
      console.error(`❌ Error downloading payslip ${payslip.payslipCode}:`, error);
      this.updateBulkDownloadProgress();
    }
  });
}

private updateBulkDownloadProgress(): void {
  this.bulkDownloadProgress.completed++;
  this.bulkDownloadProgress.percentage = Math.round(
    (this.bulkDownloadProgress.completed / this.bulkDownloadProgress.total) * 100
  );

  // Hide progress when complete
  if (this.bulkDownloadProgress.completed === this.bulkDownloadProgress.total) {
    setTimeout(() => {
      this.bulkDownloadProgress.show = false;
      alert(`✅ Successfully downloaded ${this.bulkDownloadProgress.completed} payslips!`);
    }, 1000);
  }
}

cancelBulkDownload(): void {
  this.bulkDownloadProgress.show = false;
  this.downloadingPayslips.clear();
  // Note: We can't cancel ongoing HTTP requests, but we can stop future ones
}

// Utility method
getSelectedNetSalaryTotal(): number {
  return this.filteredPayslips
    .filter(p => this.selectedPayslips.has(p.id))
    .reduce((sum, p) => sum + (p.netSalary || 0), 0);
}

  // Debug method to check user info
  debugUserInfo(): void {
    const user = this.authService.getCurrentUser();
    console.log('=== USER ROLE DEBUG ===');
    console.log('User:', user);
    console.log('Roles:', user?.roles);
    console.log('Has ADMIN:', user?.roles.includes('ROLE_ADMIN'));
    console.log('Has ACCOUNTANT:', user?.roles.includes('ROLE_ACCOUNTANT')); 
    console.log('Has MANAGER:', user?.roles.includes('ROLE_MANAGER'));
    console.log('Has EMPLOYEE:', user?.roles.includes('ROLE_EMPLOYEE'));
    console.log('=====================');
  }
}