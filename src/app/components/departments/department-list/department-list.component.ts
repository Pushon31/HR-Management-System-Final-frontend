import { Component, OnInit } from '@angular/core';
import { DepartmentService } from '../../../services/department.service';
import { Department, DepartmentStatus } from '../../../models/department.model';

@Component({
  selector: 'app-department-list',
  templateUrl: './department-list.component.html',
  styleUrls: ['./department-list.component.scss']
})
export class DepartmentListComponent implements OnInit {
  departments: Department[] = [];
  filteredDepartments: Department[] = [];
  loading = true;
  searchTerm = '';
  statusFilter: DepartmentStatus | 'ALL' = 'ALL';

  // Status options for filter
  statusOptions = [
    { value: 'ALL', label: 'All Status' },
    { value: 'ACTIVE', label: 'Active' },
    { value: 'INACTIVE', label: 'Inactive' },
    { value: 'SUSPENDED', label: 'Suspended' }
  ];

  // Computed properties for template
  activeDepartmentsCount = 0;
  totalEmployeesCount = 0;
  averageEmployeesPerDept = 0;

  constructor(private departmentService: DepartmentService) {}

  ngOnInit(): void {
    this.loadDepartments();
  }

  loadDepartments(): void {
    this.loading = true;
    this.departmentService.getAllDepartments().subscribe({
      next: (departments) => {
        this.departments = departments;
        this.filteredDepartments = departments;
        this.calculateStats();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading departments:', error);
        this.loading = false;
        alert('Error loading departments. Please try again.');
      }
    });
  }

  // Calculate statistics for the template
  private calculateStats(): void {
    // Active departments count
    this.activeDepartmentsCount = this.departments.filter(d => d.status === 'ACTIVE').length;
    
    // Total employees count
    this.totalEmployeesCount = this.departments.reduce((total, dept) => total + (dept.employeeCount || 0), 0);
    
    // Average employees per department
    this.averageEmployeesPerDept = this.departments.length > 0 
      ? Number((this.totalEmployeesCount / this.departments.length).toFixed(1))
      : 0;
  }

  applyFilters(): void {
    this.filteredDepartments = this.departments.filter(department => {
      const matchesSearch = 
        department.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        department.code.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        department.location?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        department.departmentHeadName?.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesStatus = this.statusFilter === 'ALL' || department.status === this.statusFilter;

      return matchesSearch && matchesStatus;
    });
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onStatusChange(): void {
    this.applyFilters();
  }

  deleteDepartment(id: number): void {
    if (confirm('Are you sure you want to delete this department? This action cannot be undone.')) {
      this.departmentService.deleteDepartment(id).subscribe({
        next: () => {
          this.departments = this.departments.filter(dept => dept.id !== id);
          this.calculateStats(); // Recalculate stats after deletion
          this.applyFilters();
          alert('Department deleted successfully!');
        },
        error: (error) => {
          console.error('Error deleting department:', error);
          alert('Error deleting department. Please try again.');
        }
      });
    }
  }

  getStatusBadgeClass(status: DepartmentStatus): string {
    const statusClasses: { [key: string]: string } = {
      'ACTIVE': 'bg-success',
      'INACTIVE': 'bg-secondary',
      'SUSPENDED': 'bg-warning'
    };
    return statusClasses[status] || 'bg-secondary';
  }

  getEmployeeCountBadgeClass(count: number): string {
    if (count === 0) return 'bg-danger';
    if (count < 10) return 'bg-warning';
    return 'bg-success';
  }

  formatBudget(budget: number): string {
    if (!budget) return 'Not set';
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0
    }).format(budget);
  }
}