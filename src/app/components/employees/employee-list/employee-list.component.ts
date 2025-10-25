import { Component, OnInit } from '@angular/core';
import { EmployeeService } from '../../../services/employee.service';
import { Employee, EmployeeStatus } from '../../../models/employee.model';

@Component({
  selector: 'app-employee-list',
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.scss']
})
export class EmployeeListComponent implements OnInit {
  employees: Employee[] = [];
  filteredEmployees: Employee[] = [];
  loading = true;
  searchTerm = '';
  statusFilter: EmployeeStatus | 'ALL' = 'ALL';

  // Status options for filter
  statusOptions = [
    { value: 'ALL', label: 'All Status' },
    { value: 'ACTIVE', label: 'Active' },
    { value: 'INACTIVE', label: 'Inactive' },
    { value: 'TERMINATED', label: 'Terminated' },
    { value: 'SUSPENDED', label: 'Suspended' },
    { value: 'ON_LEAVE', label: 'On Leave' }
  ];

  constructor(private employeeService: EmployeeService) {}

  ngOnInit(): void {
    this.loadEmployees();
  }

  loadEmployees(): void {
    this.loading = true;
    this.employeeService.getAllEmployees().subscribe({
      next: (employees) => {
        this.employees = employees;
        this.filteredEmployees = employees;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading employees:', error);
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    this.filteredEmployees = this.employees.filter(employee => {
      const matchesSearch = 
        employee.firstName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        employee.lastName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        employee.employeeId.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        employee.designation?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        employee.departmentName?.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesStatus = this.statusFilter === 'ALL' || employee.status === this.statusFilter;

      return matchesSearch && matchesStatus;
    });
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onStatusChange(): void {
    this.applyFilters();
  }

  deleteEmployee(id: number): void {
    if (confirm('Are you sure you want to delete this employee?')) {
      this.employeeService.deleteEmployee(id).subscribe({
        next: () => {
          this.employees = this.employees.filter(emp => emp.id !== id);
          this.applyFilters();
        },
        error: (error) => {
          console.error('Error deleting employee:', error);
          alert('Error deleting employee. Please try again.');
        }
      });
    }
  }

  getStatusBadgeClass(status: EmployeeStatus): string {
    const statusClasses: { [key: string]: string } = {
      'ACTIVE': 'bg-success',
      'INACTIVE': 'bg-secondary',
      'TERMINATED': 'bg-danger',
      'SUSPENDED': 'bg-warning',
      'ON_LEAVE': 'bg-info'
    };
    return statusClasses[status] || 'bg-secondary';
  }
}