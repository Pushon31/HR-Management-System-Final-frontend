import { Component, OnInit } from '@angular/core';
import { TaskService } from '../../../services/task.service'; // ✅ FIX: Use TaskService instead of ProjectService
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
    private taskService: TaskService, // ✅ FIX: Use TaskService
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects(): void {
    this.loading = true;
    this.error = '';
    
    // ✅ FIX: Use getAllProjects from TaskService
    this.taskService.getAllProjects().subscribe({
      next: (projects: Project[]) => {
        this.projects = projects;
        this.filteredProjects = projects;
        this.totalItems = projects.length;
        this.applyFilters();
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading projects:', error);
        
        // ✅ FIX: Better error handling
        if (error.status === 401) {
          this.error = 'Authentication failed. Please check your login.';
        } else if (error.status === 404) {
          this.error = 'Projects endpoint not available. Please check backend configuration.';
          // Initialize with empty array
          this.projects = [];
          this.filteredProjects = [];
        } else {
          this.error = 'Failed to load projects. Please try again later.';
        }
        
        this.loading = false;
      }
    });
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
      // ⚠️ NOTE: deleteProject doesn't exist in TaskService, so we'll remove this functionality
      // or you can add it to your TaskService if needed
      this.error = 'Delete project functionality not implemented yet.';
      console.warn('Delete project not implemented in TaskService');
    }
  }

  closeProject(projectId: number): void {
    if (confirm('Are you sure you want to close this project?')) {
      // ✅ FIX: Use closeProject from TaskService
      this.taskService.closeProject(projectId).subscribe({
        next: () => {
          this.loadProjects();
        },
        error: (error: any) => {
          this.error = 'Failed to close project: ' + (error.error?.message || 'Please try again.');
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
  
  // ✅ ADD: Check if user has required role
  canManageProjects(): boolean {
    return this.authService.hasRole('ROLE_ADMIN') || this.authService.hasRole('ROLE_MANAGER');
  }
}