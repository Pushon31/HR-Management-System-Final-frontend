import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// Auth Components
import { LoginComponent } from './components/auth/login/login.component';
import { ForgotPasswordComponent } from './components/auth/forgot-password/forgot-password.component';

// Layout Components
import { HeaderComponent } from './components/layout/header/header.component';
import { SidebarComponent } from './components/layout/sidebar/sidebar.component';
import { FooterComponent } from './components/layout/footer/footer.component';
import { DashboardLayoutComponent } from './components/layout/dashboard-layout/dashboard-layout.component';

// Dashboard Components
import { AdminDashboardComponent } from './components/dashboard/admin-dashboard/admin-dashboard.component';
import { ManagerDashboardComponent } from './components/dashboard/manager-dashboard/manager-dashboard.component';
import { EmployeeDashboardComponent } from './components/dashboard/employee-dashboard/employee-dashboard.component';

// Employee Components
import { EmployeeListComponent } from './components/employees/employee-list/employee-list.component';
import { EmployeeFormComponent } from './components/employees/employee-form/employee-form.component';
import { EmployeeDetailsComponent } from './components/employees/employee-details/employee-details.component';
import { EmployeeProfileComponent } from './components/employees/employee-profile/employee-profile.component';

// Department Components
import { DepartmentListComponent } from './components/departments/department-list/department-list.component';
import { DepartmentFormComponent } from './components/departments/department-form/department-form.component';

// Other components (add as you generate them)
import { AttendanceCheckinComponent } from './components/attendance/attendance-checkin/attendance-checkin.component';
import { AttendanceHistoryComponent } from './components/attendance/attendance-history/attendance-history.component';
import { AttendanceReportComponent } from './components/attendance/attendance-report/attendance-report.component';
import { LeaveApplicationComponent } from './components/leaves/leave-application/leave-application.component';
import { LeaveBalanceComponent } from './components/leaves/leave-balance/leave-balance.component';
import { LeaveApprovalComponent } from './components/leaves/leave-approval/leave-approval.component';
import { LeaveHistoryComponent } from './components/leaves/leave-history/leave-history.component';

// Guards
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';

// Interceptors
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { ErrorInterceptor } from './interceptors/error.interceptor';

// Services
import { EmployeeService } from './services/employee.service';
import { DepartmentService } from './services/department.service';
import { UserService } from './services/user.service';
import { JobFormComponent } from './components/recruitment/job-form/job-form.component';
import { JobListComponent } from './components/recruitment/job-list/job-list.component';
import { CandidateListComponent } from './components/recruitment/candidate-list/candidate-list.component';
import { InterviewScheduleComponent } from './components/recruitment/interview-schedule/interview-schedule.component';
import { SalaryStructureComponent } from './components/payroll/salary-structure/salary-structure.component';
import { PayrollProcessComponent } from './components/payroll/payroll-process/payroll-process.component';
import { PayslipViewComponent } from './components/payroll/payslip-view/payslip-view.component';
import { BonusManagementComponent } from './components/payroll/bonus-management/bonus-management.component';
import { TaskFormComponent } from './components/tasks/task-form/task-form.component';
import { TaskListComponent } from './components/tasks/task-list/task-list.component';
import { ProjectListComponent } from './components/tasks/project-list/project-list.component';
import { ProjectFormComponent } from './components/tasks/project-form/project-form.component';
import { UserListComponent } from './components/admin/user-list/user-list.component';
import { UserFormComponent } from './components/admin/user-form/user-form.component';
import { PayrollDashboardComponent } from './components/payroll/payroll-dashboard/payroll-dashboard.component';
import { SalaryStructureFormComponent } from './components/payroll/salary-structure-form/salary-structure-form.component';

@NgModule({
  declarations: [
    AppComponent,
    
    // Auth Components
    LoginComponent,
  
    ForgotPasswordComponent,
    
    // Layout Components
    HeaderComponent,
    SidebarComponent,
    FooterComponent,
    DashboardLayoutComponent,
    
    // Dashboard Components
    AdminDashboardComponent,
    ManagerDashboardComponent,
    EmployeeDashboardComponent,
    
    // Employee Components
    EmployeeListComponent,
    EmployeeFormComponent,
    EmployeeDetailsComponent,
    EmployeeProfileComponent,
    
    // Department Components
    DepartmentListComponent,
    DepartmentFormComponent,
    
    // Other Components (add as you generate them)
    AttendanceCheckinComponent,
    AttendanceHistoryComponent,
    AttendanceReportComponent,
    LeaveApplicationComponent,
    LeaveBalanceComponent,
    LeaveApprovalComponent,
    LeaveHistoryComponent,

    JobFormComponent,
    JobListComponent,
    CandidateListComponent,
    InterviewScheduleComponent,


    SalaryStructureComponent,
    PayrollProcessComponent,
    PayslipViewComponent,
    BonusManagementComponent,
    PayrollDashboardComponent,
    SalaryStructureFormComponent,


    
    TaskListComponent,
    ProjectListComponent,
    ProjectFormComponent,
    TaskFormComponent,
    UserListComponent,
    UserFormComponent,

    
    
    
  




  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule // Make sure RouterModule is imported
  ],
  providers: [
    // Guards
    AuthGuard,
    RoleGuard,
    
    // Services
    EmployeeService,
    DepartmentService,
    UserService,
    
    // Interceptors
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }