import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RecruitmentService } from '../../../services/recruitment.service';
import { Interview, Candidate } from '../../../models/recruitment.model';

@Component({
  selector: 'app-interview-schedule',
  templateUrl: './interview-schedule.component.html',
  styleUrls: ['./interview-schedule.component.scss']
})
export class InterviewScheduleComponent implements OnInit {
  interviews: Interview[] = [];
  candidates: Candidate[] = [];
  interviewForm: FormGroup;
  showForm = false;
  isLoading = false;

  // Statistics properties
  scheduledCount = 0;
  completedCount = 0;
  cancelledCount = 0;
  rescheduledCount = 0;

  constructor(
    private recruitmentService: RecruitmentService,
    private fb: FormBuilder
  ) {
    this.interviewForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadInterviews();
    this.loadCandidates();
  }

  createForm(): FormGroup {
    return this.fb.group({
      candidateId: ['', Validators.required],
      interviewDate: ['', Validators.required],
      interviewTime: ['', Validators.required],
      interviewers: ['', Validators.required],
      round: ['', Validators.required]
    });
  }

  loadInterviews(): void {
    this.recruitmentService.getInterviews().subscribe({
      next: (interviews) => {
        this.interviews = interviews;
        this.calculateStatistics();
      },
      error: (error) => {
        console.error('Error loading interviews:', error);
      }
    });
  }

  loadCandidates(): void {
    this.recruitmentService.getCandidates().subscribe({
      next: (candidates) => {
        // Filter only shortlisted candidates
        this.candidates = candidates.filter(c => c.status === 'SHORTLISTED');
      },
      error: (error) => {
        console.error('Error loading candidates:', error);
      }
    });
  }

  calculateStatistics(): void {
    this.scheduledCount = this.interviews.filter(i => i.status === 'SCHEDULED').length;
    this.completedCount = this.interviews.filter(i => i.status === 'COMPLETED').length;
    this.cancelledCount = this.interviews.filter(i => i.status === 'CANCELLED').length;
    this.rescheduledCount = this.interviews.filter(i => i.status === 'RESCHEDULED').length;
  }

  onSubmit(): void {
    if (this.interviewForm.valid) {
      this.isLoading = true;
      const interviewData: Interview = {
        ...this.interviewForm.value,
        status: 'SCHEDULED'
      };

      this.recruitmentService.scheduleInterview(interviewData).subscribe({
        next: () => {
          this.loadInterviews();
          this.interviewForm.reset();
          this.showForm = false;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error scheduling interview:', error);
          this.isLoading = false;
        }
      });
    }
  }

  getCandidateName(candidateId: number): string {
    const candidate = this.candidates.find(c => c.id === candidateId);
    return candidate ? `${candidate.firstName} ${candidate.lastName}` : 'Unknown Candidate';
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'SCHEDULED': return 'badge bg-warning';
      case 'COMPLETED': return 'badge bg-success';
      case 'CANCELLED': return 'badge bg-danger';
      case 'RESCHEDULED': return 'badge bg-info';
      default: return 'badge bg-secondary';
    }
  }

  // Add these methods for action buttons
  markAsCompleted(interviewId: number): void {
    // Implementation for marking interview as completed
    console.log('Mark as completed:', interviewId);
  }

  rescheduleInterview(interviewId: number): void {
    // Implementation for rescheduling interview
    console.log('Reschedule interview:', interviewId);
  }

  cancelInterview(interviewId: number): void {
    if (confirm('Are you sure you want to cancel this interview?')) {
      // Implementation for canceling interview
      console.log('Cancel interview:', interviewId);
    }
  }
}