// src/app/models/recruitment.model.ts

export interface Job {
  id?: number;
  // ✅ Backend compatible properties
  jobCode: string;
  title: string;
  department: string;
  description: string;
  requirements: string;
  experienceLevel: string;
  employmentType: string;
  location: string;
  salaryRange: string;
  applicationDeadline: string;
  status: 'OPEN' | 'CLOSED' | 'ON_HOLD';
  postedDate: string;
  closedDate?: string;
  vacancies: number;
  skillsRequired: string[];
  
  // ✅ Frontend display properties (optional)
  position?: string; // For backward compatibility
  deadline?: string; // Alias for applicationDeadline
}

export interface Candidate {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  resumeUrl: string;
  skills: string[];
  experience: number;
  currentCompany?: string;
  currentPosition?: string;
  expectedSalary: number;
  // ✅ FIXED: Include all possible status values
  status: 'APPLIED' | 'SHORTLISTED' | 'REJECTED' | 'HIRED' | 'INTERVIEW_SCHEDULED' | 'SELECTED';
  appliedDate: string;
  jobId: number;
  jobTitle?: string;
  address?: string;
  qualification?: string;
}

export interface Interview {
  id?: number;
  // ✅ Backend compatible properties
  candidateId: number;
  jobId: number;
  interviewerId: number;
  interviewDate: string;
  interviewTime: string;
  interviewType: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED';
  feedback?: string;
  rating?: number;
  notes?: string;
  
  // ✅ Frontend display properties
  candidateName?: string;
  jobTitle?: string;
  round?: string;
  interviewers?: string;
  
  // ✅ Optional additional fields
  venue?: string;
  duration?: string;
}