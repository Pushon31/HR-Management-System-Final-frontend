import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { EmployeeService } from '../../../services/employee.service';
import { DepartmentService } from '../../../services/department.service';
import { Employee, EmployeeWorkType } from '../../../models/employee.model';
import { Department } from '../../../models/department.model';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  currentUser: any;
  stats = {
    totalEmployees: 0,
    totalDepartments: 0,
    activeEmployees: 0,
    todayAttendance: 0
  };

  recentEmployees: Employee[] = [];
  departments: Department[] = [];
  workTypeStats: { type: string, count: number, percentage: number }[] = [];
  loading = true;

  constructor(
    private authService: AuthService,
    private employeeService: EmployeeService,
    private departmentService: DepartmentService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;
    
    // Load employees first
    this.employeeService.getAllEmployees().subscribe({
      next: (employees: Employee[]) => {
        this.processEmployeeData(employees);
        this.loadDepartments();
      },
      error: (error: any) => {
        console.error('Error loading employees:', error);
        this.loading = false;
      }
    });

    // Load work type stats
    this.loadWorkTypeStats();
  }

  processEmployeeData(employees: Employee[]): void {
    this.stats.totalEmployees = employees.length;
    this.stats.activeEmployees = employees.filter(emp => 
      emp.status === 'ACTIVE' || emp.status === 'ON_LEAVE'
    ).length;
    
    // Get recent employees (sorted by join date, newest first)
    this.recentEmployees = employees
      .sort((a, b) => new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime())
      .slice(0, 5);
  }

  loadDepartments(): void {
    this.departmentService.getAllDepartments().subscribe({
      next: (departments: Department[]) => {
        this.stats.totalDepartments = departments.length;
        this.departments = departments.slice(0, 5);
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading departments:', error);
        this.loading = false;
      }
    });
  }

  loadWorkTypeStats(): void {
    this.employeeService.getWorkTypeStats().subscribe({
      next: (stats: any) => {  // Changed from Map<EmployeeWorkType, number> to any
        this.processWorkTypeStats(stats);
      },
      error: (error: any) => {
        console.error('Error loading work type stats:', error);
        // Set default empty stats
        this.workTypeStats = [
          { type: 'On Site', count: 0, percentage: 0 },
          { type: 'Remote', count: 0, percentage: 0 },
          { type: 'Hybrid', count: 0, percentage: 0 }
        ];
      }
    });
  }

  processWorkTypeStats(stats: any): void {
    try {
      // ✅ FIX: Handle both Map and plain object
      let values: number[];
      let entries: [string, number][];

      if (stats instanceof Map) {
        // If it's a Map (unlikely in HTTP response)
        values = Array.from(stats.values());
        entries = Array.from(stats.entries());
      } else {
        // If it's a plain object (most common case)
        values = Object.values(stats);
        entries = Object.entries(stats);
      }

      const total = values.reduce((sum, count) => sum + count, 0);
      
      this.workTypeStats = entries.map(([type, count]) => ({
        type: this.formatWorkType(type),
        count: count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0
      }));
    } catch (error) {
      console.error('Error processing work type stats:', error);
      this.workTypeStats = [
        { type: 'On Site', count: 0, percentage: 0 },
        { type: 'Remote', count: 0, percentage: 0 },
        { type: 'Hybrid', count: 0, percentage: 0 }
      ];
    }
  }

  formatWorkType(workType: string): string {
    const types: { [key: string]: string } = {
      'ONSITE': 'On Site',
      'REMOTE': 'Remote', 
      'HYBRID': 'Hybrid'
    };
    return types[workType] || workType;
  }

  getDepartmentEmployeeCount(departmentId: number): number {
    const department = this.departments.find(dept => dept.id === departmentId);
    return department?.employeeCount || 0;
  }

  // Calculate card background color based on status
  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'ACTIVE': return 'bg-success';
      case 'ON_LEAVE': return 'bg-warning';
      case 'INACTIVE': return 'bg-secondary';
      case 'TERMINATED': return 'bg-danger';
      case 'SUSPENDED': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }

  // Format date for display
  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  }

  // Get initials for avatar
  getInitials(employee: Employee): string {
    return `${employee.firstName.charAt(0)}${employee.lastName.charAt(0)}`.toUpperCase();
  }
}