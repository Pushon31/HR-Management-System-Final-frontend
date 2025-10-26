export interface Job {
  id?: number;
  title: string;
  department: string;
  position: string;
  description: string;
  requirements: string;
  experienceRequired: string;
  salaryRange: string;
  vacancy: number;
  status: 'OPEN' | 'CLOSED' | 'ON_HOLD';
  postedDate: string;
  deadline: string;
  createdBy?: string;
  // New fields for complete job posting
  location?: string;
  employmentType?: string; // FULL_TIME, PART_TIME, CONTRACT
  educationRequired?: string;
  skillsRequired?: string;
  benefits?: string;
  contactEmail?: string;
  contactPhone?: string;
}

export interface Candidate {
  id?: number;
  jobId: number;
  jobTitle?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  qualification: string;
  experience: string;
  currentSalary?: string;
  expectedSalary: string;
  resumePath?: string;
  status: 'APPLIED' | 'SHORTLISTED' | 'REJECTED' | 'SELECTED' | 'INTERVIEW_SCHEDULED';
  appliedDate: string;
  notes?: string;
  // New fields
  dateOfBirth?: string;
  gender?: string;
  education?: string;
  skills?: string;
  coverLetter?: string;
}

export interface Interview {
  id?: number;
  candidateId: number;
  candidateName?: string;
  jobId: number;
  jobTitle?: string;
  interviewDate: string;
  interviewTime: string;
  interviewers: string;
  round: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED';
  feedback?: string;
  rating?: number;
  createdBy?: string;
  // New fields
  venue?: string;
  duration?: string;
  interviewType?: string; // IN_PERSON, PHONE, VIDEO
}