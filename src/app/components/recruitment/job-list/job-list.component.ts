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
    console.log('🔄 JobListComponent initialized - testing connection...');
    this.testBackendConnection();
    this.loadJobs();
  }

  // ✅ ADD: Test backend connection
  testBackendConnection(): void {
    console.log('🔧 Testing backend connection...');
    console.log('📝 Current token:', localStorage.getItem('token'));
    
    // Test if user has required roles
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    console.log('👤 Current user roles:', user.roles);
  }

  loadJobs(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    console.log('📡 Calling recruitmentService.getJobs()...');
    
    this.recruitmentService.getJobs().subscribe({
      next: (jobs: Job[]) => {
        console.log('✅ Jobs loaded successfully:', jobs);
        this.jobs = jobs;
        this.filteredJobs = jobs;
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('❌ Error loading jobs:', error);
        
        // Detailed error analysis
        if (error.status === 401) {
          this.errorMessage = 'Authentication failed. Please login again.';
          console.error('🔐 Token might be invalid or expired');
          console.log('💡 Check if token exists in localStorage');
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 3000);
        } else if (error.status === 404) {
          this.errorMessage = 'Jobs endpoint not found (404). Please check backend configuration.';
          console.error('🔍 Backend might not be running or endpoint changed');
          console.log('💡 Expected: GET http://localhost:8080/api/recruitment/job-postings');
          this.jobs = [];
          this.filteredJobs = [];
        } else if (error.status === 403) {
          this.errorMessage = 'Access forbidden. You do not have permission to view jobs.';
          console.error('🚫 User lacks required roles (HR, ADMIN, MANAGER)');
        } else if (error.status === 0) {
          this.errorMessage = 'Cannot connect to backend server. Please check if server is running.';
          console.error('🌐 Backend server might be down');
        } else {
          this.errorMessage = `Failed to load jobs: ${error.message || 'Unknown error'}`;
          console.error('💥 Unknown error:', error);
        }
        
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    this.filteredJobs = this.jobs.filter(job => {
      const matchesSearch = job.jobTitle.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           job.department.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           (job.jobCode && job.jobCode.toLowerCase().includes(this.searchTerm.toLowerCase()));
      const matchesStatus = this.statusFilter === 'ALL' || job.status === this.statusFilter;
      return matchesSearch && matchesStatus;
    });
  }

  deleteJob(id: number): void {
    if (confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
      this.recruitmentService.deleteJob(id).subscribe({
        next: () => {
          console.log('✅ Job deleted successfully');
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

  // ✅ ADD: View job details
  viewJobDetails(id: number): void {
    this.router.navigate(['/admin/recruitment/jobs', id]);
  }

  // ✅ ADD: Edit job
  editJob(id: number): void {
    this.router.navigate(['/admin/recruitment/jobs/edit', id]);
  }

  // ✅ ADD: Format date for display
  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return 'Invalid Date';
    }
  }

  // ✅ ADD: Check if job is active
  isJobActive(job: Job): boolean {
    if (job.status !== 'OPEN') return false;
    if (!job.applicationDeadline) return true;
    
    try {
      return new Date(job.applicationDeadline) > new Date();
    } catch (e) {
      return true;
    }
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.applyFilters();
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.statusFilter = 'ALL';
    this.applyFilters();
  }
}