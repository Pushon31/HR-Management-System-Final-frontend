// src/app/components/tasks/project-list/project-list.component.ts
import { Component, OnInit } from '@angular/core';
import { ProjectService } from '../../../services/project.service';
import { AuthService } from '../../../services/auth.service';
import { Project, ProjectStatus } from '../../../models/project.model';

@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.scss']
})
export class ProjectListComponent implements OnInit {
  projects: Project[] = [];
  filteredProjects: Project[] = [];
  loading = false;
  error = '';
  
  // Filters
  statusFilter: string = '';
  searchTerm: string = '';
  
  // Pagination
  currentPage = 1;
  itemsPerPage = 8;
  totalItems = 0;

  statuses = Object.values(ProjectStatus);
  Math = Math;

  constructor(
    private projectService: ProjectService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects(): void {
    this.loading = true;
    const currentUser = this.authService.getCurrentUser();
    
    if (this.authService.hasRole('ROLE_ADMIN')) {
      this.projectService.getAllProjects().subscribe({
        next: (projects) => {
          this.projects = projects;
          this.filteredProjects = projects;
          this.totalItems = projects.length;
          this.applyFilters();
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Failed to load projects';
          this.loading = false;
        }
      });
    } else if (this.authService.hasRole('ROLE_MANAGER') && currentUser) {
      const managerDepartmentId = 1; // This should come from user profile
      this.projectService.getProjectsByDepartment(managerDepartmentId).subscribe({
        next: (projects) => {
          this.projects = projects;
          this.filteredProjects = projects;
          this.totalItems = projects.length;
          this.applyFilters();
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Failed to load projects';
          this.loading = false;
        }
      });
    } else {
      this.projects = [];
      this.filteredProjects = [];
      this.loading = false;
    }
  }

  applyFilters(): void {
    let filtered = this.projects;

    if (this.statusFilter) {
      filtered = filtered.filter(project => project.status === this.statusFilter);
    }

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(project => 
        project.name.toLowerCase().includes(term) ||
        project.code.toLowerCase().includes(term) ||
        (project.description && project.description.toLowerCase().includes(term))
      );
    }

    this.filteredProjects = filtered;
    this.totalItems = filtered.length;
    this.currentPage = 1;
  }

  clearFilters(): void {
    this.statusFilter = '';
    this.searchTerm = '';
    this.applyFilters();
  }

  getStatusClass(status: string): string {
    switch (status) {
      case ProjectStatus.COMPLETED: return 'badge bg-success';
      case ProjectStatus.IN_PROGRESS: return 'badge bg-primary';
      case ProjectStatus.PLANNING: return 'badge bg-info';
      case ProjectStatus.ON_HOLD: return 'badge bg-warning';
      case ProjectStatus.CANCELLED: return 'badge bg-danger';
      default: return 'badge bg-light text-dark';
    }
  }

  getCompletionRateClass(rate: number): string {
    if (rate >= 90) return 'text-success';
    if (rate >= 70) return 'text-primary';
    if (rate >= 50) return 'text-warning';
    return 'text-danger';
  }

  deleteProject(projectId: number): void {
    if (confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      this.projectService.deleteProject(projectId).subscribe({
        next: () => {
          this.loadProjects();
        },
        error: (error) => {
          this.error = 'Failed to delete project';
        }
      });
    }
  }

  closeProject(projectId: number): void {
    if (confirm('Are you sure you want to close this project?')) {
      this.projectService.closeProject(projectId).subscribe({
        next: () => {
          this.loadProjects();
        },
        error: (error) => {
          this.error = 'Failed to close project';
        }
      });
    }
  }

  get paginatedProjects(): Project[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredProjects.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
  }

  get displayRange(): string {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage + 1;
    const endIndex = Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
    return `Showing ${startIndex} to ${endIndex} of ${this.totalItems} entries`;
  }
  
}