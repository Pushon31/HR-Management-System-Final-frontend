import { Component, OnInit } from '@angular/core';
import { RecruitmentService } from '../../../services/recruitment.service';
import { Candidate, Job } from '../../../models/recruitment.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-candidate-list',
  templateUrl: './candidate-list.component.html',
  styleUrls: ['./candidate-list.component.scss']
})
export class CandidateListComponent implements OnInit {
  candidates: Candidate[] = [];
  filteredCandidates: Candidate[] = [];
  jobs: Job[] = [];
  searchTerm: string = '';
  statusFilter: string = 'ALL';
  jobFilter: string = 'ALL';
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(
    private recruitmentService: RecruitmentService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCandidates();
    this.loadJobs();
  }

  loadCandidates(): void {
    this.isLoading = true;
    this.recruitmentService.getCandidates().subscribe({
      next: (candidates: Candidate[]) => {
        this.candidates = candidates;
        this.filteredCandidates = candidates;
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading candidates:', error);
        this.errorMessage = 'Failed to load candidates';
        this.isLoading = false;
      }
    });
  }

  loadJobs(): void {
    this.recruitmentService.getJobs().subscribe({
      next: (jobs: Job[]) => {
        this.jobs = jobs;
      },
      error: (error: any) => {
        console.error('Error loading jobs:', error);
      }
    });
  }

  applyFilters(): void {
    this.filteredCandidates = this.candidates.filter(candidate => {
      const matchesSearch = 
        candidate.firstName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        candidate.lastName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        candidate.email.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesStatus = this.statusFilter === 'ALL' || candidate.status === this.statusFilter;
      
      const matchesJob = this.jobFilter === 'ALL' || candidate.jobId.toString() === this.jobFilter;
      
      return matchesSearch && matchesStatus && matchesJob;
    });
  }

  getJobTitle(jobId: number): string {
    const job = this.jobs.find(j => j.id === jobId);
    return job ? job.jobTitle : 'Unknown Job';
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'APPLIED': return 'badge bg-primary';
      case 'SHORTLISTED': return 'badge bg-info';
      case 'REJECTED': return 'badge bg-danger';
      case 'SELECTED': return 'badge bg-success';
      case 'INTERVIEW_SCHEDULED': return 'badge bg-warning';
      case 'HIRED': return 'badge bg-success';
      default: return 'badge bg-secondary';
    }
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.statusFilter = 'ALL';
    this.jobFilter = 'ALL';
    this.applyFilters();
  }

  updateStatus(candidateId: number, status: string): void {
    if (confirm(`Are you sure you want to change candidate status to ${status}?`)) {
      this.recruitmentService.updateCandidateStatus(candidateId, status).subscribe({
        next: (updatedCandidate) => {
          console.log('Candidate status updated:', updatedCandidate);
          this.loadCandidates();
        },
        error: (error) => {
          console.error('Error updating candidate status:', error);
          alert('Failed to update candidate status');
        }
      });
    }
  }

  deleteCandidate(candidateId: number): void {
    if (confirm('Are you sure you want to delete this candidate? This action cannot be undone.')) {
      this.recruitmentService.updateCandidateStatus(candidateId, 'REJECTED').subscribe({
        next: () => {
          console.log('Candidate marked as rejected');
          this.loadCandidates();
        },
        error: (error) => {
          console.error('Error updating candidate:', error);
          alert('Failed to update candidate');
        }
      });
    }
  }
}