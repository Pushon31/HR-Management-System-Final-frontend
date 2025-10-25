import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {
  forgotPasswordForm: FormGroup;
  submitted = false;
  loading = false;
  message = '';

  constructor(private formBuilder: FormBuilder) {
    this.forgotPasswordForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  get f() { return this.forgotPasswordForm.controls; }

  onSubmit(): void {
    this.submitted = true;
    
    if (this.forgotPasswordForm.invalid) {
      return;
    }

    this.loading = true;
    // Implement password reset logic here
    setTimeout(() => {
      this.message = 'Password reset instructions have been sent to your email.';
      this.loading = false;
    }, 2000);
  }
}