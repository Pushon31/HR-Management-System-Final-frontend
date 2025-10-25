import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, SignupRequest } from '../../../services/auth.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent {
  signupForm: FormGroup;
  loading = false;
  submitted = false;
  error = '';
  success = '';

  // Available roles for signup
  availableRoles = [
    { value: 'ROLE_EMPLOYEE', label: 'Employee', description: 'General system user' },
    { value: 'ROLE_MANAGER', label: 'Manager', description: 'Department manager' },
    { value: 'ROLE_HR', label: 'HR Manager', description: 'Human resources manager' },
    { value: 'ROLE_ACCOUNTANT', label: 'Accountant', description: 'Finance and payroll manager' }
  ];

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.signupForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      fullName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      roles: [[], [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });

    // Redirect if already logged in
    if (this.authService.isLoggedIn()) {
      this.redirectToDashboard();
    }
  }

  // Convenience getter for easy access to form fields
  get f() { return this.signupForm.controls; }

  // Custom validator for password match
  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
    } else {
      confirmPassword?.setErrors(null);
    }
  }

  onSubmit(): void {
    this.submitted = true;
    this.error = '';
    this.success = '';

    // Stop here if form is invalid
    if (this.signupForm.invalid) {
      return;
    }

    this.loading = true;

    const signupData: SignupRequest = {
      username: this.f['username'].value,
      email: this.f['email'].value,
      fullName: this.f['fullName'].value,
      password: this.f['password'].value,
      roles: this.f['roles'].value
    };

    this.authService.signup(signupData).subscribe({
      next: (response) => {
        this.loading = false;
        this.success = 'Account created successfully! Redirecting to login...';
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (error) => {
        this.error = error.error?.message || 'Registration failed. Please try again.';
        this.loading = false;
      }
    });
  }

  onRoleChange(role: string, event: any): void {
    const roles = this.f['roles'].value as string[];
    
    if (event.target.checked) {
      // Add role if checked
      if (!roles.includes(role)) {
        roles.push(role);
      }
    } else {
      // Remove role if unchecked
      const index = roles.indexOf(role);
      if (index > -1) {
        roles.splice(index, 1);
      }
    }
    
    this.f['roles'].setValue(roles);
  }

  private redirectToDashboard(): void {
    const baseRoute = this.authService.getBaseRoute();
    this.router.navigate([`/${baseRoute}/dashboard`]);
  }
}