// src/app/services/recruitment.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Job, Candidate, Interview } from '../models/recruitment.model';

@Injectable({
  providedIn: 'root'
})
export class RecruitmentService {
  private apiUrl = 'http://localhost:8080/api/recruitment';

  constructor(private http: HttpClient) {}

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Unknown error occurred';
    
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    
    console.error('Recruitment Service Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  // ✅ FIXED: Job endpoints - match backend exactly
  getJobs(): Observable<Job[]> {
    return this.http.get<Job[]>(`${this.apiUrl}/job-postings`)
      .pipe(catchError(this.handleError));
  }

  getJob(id: number): Observable<Job> {
    return this.http.get<Job>(`${this.apiUrl}/job-postings/${id}`)
      .pipe(catchError(this.handleError));
  }

  createJob(job: Job): Observable<Job> {
    return this.http.post<Job>(`${this.apiUrl}/job-postings`, job)
      .pipe(catchError(this.handleError));
  }

  updateJob(id: number, job: Job): Observable<Job> {
    return this.http.put<Job>(`${this.apiUrl}/job-postings/${id}`, job)
      .pipe(catchError(this.handleError));
  }

  deleteJob(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/job-postings/${id}`)
      .pipe(catchError(this.handleError));
  }

  // ✅ Candidate endpoints - already correct
  getCandidates(): Observable<Candidate[]> {
    return this.http.get<Candidate[]>(`${this.apiUrl}/candidates`)
      .pipe(catchError(this.handleError));
  }

  getCandidate(id: number): Observable<Candidate> {
    return this.http.get<Candidate>(`${this.apiUrl}/candidates/${id}`)
      .pipe(catchError(this.handleError));
  }

  createCandidate(candidate: Candidate): Observable<Candidate> {
    return this.http.post<Candidate>(`${this.apiUrl}/candidates`, candidate)
      .pipe(catchError(this.handleError));
  }

  updateCandidate(id: number, candidate: Candidate): Observable<Candidate> {
    return this.http.put<Candidate>(`${this.apiUrl}/candidates/${id}`, candidate)
      .pipe(catchError(this.handleError));
  }

  updateCandidateStatus(id: number, status: string): Observable<Candidate> {
    return this.http.patch<Candidate>(`${this.apiUrl}/candidates/${id}/status`, { status })
      .pipe(catchError(this.handleError));
  }

  // ✅ Interview endpoints - already correct
  getInterviews(): Observable<Interview[]> {
    return this.http.get<Interview[]>(`${this.apiUrl}/interviews`)
      .pipe(catchError(this.handleError));
  }

  scheduleInterview(interview: Interview): Observable<Interview> {
    return this.http.post<Interview>(`${this.apiUrl}/interviews`, interview)
      .pipe(catchError(this.handleError));
  }

  updateInterview(id: number, interview: Interview): Observable<Interview> {
    return this.http.put<Interview>(`${this.apiUrl}/interviews/${id}`, interview)
      .pipe(catchError(this.handleError));
  }

  updateInterviewStatus(id: number, status: string): Observable<Interview> {
    return this.http.patch<Interview>(`${this.apiUrl}/interviews/${id}/status`, { status })
      .pipe(catchError(this.handleError));
  }

  // ✅ ADD: Get active jobs only
  getActiveJobs(): Observable<Job[]> {
    return this.http.get<Job[]>(`${this.apiUrl}/job-postings/active`)
      .pipe(catchError(this.handleError));
  }
}