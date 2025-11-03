import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PayrollService } from '../../../services/payroll.service';
import { Payroll, SalaryStructure } from '../../../models/payroll.model';

@Component({
  selector: 'app-payroll-process',
  templateUrl: './payroll-process.component.html',
  styleUrls: ['./payroll-process.component.scss']
})
export class PayrollProcessComponent implements OnInit {
  payrollForm: FormGroup;
  salaryStructures: SalaryStructure[] = [];
  processedPayrolls: Payroll[] = [];
  isLoading: boolean = false;
  isProcessing: boolean = false;
  selectedEmployeeId: number | null = null;
  showBulkProcess: boolean = false;

  // For bulk processing
  selectedEmployees: number[] = [];

  // Calculated properties
  totalProcessedAmount: number = 0;

  constructor(
    private fb: FormBuilder,
    private payrollService: PayrollService
  ) {
    this.payrollForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadSalaryStructures();
    this.loadRecentPayrolls();
  }

  createForm(): FormGroup {
    const currentDate = new Date();
    const currentYearMonth = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}`;
    
    return this.fb.group({
      payPeriod: [currentYearMonth, [Validators.required, Validators.pattern(/^\d{4}-\d{2}$/)]],
      employeeId: ['', Validators.required],
      remarks: ['']
    });
  }

  loadSalaryStructures(): void {
    this.payrollService.getSalaryStructures().subscribe({
      next: (structures) => {
        this.salaryStructures = structures.filter(s => s.status === 'ACTIVE');
      },
      error: (error) => {
        console.error('Error loading salary structures:', error);
      }
    });
  }

  loadRecentPayrolls(): void {
    const currentDate = new Date();
    const currentYearMonth = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}`;
    
