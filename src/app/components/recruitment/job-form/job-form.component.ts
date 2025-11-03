import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RecruitmentService } from '../../../services/recruitment.service';
import { Job } from '../../../models/recruitment.model';

@Component({
  selector: 'app-job-form',
  templateUrl: './job-form.component.html',
  styleUrls: ['./job-form.component.scss']
})
export class JobFormComponent implements OnInit {
  jobForm: FormGroup;
  isEdit = false;
  jobId?: number;
  isLoading = false;
  generatedJobCode: string = '';

  departments = [
    'Production', 'Quality Control', 'Design', 'Merchandising',
    'HR', 'Finance', 'IT', 'Marketing', 'Sales', 'Supply Chain'
  ];

  positions = [
    'Manager', 'Supervisor', 'Senior Executive', 'Executive',
    'Operator', 'Quality Inspector', 'Designer', 'Merchandiser',
    'Technician', 'Assistant'
  ];

  employmentTypes = [
    'FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP'
  ];

  locations = [
    'Dhaka', 'Chittagong', 'Gazipur', 'Narayanganj',
    'Savar', 'Ashulia', 'Tongi', 'Others'
  ];

  educationLevels = [
    'SSC', 'HSC', 'Diploma', 'Bachelor',
    'Masters', 'PhD', 'No Formal Education'
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private recruitmentService: RecruitmentService
  ) {
    this.jobForm = this.createForm();
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEdit = true;
        this.jobId = +params['id'];
        this.loadJob();
      } else {
        this.generateJobCode();
        this.jobForm.patchValue({
          status: 'OPEN',
          vacancy: 1,
          employmentType: 'FULL_TIME',
          location: 'Dhaka'
        });
      }
    });
  }

  createForm(): FormGroup {
    return this.fb.group({
      jobCode: ['', Validators.required],
      jobTitle: ['', [Validators.required, Validators.minLength(5)]],
      department: ['', Validators.required],
      position: ['', Validators.required],
      employmentType: ['FULL_TIME', Validators.required],
      location: ['Dhaka', Validators.required],
      jobDescription: ['', [Validators.required, Validators.minLength(20)]],
      requirements: ['', [Validators.required, Validators.minLength(20)]],
      experienceLevel: ['', Validators.required],
      educationRequired: [''],
      skillsRequired: [''],
      salaryRange: ['', Validators.required],
      vacancy: [1, [Validators.required, Validators.min(1)]],
      benefits: [''],
      status: ['OPEN', Validators.required],
      applicationDeadline: ['', Validators.required],
      contactEmail: ['', [Validators.required, Validators.email]],
      contactPhone: ['', Validators.required]
    });
  }

  generateJobCode(): void {
    const prefix = 'JOB';
    const timestamp = new Date().getTime().toString().slice(-4);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.generatedJobCode = `${prefix}-${timestamp}-${random}`;
    
    this.jobForm.patchValue({
      jobCode: this.generatedJobCode
    });
  }

  loadJob(): void {
    if (this.jobId) {
      this.recruitmentService.getJob(this.jobId).subscribe({
        next: (job) => {
          // ✅ FIXED: Remove reference to non-existent experienceRequired
          const formattedJob = {
            ...job,
            jobTitle: job.title || job.jobTitle,
            jobDescription: job.description || job.jobDescription,
            experienceLevel: job.experienceLevel, // Only use existing property
            applicationDeadline: job.applicationDeadline ? 
              new Date(job.applicationDeadline).toISOString().split('T')[0] : ''
          };
          this.jobForm.patchValue(formattedJob);
        },
        error: (error) => {
          console.error('Error loading job:', error);
          alert('Error loading job details');
        }
      });
    }
  }

  onSubmit(): void {
    if (this.jobForm.valid) {
      this.isLoading = true;

      const formData = this.jobForm.value;
      
      // ✅ Map to backend expected field names
      const jobData: any = {
        jobCode: formData.jobCode,
        jobTitle: formData.jobTitle,
        department: formData.department,
        jobDescription: formData.jobDescription,
        requirements: formData.requirements,
        experienceLevel: formData.experienceLevel,
        employmentType: formData.employmentType,
        location: formData.location,
        salaryRange: formData.salaryRange,
        applicationDeadline: formData.applicationDeadline,
        status: formData.status,
        postedDate: new Date().toISOString(),
        vacancies: formData.vacancy,
        skillsRequired: formData.skillsRequired ? 
          formData.skillsRequired.split(',').map((skill: string) => skill.trim()) : []
      };

      console.log('📤 Sending job data to backend:', jobData);

      const observable = this.isEdit && this.jobId
        ? this.recruitmentService.updateJob(this.jobId, jobData)
        : this.recruitmentService.createJob(jobData);

      observable.subscribe({
        next: (response) => {
          this.isLoading = false;
          alert(`Job ${this.isEdit ? 'updated' : 'created'} successfully!`);
          this.router.navigate(['/admin/recruitment/jobs']);
        },
        error: (error) => {
          this.isLoading = false;
          console.error(`Error ${this.isEdit ? 'updating' : 'creating'} job:`, error);
          
          let errorMsg = `Error ${this.isEdit ? 'updating' : 'creating'} job. `;
          if (error.message?.includes('job_title')) {
            errorMsg += 'Job title mapping issue. Please try again.';
          } else if (error.message?.includes('job_code')) {
            errorMsg += 'Job code is required. Please try again.';
          } else {
            errorMsg += 'Please try again.';
          }
          alert(errorMsg);
        }
      });
    } else {
      Object.keys(this.jobForm.controls).forEach(key => {
        this.jobForm.get(key)?.markAsTouched();
      });
    }
  }

  resetForm(): void {
    if (confirm('Are you sure you want to reset the form? All entered data will be lost.')) {
      this.jobForm.reset();
      if (!this.isEdit) {
        this.generateJobCode();
      }
      this.jobForm.patchValue({
        status: 'OPEN',
        vacancy: 1,
        employmentType: 'FULL_TIME',
        location: 'Dhaka'
      });
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.jobForm.get(fieldName);
    return field ? field.invalid && field.touched : false;
  }

  getFieldError(fieldName: string): string {
    const field = this.jobForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return 'This field is required';
      if (field.errors['email']) return 'Please enter a valid email';
      if (field.errors['minlength']) return `Minimum ${field.errors['minlength'].requiredLength} characters required`;
      if (field.errors['min']) return `Minimum value is ${field.errors['min'].min}`;
    }
    return '';
  }
}