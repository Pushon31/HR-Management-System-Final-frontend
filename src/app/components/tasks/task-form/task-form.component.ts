// src/app/components/tasks/task-form/task-form.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TaskService } from '../../../services/task.service';
import { EmployeeService } from '../../../services/employee.service';
import { ProjectService } from '../../../services/project.service';
import { AuthService } from '../../../services/auth.service';
import { Task, TaskPriority, TaskStatus } from '../../../models/task.model';
import { Employee } from '../../../models/employee.model';
import { Project } from '../../../models/project.model';

@Component({
  selector: 'app-task-form',
  templateUrl: './task-form.component.html',
  styleUrls: ['./task-form.component.scss']
})
export class TaskFormComponent implements OnInit {
  taskForm: FormGroup;
  isEdit = false;
  taskId: number | null = null;
  loading = false;
  submitting = false;
  error = '';

  employees: Employee[] = [];
  projects: Project[] = [];
  priorities = Object.values(TaskPriority);
  statuses = Object.values(TaskStatus);

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private taskService: TaskService,
    private employeeService: EmployeeService,
    private projectService: ProjectService,
    private authService: AuthService
  ) {
    this.taskForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadEmployees();
    this.loadProjects();
    
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEdit = true;
        this.taskId = +params['id'];
        this.loadTask(this.taskId);
      } else {
        // Set default start date to today for new tasks
        this.taskForm.patchValue({
          startDate: this.formatDateForInput(new Date().toISOString())
        });
      }
    });
  }

  createForm(): FormGroup {
    const currentUser = this.authService.getCurrentUser();
    return this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
      description: ['', [Validators.required]],
      assignedToId: ['', [Validators.required]],
      projectId: [''],
      priority: [TaskPriority.MEDIUM, [Validators.required]],
      status: [TaskStatus.PENDING, [Validators.required]],
      dueDate: ['', [Validators.required]],
      startDate: [''],
      estimatedHours: [0, [Validators.min(0), Validators.max(1000)]],
      actualHours: [0, [Validators.min(0), Validators.max(1000)]],
      tags: [''],
      isUrgent: [false],
      completionPercentage: [0, [Validators.min(0), Validators.max(100)]]
    });
  }

  loadTask(id: number): void {
    this.loading = true;
    this.taskService.getTaskById(id).subscribe({
      next: (task) => {
        this.taskForm.patchValue({
          ...task,
          dueDate: this.formatDateForInput(task.dueDate),
          startDate: this.formatDateForInput(task.startDate),
          completedDate: this.formatDateForInput(task.completedDate)
        });
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load task';
        this.loading = false;
        console.error('Error loading task:', error);
      }
    });
  }

  loadEmployees(): void {
    this.employeeService.getAllEmployees().subscribe({
      next: (employees) => {
        this.employees = employees;
      },
      error: (error) => {
        console.error('Failed to load employees', error);
        this.error = 'Failed to load employees list';
      }
    });
  }

  loadProjects(): void {
    this.projectService.getAllProjects().subscribe({
      next: (projects) => {
        this.projects = projects;
      },
      error: (error) => {
        console.error('Failed to load projects', error);
        // Don't show error for projects as they are optional
      }
    });
  }

  formatDateForInput(dateString: string): string {
    if (!dateString) return '';
    return new Date(dateString).toISOString().split('T')[0];
  }

  onSubmit(): void {
    if (this.taskForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.submitting = true;
    const formValue = this.taskForm.value;
    const currentUser = this.authService.getCurrentUser();

    const taskData: any = {
      ...formValue,
      assignedById: currentUser?.id || 1, // Fallback to admin if no user
      estimatedHours: +formValue.estimatedHours,
      actualHours: +formValue.actualHours,
      completionPercentage: +formValue.completionPercentage
    };

    // Remove empty projectId
    if (!taskData.projectId) {
      delete taskData.projectId;
    }

    console.log('Submitting task data:', taskData);

    if (this.isEdit && this.taskId) {
      this.taskService.updateTask(this.taskId, taskData).subscribe({
        next: (task) => {
          this.submitting = false;
          this.router.navigate(['/tasks', task.id]);
        },
        error: (error) => {
          this.error = 'Failed to update task: ' + (error.error?.message || error.message);
          this.submitting = false;
          console.error('Error updating task:', error);
        }
      });
    } else {
      this.taskService.createTask(taskData).subscribe({
        next: (task) => {
          this.submitting = false;
          this.router.navigate(['/tasks']);
        },
        error: (error) => {
          this.error = 'Failed to create task: ' + (error.error?.message || error.message);
          this.submitting = false;
          console.error('Error creating task:', error);
        }
      });
    }
  }

  markFormGroupTouched(): void {
    Object.keys(this.taskForm.controls).forEach(key => {
      const control = this.taskForm.get(key);
      control?.markAsTouched();
    });
  }

  onStatusChange(): void {
    const status = this.taskForm.get('status')?.value;
    const completionPercentage = this.taskForm.get('completionPercentage')?.value;

    // Auto-set completion percentage based on status
    if (status === TaskStatus.COMPLETED && completionPercentage !== 100) {
      this.taskForm.patchValue({ completionPercentage: 100 });
    } else if (status === TaskStatus.IN_PROGRESS && completionPercentage < 50) {
      this.taskForm.patchValue({ completionPercentage: 50 });
    } else if (status === TaskStatus.PENDING && completionPercentage > 0) {
      this.taskForm.patchValue({ completionPercentage: 0 });
    }
  }

  onCompletionChange(): void {
    const completionPercentage = this.taskForm.get('completionPercentage')?.value;
    const status = this.taskForm.get('status')?.value;

    // Auto-update status based on completion percentage
    if (completionPercentage === 100 && status !== TaskStatus.COMPLETED) {
      this.taskForm.patchValue({ status: TaskStatus.COMPLETED });
    } else if (completionPercentage > 0 && completionPercentage < 100 && status !== TaskStatus.IN_PROGRESS) {
      this.taskForm.patchValue({ status: TaskStatus.IN_PROGRESS });
    } else if (completionPercentage === 0 && status !== TaskStatus.PENDING) {
      this.taskForm.patchValue({ status: TaskStatus.PENDING });
    }
  }

  validateDates(): void {
    const startDate = this.taskForm.get('startDate')?.value;
    const dueDate = this.taskForm.get('dueDate')?.value;

    if (startDate && dueDate) {
      const start = new Date(startDate);
      const due = new Date(dueDate);

      if (due < start) {
        this.taskForm.get('dueDate')?.setErrors({ dateRange: true });
      }
    }
  }

  get f() {
    return this.taskForm.controls;
  }

  onCancel(): void {
    this.router.navigate(['/tasks']);
  }

  // Helper method to get employee name by ID
  getEmployeeName(employeeId: number): string {
    const employee = this.employees.find(emp => emp.id === employeeId);
    return employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown';
  }

  // Helper method to get project name by ID
  getProjectName(projectId: number): string {
    const project = this.projects.find(proj => proj.id === projectId);
    return project ? project.name : 'No Project';
  }

  getCompletionBadgeClass(percentage: number): string {
    if (percentage >= 100) return 'bg-success';
    if (percentage >= 75) return 'bg-primary';
    if (percentage >= 50) return 'bg-info';
    if (percentage >= 25) return 'bg-warning';
    return 'bg-danger';
  }

  getPriorityBadgeClass(priority: string): string {
    switch (priority) {
      case TaskPriority.URGENT: return 'badge bg-danger';
      case TaskPriority.HIGH: return 'badge bg-warning';
      case TaskPriority.MEDIUM: return 'badge bg-info';
      case TaskPriority.LOW: return 'badge bg-secondary';
      default: return 'badge bg-light text-dark';
    }
  }

  getStatusBadgeClass(status: string): string {
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
}