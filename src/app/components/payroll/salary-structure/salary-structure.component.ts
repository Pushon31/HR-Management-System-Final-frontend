import { Component, OnInit } from '@angular/core';
import { PayrollService } from '../../../services/payroll.service';
import { SalaryStructure } from '../../../models/payroll.model';

@Component({
  selector: 'app-salary-structure',
  templateUrl: './salary-structure.component.html',
  styleUrls: ['./salary-structure.component.scss']
})
export class SalaryStructureComponent implements OnInit {
  salaryStructures: SalaryStructure[] = [];
  filteredStructures: SalaryStructure[] = [];
  searchTerm: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';

  // Calculated properties
  totalBasicSalary: number = 0;
  totalNetSalary: number = 0;
  activeStructuresCount: number = 0;
  filteredActiveCount: number = 0;

  constructor(private payrollService: PayrollService) {}

  ngOnInit(): void {
    this.loadSalaryStructures();
  }

  loadSalaryStructures(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.payrollService.getSalaryStructures().subscribe({
      next: (structures) => {
        this.salaryStructures = structures;
        this.filteredStructures = structures;
        this.calculateSalaryStats();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading salary structures:', error);
        this.errorMessage = 'Failed to load salary structures';
        this.isLoading = false;
      }
    });
  }

  calculateSalaryStats(): void {
    this.totalBasicSalary = this.salaryStructures.reduce((sum, s) => sum + s.basicSalary, 0);
    this.totalNetSalary = this.salaryStructures.reduce((sum, s) => sum + s.netSalary, 0);
    this.activeStructuresCount = this.salaryStructures.filter(s => s.status === 'ACTIVE').length;
    this.filteredActiveCount = this.filteredStructures.filter(s => s.status === 'ACTIVE').length;
  }

  applyFilters(): void {
    this.filteredStructures = this.salaryStructures.filter(structure => {
      return structure.employeeName?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
             structure.employeeCode?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
             structure.departmentName?.toLowerCase().includes(this.searchTerm.toLowerCase());
    });
    this.filteredActiveCount = this.filteredStructures.filter(s => s.status === 'ACTIVE').length;
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'ACTIVE': return 'badge bg-success';
      case 'INACTIVE': return 'badge bg-danger';
      default: return 'badge bg-secondary';
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 2
    }).format(amount);
  }
}