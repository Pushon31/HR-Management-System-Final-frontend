import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { AuthService } from '../../../services/auth.service';
import { CreateUserRequest, SYSTEM_ROLES, ROLE_DISPLAY_NAMES } from '../../../models/user.model';

@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss']
})
export class UserFormComponent implements OnInit {
  userForm: FormGroup;
  isEditMode = false;
  userId: number | null = null;
  loading = false;
  submitting = false;
  error = '';
  success = ''; // ✅ ADDED: Success message

  // Available roles
  availableRoles = Object.values(SYSTEM_ROLES);
  roleDisplayNames = ROLE_DISPLAY_NAMES;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.userForm = this.createForm();
  }

  ngOnInit(): void {
    console.log('UserForm: Current user:', this.authService.getCurrentUser());
    console.log('UserForm: Is logged in:', this.authService.isLoggedIn());

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.userId = +params['id'];
        this.loadUserData(this.userId);
      }
    });
  }

  createForm(): FormGroup {
    return this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      fullName: ['', [Validators.required]],
      password: ['', this.isEditMode ? [] : [Validators.required, Validators.minLength(6)]],
      roles: [[], [Validators.required]]
      // ✅ REMOVED: employeeId field - it will be auto-generated
    });
  }

  loadUserData(userId: number): void {
    this.loading = true;
    this.userService.getUserById(userId).subscribe({
      next: (user) => {
        this.userForm.patchValue({
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          roles: user.roles
        });
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load user data';
        this.loading = false;
        console.error('Error loading user:', error);
      }
    });
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      this.submitting = true;
      this.error = '';
      this.success = '';

      const formData = this.userForm.value;

      if (this.isEditMode && this.userId) {
        // Update existing user
        this.userService.updateUser(this.userId, formData).subscribe({
          next: () => {
            this.submitting = false;
            this.success = 'User updated successfully!';
            setTimeout(() => {
              this.router.navigate(['/admin/users']);
            }, 2000);
          },
          error: (error) => {
            this.error = 'Failed to update user: ' + (error.error?.message || error.message);
            this.submitting = false;
            console.error('Error updating user:', error);
          }
        });
      } else {
        // Create new user
        const createRequest: CreateUserRequest = {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
          roles: formData.roles
        };

        console.log('🔄 UserForm: Submitting create request:', createRequest);
        
        this.userService.createUser(createRequest).subscribe({
          next: (response) => {
            console.log('✅ UserForm: User created successfully', response);
            this.submitting = false;
            
            // ✅ ADDED: Show success message with employee creation status
            if (response.employeeCreated) {
              this.success = `User created successfully! Employee record created with ID: ${response.employeeId}`;
            } else {
              this.success = 'User created successfully! (No employee record created for admin role)';
            }

            // Redirect after 3 seconds
            setTimeout(() => {
              this.router.navigate(['/admin/users']);
            }, 3000);
          },
          error: (error) => {
            this.error = 'Failed to create user: ' + (error.error?.message || error.message);
            this.submitting = false;
            console.error('❌ Error creating user:', error);
          }
        });
      }
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.userForm.controls).forEach(key => {
        this.userForm.get(key)?.markAsTouched();
      });
    }
  }

  // Convenience getter for easy access to form fields
  get f() { return this.userForm.controls; }

  // Toggle role selection
  toggleRole(role: string): void {
    const currentRoles: string[] = this.userForm.get('roles')?.value || [];
    const index = currentRoles.indexOf(role);

    if (index > -1) {
      currentRoles.splice(index, 1);
    } else {
      currentRoles.push(role);
    }

    this.userForm.patchValue({ roles: currentRoles });
  }

  // Check if role is selected
  isRoleSelected(role: string): boolean {
    const currentRoles: string[] = this.userForm.get('roles')?.value || [];
    return currentRoles.includes(role);
  }

  // Cancel and go back
  onCancel(): void {
    this.router.navigate(['/admin/users']);
  }

  // ✅ ADDED: Check if roles require employee creation
  shouldCreateEmployee(): boolean {
    const roles = this.userForm.get('roles')?.value || [];
    const employeeRoles = ['ROLE_EMPLOYEE', 'ROLE_MANAGER', 'ROLE_HR', 'ROLE_ACCOUNTANT'];
    return roles.some((role: string) => employeeRoles.includes(role));
  }
}