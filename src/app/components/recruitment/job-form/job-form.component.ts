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
        // Set default values for new job
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
      title: ['', [Validators.required, Validators.minLength(5)]],
      department: ['', Validators.required],
      position: ['', Validators.required],
      employmentType: ['FULL_TIME', Validators.required],
      location: ['Dhaka', Validators.required],
      description: ['', [Validators.required, Validators.minLength(20)]],
      requirements: ['', [Validators.required, Validators.minLength(20)]],
      experienceRequired: ['', Validators.required],
      educationRequired: [''],
      skillsRequired: [''],
      salaryRange: ['', Validators.required],
      vacancy: [1, [Validators.required, Validators.min(1)]],
      benefits: [''],
      status: ['OPEN', Validators.required],
      deadline: ['', Validators.required],
      contactEmail: ['', [Validators.required, Validators.email]],
      contactPhone: ['', Validators.required]
    });
  }

  loadJob(): void {
    if (this.jobId) {
      this.recruitmentService.getJob(this.jobId).subscribe({
        next: (job) => {
          // Format date for input field
          const formattedJob = {
            ...job,
            deadline: new Date(job.deadline).toISOString().split('T')[0]
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
      
      const jobData: Job = {
        ...this.jobForm.value,
        postedDate: new Date().toISOString()
      };

      const observable = this.isEdit && this.jobId
        ? this.recruitmentService.updateJob(this.jobId, jobData)
        : this.recruitmentService.createJob(jobData);

      observable.subscribe({
        next: (response) => {
          this.isLoading = false;
          alert(`Job ${this.isEdit ? 'updated' : 'created'} successfully!`);
          this.router.navigate(['/recruitment/jobs']);
        },
        error: (error) => {
          this.isLoading = false;
          console.error(`Error ${this.isEdit ? 'updating' : 'creating'} job:`, error);
          alert(`Error ${this.isEdit ? 'updating' : 'creating'} job. Please try again.`);
        }
      });
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.jobForm.controls).forEach(key => {
        this.jobForm.get(key)?.markAsTouched();
      });
    }
  }

  // Helper methods for validation messages
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