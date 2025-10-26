import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PayrollService } from '../../../services/payroll.service';
import { Bonus, SalaryStructure } from '../../../models/payroll.model';

@Component({
  selector: 'app-bonus-management',
  templateUrl: './bonus-management.component.html',
  styleUrls: ['./bonus-management.component.scss']
})
export class BonusManagementComponent implements OnInit {
  bonuses: Bonus[] = [];
  filteredBonuses: Bonus[] = [];
  salaryStructures: SalaryStructure[] = [];
  bonusForm: FormGroup;
  showForm: boolean = false;
  isLoading: boolean = false;
  isSubmitting: boolean = false;
  searchTerm: string = '';
  statusFilter: string = 'ALL';
  typeFilter: string = 'ALL';

  // Calculated properties
  totalBonusAmount: number = 0;
  approvedBonusesCount: number = 0;
  festivalBonusAmount: number = 0;

  bonusTypes = ['Festival', 'Performance', 'Annual', 'Special', 'Other'];

  constructor(
    private fb: FormBuilder,
    private payrollService: PayrollService
  ) {
    this.bonusForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadBonuses();
    this.loadSalaryStructures();
  }

  createForm(): FormGroup {
    return this.fb.group({
      employeeId: ['', Validators.required],
      bonusType: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(1)]],
      bonusDate: [new Date().toISOString().split('T')[0], Validators.required],
      reason: ['', Validators.required],
      status: ['APPROVED', Validators.required]
    });
  }

  loadBonuses(): void {
    this.isLoading = true;
    
    // Load bonuses for current year
    const currentYear = new Date().getFullYear();
    const startDate = `${currentYear}-01-01`;
    const endDate = `${currentYear}-12-31`;
    
    this.payrollService.getBonusesByDateRange(startDate, endDate).subscribe({
      next: (bonuses) => {
        this.bonuses = bonuses;
        this.filteredBonuses = bonuses;
        this.calculateBonusStats();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading bonuses:', error);
        this.isLoading = false;
      }
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

  calculateBonusStats(): void {
    this.totalBonusAmount = this.filteredBonuses.reduce((sum, b) => sum + b.amount, 0);
    this.approvedBonusesCount = this.filteredBonuses.filter(b => b.status === 'APPROVED').length;
    this.festivalBonusAmount = this.filteredBonuses
      .filter(b => b.bonusType === 'Festival')
      .reduce((sum, b) => sum + b.amount, 0);
  }

  onSubmit(): void {
    if (this.bonusForm.valid) {
      this.isSubmitting = true;
      const bonusData: Bonus = this.bonusForm.value;

      this.payrollService.createBonus(bonusData).subscribe({
        next: (bonus) => {
          this.isSubmitting = false;
          alert('Bonus created successfully!');
          this.loadBonuses();
          this.bonusForm.reset();
          this.showForm = false;
        },
        error: (error) => {
          this.isSubmitting = false;
          console.error('Error creating bonus:', error);
          alert('Error creating bonus. Please try again.');
        }
      });
    }
  }

  applyFilters(): void {
    this.filteredBonuses = this.bonuses.filter(bonus => {
      const matchesSearch = bonus.employeeName?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           bonus.employeeCode?.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesStatus = this.statusFilter === 'ALL' || bonus.status === this.statusFilter;
      const matchesType = this.typeFilter === 'ALL' || bonus.bonusType === this.typeFilter;
      
      return matchesSearch && matchesStatus && matchesType;
    });
    this.calculateBonusStats();
  }

  deleteBonus(id: number): void {
    if (confirm('Are you sure you want to delete this bonus?')) {
      this.payrollService.deleteBonus(id).subscribe({
        next: () => {
          this.loadBonuses();
        },
        error: (error) => {
          console.error('Error deleting bonus:', error);
          alert('Error deleting bonus. Please try again.');
        }
      });
    }
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
      case 'APPROVED': return 'badge bg-success';
      case 'PENDING': return 'badge bg-warning';
      case 'PAID': return 'badge bg-info';
      case 'REJECTED': return 'badge bg-danger';
      default: return 'badge bg-secondary';
    }
  }

  getTypeBadgeClass(type: string): string {
    switch (type) {
      case 'Festival': return 'badge bg-primary';
      case 'Performance': return 'badge bg-success';
      case 'Annual': return 'badge bg-info';
      case 'Special': return 'badge bg-warning';
      default: return 'badge bg-secondary';
    }
  }

  getSelectedEmployeeName(): string {
    const employeeId = this.bonusForm.get('employeeId')?.value;
    if (!employeeId) return '';
    
    const employee = this.salaryStructures.find(s => s.employeeId === employeeId);
    return employee ? `${employee.employeeName} (${employee.employeeCode})` : '';
  }
}