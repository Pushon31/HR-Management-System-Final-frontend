import { Component, OnInit } from '@angular/core';
import { RecruitmentService } from '../../../services/recruitment.service';
import { Candidate, Job } from '../../../models/recruitment.model';

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

  constructor(private recruitmentService: RecruitmentService) {}

  ngOnInit(): void {
    this.loadCandidates();
    this.loadJobs();
  }

  loadCandidates(): void {
    this.recruitmentService.getCandidates().subscribe({
      next: (candidates) => {
        this.candidates = candidates;
        this.filteredCandidates = candidates;
      },
      error: (error) => {
        console.error('Error loading candidates:', error);
      }
    });
  }

  loadJobs(): void {
    this.recruitmentService.getJobs().subscribe({
      next: (jobs) => {
        this.jobs = jobs;
      },
      error: (error) => {
        console.error('Error loading jobs:', error);
      }
    });
  }

  applyFilters(): void {
    this.filteredCandidates = this.candidates.filter(candidate => {
      const matchesSearch = candidate.firstName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           candidate.email.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesStatus = this.statusFilter === 'ALL' || candidate.status === this.statusFilter;
      const matchesJob = this.jobFilter === 'ALL' || candidate.jobId.toString() === this.jobFilter;
      return matchesSearch && matchesStatus && matchesJob;
    });
  }

  updateStatus(candidateId: number, newStatus: string): void {
    this.recruitmentService.updateCandidateStatus(candidateId, newStatus).subscribe({
      next: () => {
        this.loadCandidates();
      },
      error: (error) => {
        console.error('Error updating candidate status:', error);
      }
    });
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'APPLIED': return 'badge bg-primary';
      case 'SHORTLISTED': return 'badge bg-info';
      case 'INTERVIEW_SCHEDULED': return 'badge bg-warning';
      case 'SELECTED': return 'badge bg-success';
      case 'REJECTED': return 'badge bg-danger';
      default: return 'badge bg-secondary';
    }
  }

  getJobTitle(jobId: number): string {
    const job = this.jobs.find(j => j.id === jobId);
    return job ? job.title : 'Unknown Job';
  }
}