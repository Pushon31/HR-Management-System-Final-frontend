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

      this.payrollService.processPayroll(formData.employeeId, formData.payPeriod).subscribe({
        next: (payroll) => {
          this.isProcessing = false;
          alert('Payroll processed successfully!');
          this.loadRecentPayrolls();
          this.payrollForm.reset();
          this.selectedEmployeeId = null;
        },
        error: (error) => {
          this.isProcessing = false;
          console.error('Error processing payroll:', error);
          alert('Error processing payroll. Please try again.');
        }
      });
    }
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
        this.isProcessing = false;
        alert(`Successfully processed payroll for ${payrolls.length} employees`);
        this.loadRecentPayrolls();
        this.selectedEmployees = [];
        this.showBulkProcess = false;
      },
      error: (error) => {
        this.isProcessing = false;
        console.error('Error processing bulk payroll:', error);
        alert('Error processing bulk payroll. Please try again.');
      }
    });
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