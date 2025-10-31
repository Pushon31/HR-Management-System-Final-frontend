import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RecruitmentService } from '../../../services/recruitment.service';
import { Interview, Candidate, Job } from '../../../models/recruitment.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-interview-schedule',
  templateUrl: './interview-schedule.component.html',
  styleUrls: ['./interview-schedule.component.scss']
})
export class InterviewScheduleComponent implements OnInit {
  interviews: Interview[] = [];
  filteredInterviews: Interview[] = [];
  candidates: Candidate[] = [];
  jobs: Job[] = [];
  
  // Component properties
  showForm: boolean = false;
  interviewForm: FormGroup;
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(
    private recruitmentService: RecruitmentService,
    private router: Router,
    private fb: FormBuilder
  ) {
    // Initialize form group
    this.interviewForm = this.fb.group({
      candidateId: ['', Validators.required],
      jobId: ['', Validators.required],
      round: ['', Validators.required],
      interviewDate: ['', Validators.required],
      interviewTime: ['', Validators.required],
      interviewType: ['IN_PERSON', Validators.required],
      interviewerId: ['', [Validators.required, Validators.min(1)]],
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.loadInterviews();
    this.loadCandidatesAndJobs();
  }

  loadInterviews(): void {
    this.isLoading = true;
    this.recruitmentService.getInterviews().subscribe({
      next: (interviews: Interview[]) => {
        this.interviews = interviews;
        this.filteredInterviews = interviews;
        this.isLoading = false;
        console.log('Interviews loaded:', interviews);
      },
      error: (error: any) => {
        console.error('Error loading interviews:', error);
        this.errorMessage = 'Failed to load interviews';
        this.isLoading = false;
      }
    });
  }

  loadCandidatesAndJobs(): void {
    // Load candidates
    this.recruitmentService.getCandidates().subscribe({
      next: (candidates: Candidate[]) => {
        this.candidates = candidates.filter(c => 
          c.status === 'SHORTLISTED' || c.status === 'INTERVIEW_SCHEDULED'
        );
      },
      error: (error) => {
        console.error('Error loading candidates:', error);
      }
    });

    // Load jobs
    this.recruitmentService.getJobs().subscribe({
      next: (jobs: Job[]) => {
        this.jobs = jobs.filter(j => j.status === 'OPEN');
      },
      error: (error) => {
        console.error('Error loading jobs:', error);
      }
    });
  }

  onSubmit(): void {
    if (this.interviewForm.valid) {
      this.isLoading = true;
      const formData = this.interviewForm.value;

      const interviewData: any = {
        candidateId: formData.candidateId,
        jobId: formData.jobId,
        interviewerId: formData.interviewerId,
        interviewDate: formData.interviewDate,
        interviewTime: formData.interviewTime,
        interviewType: formData.interviewType,
        status: 'SCHEDULED',
        round: formData.round,
        notes: formData.notes
      };

      this.recruitmentService.scheduleInterview(interviewData).subscribe({
        next: (interview) => {
          console.log('Interview scheduled successfully:', interview);
          this.isLoading = false;
          this.showForm = false;
          this.interviewForm.reset();
          this.loadInterviews(); // Reload the list
        },
        error: (error) => {
          console.error('Error scheduling interview:', error);
          this.errorMessage = 'Failed to schedule interview';
          this.isLoading = false;
        }
      });
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.interviewForm.controls).forEach(key => {
        this.interviewForm.get(key)?.markAsTouched();
      });
    }
  }

  getCandidateName(candidateId: number): string {
    const candidate = this.candidates.find(c => c.id === candidateId);
    return candidate ? `${candidate.firstName} ${candidate.lastName}` : 'Unknown Candidate';
  }

  getJobTitle(jobId: number): string {
    const job = this.jobs.find(j => j.id === jobId);
    return job ? job.title : 'Unknown Job';
  }

  getInterviewerName(interviewerId: number): string {
    return `Interviewer #${interviewerId}`;
  }

  getInterviewsByStatus(status: string): Interview[] {
    return this.interviews.filter(interview => interview.status === status);
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'SCHEDULED': return 'badge bg-primary';
      case 'COMPLETED': return 'badge bg-success';
      case 'CANCELLED': return 'badge bg-danger';
      case 'RESCHEDULED': return 'badge bg-warning';
      default: return 'badge bg-secondary';
    }
  }

  formatDateTime(date: string, time: string): string {
    try {
      const dateObj = new Date(date);
      return `${dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })} at ${time}`;
    } catch (e) {
      return `${date} at ${time}`;
    }
  }

  viewInterviewDetails(interviewId: number): void {
    this.router.navigate(['/admin/recruitment/interviews', interviewId]);
  }

  markAsCompleted(interviewId: number): void {
    if (confirm('Mark this interview as completed?')) {
      this.recruitmentService.updateInterviewStatus(interviewId, 'COMPLETED').subscribe({
        next: () => {
          this.loadInterviews();
        },
        error: (error) => {
          console.error('Error updating interview status:', error);
          alert('Failed to update interview status');
        }
      });
    }
  }

  rescheduleInterview(interviewId: number): void {
    // Find the interview and populate the form for editing
    const interview = this.interviews.find(i => i.id === interviewId);
    if (interview) {
      this.interviewForm.patchValue({
        candidateId: interview.candidateId,
        jobId: interview.jobId,
        round: interview.round,
        interviewDate: interview.interviewDate,
        interviewTime: interview.interviewTime,
        interviewType: interview.interviewType,
        interviewerId: interview.interviewerId,
        notes: interview.notes
      });
      this.showForm = true;
      
      // Scroll to form
      setTimeout(() => {
        document.querySelector('.card')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }

  cancelInterview(interviewId: number): void {
    if (confirm('Are you sure you want to cancel this interview?')) {
      this.recruitmentService.updateInterviewStatus(interviewId, 'CANCELLED').subscribe({
        next: () => {
          this.loadInterviews();
        },
        error: (error) => {
          console.error('Error cancelling interview:', error);
          alert('Failed to cancel interview');
        }
      });
    }
  }

  // Helper method to check if form field is invalid
  isFieldInvalid(fieldName: string): boolean {
    const field = this.interviewForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }
}