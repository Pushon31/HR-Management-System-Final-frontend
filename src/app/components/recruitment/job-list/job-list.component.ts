import { Component, OnInit } from '@angular/core';
import { RecruitmentService } from '../../../services/recruitment.service';
import { Job } from '../../../models/recruitment.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-job-list',
  templateUrl: './job-list.component.html',
  styleUrls: ['./job-list.component.scss']
})
export class JobListComponent implements OnInit {
  jobs: Job[] = [];
  filteredJobs: Job[] = [];
  searchTerm: string = '';
  statusFilter: string = 'ALL';
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(
    private recruitmentService: RecruitmentService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadJobs();
  }

  loadJobs(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    // ✅ FIX: Use existing getJobs method (not getAllJobs)
    this.recruitmentService.getJobs().subscribe({
      next: (jobs: Job[]) => {
        this.jobs = jobs;
        this.filteredJobs = jobs;
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading jobs:', error);
        
        // ✅ FIX: Better error handling
        if (error.status === 401) {
          this.errorMessage = 'Authentication failed. Please login again.';
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        } else if (error.status === 404) {
          this.errorMessage = 'Jobs endpoint not found. Please check backend configuration.';
          // Show empty state
          this.jobs = [];
          this.filteredJobs = [];
        } else {
          this.errorMessage = 'Failed to load jobs. Please try again later.';
        }
        
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    this.filteredJobs = this.jobs.filter(job => {
      const matchesSearch = job.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           job.department.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesStatus = this.statusFilter === 'ALL' || job.status === this.statusFilter;
      return matchesSearch && matchesStatus;
    });
  }

  deleteJob(id: number): void {
    if (confirm('Are you sure you want to delete this job?')) {
      this.recruitmentService.deleteJob(id).subscribe({
        next: () => {
          this.loadJobs();
        },
        error: (error: any) => {
          console.error('Error deleting job:', error);
          alert('Error deleting job. Please try again.');
        }
      });
    }
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'OPEN': return 'badge bg-success';
      case 'CLOSED': return 'badge bg-danger';
      case 'ON_HOLD': return 'badge bg-warning';
      default: return 'badge bg-secondary';
    }
  }

  // ✅ ADD: Clear search
  clearSearch(): void {
    this.searchTerm = '';
    this.applyFilters();
  }

  // ✅ ADD: Reset filters
  resetFilters(): void {
    this.searchTerm = '';
    this.statusFilter = 'ALL';
    this.applyFilters();
  }
}