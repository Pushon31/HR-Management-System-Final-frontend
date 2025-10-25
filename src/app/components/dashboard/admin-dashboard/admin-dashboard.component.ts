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
  workTypeStats: { type: string, count: number }[] = [];
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
    
    // Load employees
    this.employeeService.getAllEmployees().subscribe({
      next: (employees) => {
        this.stats.totalEmployees = employees.length;
        this.stats.activeEmployees = employees.filter(emp => emp.status === 'ACTIVE').length;
        this.recentEmployees = employees.slice(0, 5).sort((a, b) => 
          new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime()
        );
        this.loadDepartments();
      },
      error: (error) => {
        console.error('Error loading employees:', error);
        this.loading = false;
      }
    });

    // Load work type stats
    this.employeeService.getWorkTypeStats().subscribe({
      next: (stats) => {
        this.workTypeStats = Object.entries(stats).map(([type, count]) => ({
          type: this.formatWorkType(type),
          count: count
        }));
      },
      error: (error) => {
        console.error('Error loading work type stats:', error);
      }
    });
  }

  loadDepartments(): void {
    this.departmentService.getAllDepartments().subscribe({
      next: (departments) => {
        this.stats.totalDepartments = departments.length;
        this.departments = departments.slice(0, 5);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading departments:', error);
        this.loading = false;
      }
    });
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
}