    this.payrollService.getPayrollsByPeriod(currentYearMonth).subscribe({
      next: (payrolls) => {
        this.processedPayrolls = payrolls;
        this.calculateProcessedAmount();
      },
      error: (error) => {
        console.error('Error loading payrolls:', error);
      }
    });
  }

  calculateProcessedAmount(): void {
    this.totalProcessedAmount = this.processedPayrolls.reduce((sum, p) => sum + p.netSalary, 0);
  }

  onEmployeeSelect(): void {
    this.selectedEmployeeId = this.payrollForm.get('employeeId')?.value;
  }

  processPayroll(): void {
    if (this.payrollForm.valid) {
        this.isProcessing = true;
        const formData = this.payrollForm.value;

        console.log('🔄 Processing payroll for employee:', formData.employeeId, 'period:', formData.payPeriod);

        this.payrollService.processPayroll(formData.employeeId, formData.payPeriod).subscribe({
            next: (payroll) => {
                console.log('✅ Payroll processed successfully, payroll ID:', payroll.id);
                
                // ✅ AUTO-GENERATE PAYSLIP AFTER PAYROLL PROCESSING
                this.generatePayslipForPayroll(payroll.id!);
            },
            error: (error) => {
                this.isProcessing = false;
                console.error('❌ Full error details:', error);
                
                // Handle specific error types
                if (error.status === 409 || error.error?.error === 'DUPLICATE_PAYROLL') {
                    alert('Payroll already exists for this employee in the selected period!');
                } else if (error.status === 404 || error.error?.error === 'RESOURCE_NOT_FOUND') {
                    alert('Employee or salary structure not found. Please check the employee details.');
                } else if (error.status === 401) {
                    alert('Authentication failed. Please check your permissions.');
                } else {
                    alert('Error processing payroll: ' + (error.error?.message || error.message));
                }
            }
        });
    }
  }

  private generatePayslipForPayroll(payrollId: number): void {
    console.log('🔄 Auto-generating payslip for payroll:', payrollId);
    
    this.payrollService.generatePayslip(payrollId).subscribe({
      next: (payslip) => {
        this.isProcessing = false;
        console.log('✅ Payslip auto-generated successfully:', payslip.payslipCode);
        alert('Payroll processed and payslip generated successfully!');
        this.loadRecentPayrolls();
        this.payrollForm.reset();
        this.selectedEmployeeId = null;
        
        // Reset form to current period
        const currentDate = new Date();
        const currentYearMonth = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}`;
        this.payrollForm.patchValue({
          payPeriod: currentYearMonth
        });
      },
      error: (payslipError) => {
        this.isProcessing = false;
        console.error('❌ Error auto-generating payslip:', payslipError);
        
        // Handle specific payslip generation errors
        if (payslipError.status === 409 || payslipError.error?.error === 'PAYSLIP_ALREADY_EXISTS') {
          alert('Payroll processed successfully! (Payslip was already generated)');
        } else if (payslipError.status === 404) {
          alert('Payroll processed successfully! (Payslip generation failed - payroll not found)');
        } else {
          alert('Payroll processed successfully! Note: Payslip generation failed and needs to be done manually.');
        }
        
        this.loadRecentPayrolls();
        this.payrollForm.reset();
        this.selectedEmployeeId = null;
        
        // Reset form to current period
        const currentDate = new Date();
        const currentYearMonth = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}`;
        this.payrollForm.patchValue({
          payPeriod: currentYearMonth
        });
      }
    });
  }

  processBulkPayroll(): void {
    if (this.selectedEmployees.length === 0) {
      alert('Please select at least one employee');
      return;
    }

    const payPeriod = this.payrollForm.get('payPeriod')?.value;
    if (!payPeriod) {
      alert('Please select a pay period');
      return;
    }

    this.isProcessing = true;
    this.payrollService.processBulkPayroll(payPeriod, this.selectedEmployees).subscribe({
      next: (payrolls) => {
        console.log(`✅ Bulk payroll processed for ${payrolls.length} employees`);
        
        // ✅ AUTO-GENERATE PAYSLIPS FOR ALL PROCESSED PAYROLLS
        this.generatePayslipsForBulkPayroll(payrolls);
      },
      error: (error) => {
        this.isProcessing = false;
        console.error('Error processing bulk payroll:', error);
        alert('Error processing bulk payroll. Please try again.');
      }
    });
  }

  private generatePayslipsForBulkPayroll(payrolls: Payroll[]): void {
    let completed = 0;
    let successful = 0;
    let failed = 0;

    if (payrolls.length === 0) {
      this.isProcessing = false;
      alert('No payrolls were processed in bulk operation.');
      return;
    }

    console.log(`🔄 Auto-generating payslips for ${payrolls.length} payrolls`);

    payrolls.forEach(payroll => {
      this.payrollService.generatePayslip(payroll.id!).subscribe({
        next: (payslip) => {
          completed++;
          successful++;
          console.log(`✅ Payslip generated for payroll ${payroll.id}: ${payslip.payslipCode}`);
          
          this.checkBulkCompletion(completed, payrolls.length, successful, failed);
        },
        error: (error) => {
          completed++;
          failed++;
          console.error(`❌ Failed to generate payslip for payroll ${payroll.id}:`, error);
          
          this.checkBulkCompletion(completed, payrolls.length, successful, failed);
        }
      });
    });
  }

  private checkBulkCompletion(completed: number, total: number, successful: number, failed: number): void {
    if (completed === total) {
      this.isProcessing = false;
      this.loadRecentPayrolls();
      this.selectedEmployees = [];
      this.showBulkProcess = false;

      if (failed === 0) {
        alert(`✅ Successfully processed payroll and generated payslips for ${successful} employees!`);
      } else {
        alert(`⚠️ Payroll processed for ${total} employees. Payslips generated: ${successful}, Failed: ${failed}. Failed payslips need manual generation.`);
      }
    }
  }

  toggleEmployeeSelection(employeeId: number): void {
    const index = this.selectedEmployees.indexOf(employeeId);
    if (index > -1) {
      this.selectedEmployees.splice(index, 1);
    } else {
      this.selectedEmployees.push(employeeId);
    }
  }

  isEmployeeSelected(employeeId: number): boolean {
    return this.selectedEmployees.includes(employeeId);
  }

  getSelectedEmployee(): SalaryStructure | null {
    if (!this.selectedEmployeeId) return null;
    return this.salaryStructures.find(s => s.employeeId === this.selectedEmployeeId) || null;
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
      case 'PROCESSED': return 'badge bg-success';
      case 'PENDING': return 'badge bg-warning';
      case 'PAID': return 'badge bg-info';
      case 'CANCELLED': return 'badge bg-danger';
      default: return 'badge bg-secondary';
    }
  }
}