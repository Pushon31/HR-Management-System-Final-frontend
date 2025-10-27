// src/app/components/tasks/project-form/project-form.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectService } from '../../../services/project.service';
import { EmployeeService } from '../../../services/employee.service';
import { DepartmentService } from '../../../services/department.service';
import { AuthService } from '../../../services/auth.service';
import { Project, ProjectStatus } from '../../../models/project.model';
import { Employee } from '../../../models/employee.model';
import { Department } from '../../../models/department.model';

@Component({
  selector: 'app-project-form',
  templateUrl: './project-form.component.html',
  styleUrls: ['./project-form.component.scss']
})
export class ProjectFormComponent implements OnInit {
  projectForm: FormGroup;
  isEdit = false;
  projectId: number | null = null;
  loading = false;
  submitting = false;
  error = '';

  employees: Employee[] = [];
  departments: Department[] = [];
  statuses = Object.values(ProjectStatus);

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService,
    private employeeService: EmployeeService,
    private departmentService: DepartmentService,
    private authService: AuthService
  ) {
    this.projectForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadEmployees();
    this.loadDepartments();
    
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEdit = true;
        this.projectId = +params['id'];
        this.loadProject(this.projectId);
      }
    });
  }

  createForm(): FormGroup {
    const currentUser = this.authService.getCurrentUser();
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      code: ['', [Validators.required, Validators.pattern(/^[A-Z0-9_-]+$/)]],
      description: ['', [Validators.required]],
      startDate: ['', [Validators.required]],
      endDate: ['', [Validators.required]],
      budget: [0, [Validators.min(0)]],
      departmentId: ['', [Validators.required]],
      projectManagerId: [''],
      status: [ProjectStatus.PLANNING, [Validators.required]]
    });
  }

  loadProject(id: number): void {
    this.loading = true;
    this.projectService.getProjectById(id).subscribe({
      next: (project) => {
        this.projectForm.patchValue({
          ...project,
          startDate: this.formatDateForInput(project.startDate),
          endDate: this.formatDateForInput(project.endDate)
        });
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load project';
        this.loading = false;
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
      }
    });
  }

  loadDepartments(): void {
    this.departmentService.getAllDepartments().subscribe({
      next: (departments) => {
        this.departments = departments;
      },
      error: (error) => {
        console.error('Failed to load departments', error);
      }
    });
  }

  formatDateForInput(dateString: string): string {
    if (!dateString) return '';
    return new Date(dateString).toISOString().split('T')[0];
  }

  onSubmit(): void {
    if (this.projectForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.submitting = true;
    const formValue = this.projectForm.value;

    const projectData: Project = {
      ...formValue,
      budget: +formValue.budget
    };

    if (this.isEdit && this.projectId) {
      this.projectService.updateProject(this.projectId, projectData).subscribe({
        next: (project) => {
          this.submitting = false;
          this.router.navigate(['/projects', project.id]);
        },
        error: (error) => {
          this.error = 'Failed to update project';
          this.submitting = false;
        }
      });
    } else {
      this.projectService.createProject(projectData).subscribe({
        next: (project) => {
          this.submitting = false;
          this.router.navigate(['/projects']);
        },
        error: (error) => {
          this.error = 'Failed to create project';
          this.submitting = false;
        }
      });
    }
  }

  markFormGroupTouched(): void {
    Object.keys(this.projectForm.controls).forEach(key => {
      this.projectForm.get(key)?.markAsTouched();
    });
  }

  get f() {
    return this.projectForm.controls;
  }

  onCancel(): void {
    this.router.navigate(['/projects']);
  }

  validateDates(): void {
    const startDate = this.projectForm.get('startDate')?.value;
    const endDate = this.projectForm.get('endDate')?.value;

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (end < start) {
        this.projectForm.get('endDate')?.setErrors({ dateRange: true });
      }
    }
  }

  calculateDuration(): number {
    const startDate = this.projectForm.get('startDate')?.value;
    const endDate = this.projectForm.get('endDate')?.value;
    
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    return 0;
  }

  getDepartmentName(departmentId: number): string {
    const department = this.departments.find(d => d.id === departmentId);
    return department ? department.name : '';
  }
}