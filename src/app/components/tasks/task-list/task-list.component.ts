// src/app/components/tasks/task-list/task-list.component.ts
import { Component, OnInit } from '@angular/core';
import { TaskService } from '../../../services/task.service';
import { EmployeeService } from '../../../services/employee.service';
import { AuthService } from '../../../services/auth.service';
import { Task, TaskStatus, TaskPriority } from '../../../models/task.model';
import { Employee } from '../../../models/employee.model';

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss']
})
export class TaskListComponent implements OnInit {
  tasks: Task[] = [];
  filteredTasks: Task[] = [];
  employees: Employee[] = [];
  loading = false;
  error = '';
  
  // Filters
  statusFilter: string = '';
  priorityFilter: string = '';
  assignedToFilter: number = 0;
  searchTerm: string = '';
  
  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;

  statuses = Object.values(TaskStatus);
  priorities = Object.values(TaskPriority);
  Math = Math;

  constructor(
    private taskService: TaskService,
    private employeeService: EmployeeService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadTasks();
    this.loadEmployees();
  }

  // Add these new methods for routing
  getCreateTaskRoute(): string {
    const currentUser = this.authService.getCurrentUser();
    
    if (this.authService.hasRole('ROLE_ADMIN')) {
      return '/admin/tasks/add';
    } else if (this.authService.hasRole('ROLE_MANAGER') || 
               this.authService.hasRole('ROLE_HR') || 
               this.authService.hasRole('ROLE_ACCOUNTANT')) {
      return '/manager/tasks/add';
    } else {
      return '/employee/tasks'; // Employees can't create tasks
    }
  }

  get canCreateTask(): boolean {
    return this.authService.hasRole('ROLE_ADMIN') || 
           this.authService.hasRole('ROLE_MANAGER') ||
           this.authService.hasRole('ROLE_HR') ||
           this.authService.hasRole('ROLE_ACCOUNTANT');
  }

  getTaskDetailsRoute(taskId: number): string {
    if (this.authService.hasRole('ROLE_ADMIN')) {
      return `/admin/tasks/edit/${taskId}`;
    } else if (this.authService.hasRole('ROLE_MANAGER') || 
               this.authService.hasRole('ROLE_HR') || 
               this.authService.hasRole('ROLE_ACCOUNTANT')) {
      return `/manager/tasks/edit/${taskId}`;
    } else {
      return `/employee/tasks`; // Employees might have view-only access
    }
  }

  getTaskEditRoute(taskId: number): string {
    if (this.authService.hasRole('ROLE_ADMIN')) {
      return `/admin/tasks/edit/${taskId}`;
    } else if (this.authService.hasRole('ROLE_MANAGER') || 
               this.authService.hasRole('ROLE_HR') || 
               this.authService.hasRole('ROLE_ACCOUNTANT')) {
      return `/manager/tasks/edit/${taskId}`;
    } else {
      return `/employee/tasks`; // Employees can't edit tasks
    }
  }

  getProgressBarClass(percentage: number): string {
    if (percentage >= 100) return 'bg-success';
    if (percentage >= 75) return 'bg-primary';
    if (percentage >= 50) return 'bg-info';
    if (percentage >= 25) return 'bg-warning';
    return 'bg-danger';
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  deleteTask(taskId: number): void {
    if (confirm('Are you sure you want to delete this task?')) {
      this.taskService.deleteTask(taskId).subscribe({
        next: () => {
          this.loadTasks();
        },
        error: (error) => {
          this.error = 'Failed to delete task';
        }
      });
    }
  }

  loadTasks(): void {
    this.loading = true;
    const currentUser = this.authService.getCurrentUser();
    
    if (this.authService.hasRole('ROLE_ADMIN')) {
      this.taskService.getAllTasks().subscribe({
        next: (tasks) => {
          this.tasks = tasks;
          this.filteredTasks = tasks;
          this.totalItems = tasks.length;
          this.applyFilters();
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Failed to load tasks';
          this.loading = false;
        }
      });
    } else if ((this.authService.hasRole('ROLE_MANAGER') || 
                this.authService.hasRole('ROLE_HR') || 
                this.authService.hasRole('ROLE_ACCOUNTANT')) && currentUser) {
      this.taskService.getMyTeamTasks(currentUser.id).subscribe({
        next: (tasks) => {
          this.tasks = tasks;
          this.filteredTasks = tasks;
          this.totalItems = tasks.length;
          this.applyFilters();
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Failed to load team tasks';
          this.loading = false;
        }
      });
    } else if (currentUser) {
      this.taskService.getTasksByEmployee(currentUser.id).subscribe({
        next: (tasks) => {
          this.tasks = tasks;
          this.filteredTasks = tasks;
          this.totalItems = tasks.length;
          this.applyFilters();
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Failed to load your tasks';
          this.loading = false;
        }
      });
    }
  }

  loadEmployees(): void {
    this.employeeService.getAllEmployees().subscribe({
      next: (employees) => {
        this.employees = employees;
      },
      error: (error) => {
        console.error('Failed to load employees', error);
      }
    });
  }

  applyFilters(): void {
    let filtered = this.tasks;

    if (this.statusFilter) {
      filtered = filtered.filter(task => task.status === this.statusFilter);
    }

    if (this.priorityFilter) {
      filtered = filtered.filter(task => task.priority === this.priorityFilter);
    }

    if (this.assignedToFilter) {
      filtered = filtered.filter(task => task.assignedToId === this.assignedToFilter);
    }

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(term) ||
        (task.description && task.description.toLowerCase().includes(term)) ||
        task.assignedToName.toLowerCase().includes(term)
      );
    }

    this.filteredTasks = filtered;
    this.totalItems = filtered.length;
    this.currentPage = 1;
  }

  clearFilters(): void {
    this.statusFilter = '';
    this.priorityFilter = '';
    this.assignedToFilter = 0;
    this.searchTerm = '';
    this.applyFilters();
  }

  getStatusClass(status: string): string {
    switch (status) {
      case TaskStatus.COMPLETED: return 'badge bg-success';
      case TaskStatus.IN_PROGRESS: return 'badge bg-primary';
      case TaskStatus.PENDING: return 'badge bg-warning';
      case TaskStatus.OVERDUE: return 'badge bg-danger';
      case TaskStatus.ON_HOLD: return 'badge bg-secondary';
      case TaskStatus.CANCELLED: return 'badge bg-dark';
      default: return 'badge bg-light text-dark';
    }
  }

  getPriorityClass(priority: string): string {
    switch (priority) {
      case TaskPriority.URGENT: return 'badge bg-danger';
      case TaskPriority.HIGH: return 'badge bg-warning';
      case TaskPriority.MEDIUM: return 'badge bg-info';
      case TaskPriority.LOW: return 'badge bg-secondary';
      default: return 'badge bg-light text-dark';
    }
  }

  get paginatedTasks(): Task[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredTasks.slice(startIndex, startIndex + this.itemsPerPage);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
  }

  get displayRange(): string {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage + 1;
    const endIndex = Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
    return `Showing ${startIndex} to ${endIndex} of ${this.totalItems} entries`;
  }

  // Helper method to check if user can delete tasks
  get canDeleteTask(): boolean {
    return this.authService.hasRole('ROLE_ADMIN') || 
           this.authService.hasRole('ROLE_MANAGER');
  }

  // Helper method to check if user can edit tasks
  get canEditTask(): boolean {
    return this.authService.hasRole('ROLE_ADMIN') || 
           this.authService.hasRole('ROLE_MANAGER') ||
           this.authService.hasRole('ROLE_HR') ||
           this.authService.hasRole('ROLE_ACCOUNTANT');
  }
}