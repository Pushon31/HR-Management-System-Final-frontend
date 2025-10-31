import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// ==================== GUARDS ====================
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';

// ==================== AUTH COMPONENTS ====================
import { LoginComponent } from './components/auth/login/login.component';
import { ForgotPasswordComponent } from './components/auth/forgot-password/forgot-password.component';

// ==================== LAYOUT COMPONENTS ====================
import { DashboardLayoutComponent } from './components/layout/dashboard-layout/dashboard-layout.component';

// ==================== DASHBOARD COMPONENTS ====================
import { AdminDashboardComponent } from './components/dashboard/admin-dashboard/admin-dashboard.component';
import { ManagerDashboardComponent } from './components/dashboard/manager-dashboard/manager-dashboard.component';
import { EmployeeDashboardComponent } from './components/dashboard/employee-dashboard/employee-dashboard.component';

// ==================== ADMIN USER MANAGEMENT ====================
import { UserListComponent } from './components/admin/user-list/user-list.component';
import { UserFormComponent } from './components/admin/user-form/user-form.component';

// ==================== EMPLOYEE MANAGEMENT ====================
import { EmployeeListComponent } from './components/employees/employee-list/employee-list.component';
import { EmployeeFormComponent } from './components/employees/employee-form/employee-form.component';
import { EmployeeDetailsComponent } from './components/employees/employee-details/employee-details.component';
import { EmployeeProfileComponent } from './components/employees/employee-profile/employee-profile.component';

// ==================== DEPARTMENT MANAGEMENT ====================
import { DepartmentListComponent } from './components/departments/department-list/department-list.component';
import { DepartmentFormComponent } from './components/departments/department-form/department-form.component';

// ==================== ATTENDANCE MANAGEMENT ====================
import { AttendanceCheckinComponent } from './components/attendance/attendance-checkin/attendance-checkin.component';
import { AttendanceHistoryComponent } from './components/attendance/attendance-history/attendance-history.component';
import { AttendanceReportComponent } from './components/attendance/attendance-report/attendance-report.component';

// ==================== LEAVE MANAGEMENT ====================
import { LeaveApplicationComponent } from './components/leaves/leave-application/leave-application.component';
import { LeaveBalanceComponent } from './components/leaves/leave-balance/leave-balance.component';
import { LeaveApprovalComponent } from './components/leaves/leave-approval/leave-approval.component';
import { LeaveHistoryComponent } from './components/leaves/leave-history/leave-history.component';

// ==================== RECRUITMENT MANAGEMENT ====================
import { JobListComponent } from './components/recruitment/job-list/job-list.component';
import { JobFormComponent } from './components/recruitment/job-form/job-form.component';
import { CandidateListComponent } from './components/recruitment/candidate-list/candidate-list.component';
import { CandidateFormComponent } from './components/recruitment/candidate-form/candidate-form.component';
import { InterviewScheduleComponent } from './components/recruitment/interview-schedule/interview-schedule.component';

// ==================== PAYROLL MANAGEMENT ====================
import { SalaryStructureComponent } from './components/payroll/salary-structure/salary-structure.component';
import { PayrollProcessComponent } from './components/payroll/payroll-process/payroll-process.component';
import { PayslipViewComponent } from './components/payroll/payslip-view/payslip-view.component';
import { BonusManagementComponent } from './components/payroll/bonus-management/bonus-management.component';

// ==================== TASK MANAGEMENT ====================
import { TaskListComponent } from './components/tasks/task-list/task-list.component';
import { TaskFormComponent } from './components/tasks/task-form/task-form.component';
import { ProjectListComponent } from './components/tasks/project-list/project-list.component';
import { ProjectFormComponent } from './components/tasks/project-form/project-form.component';

// ==================== ANALYTICS COMPONENTS ====================
import { EmployeeAnalyticsComponent } from './components/analytics/employee-analytics/employee-analytics.component';
import { AttendanceAnalyticsComponent } from './components/analytics/attendance-analytics/attendance-analytics.component';
import { PayrollAnalyticsComponent } from './components/analytics/payroll-analytics/payroll-analytics.component';
import { PayrollDashboardComponent } from './components/payroll/payroll-dashboard/payroll-dashboard.component';
import { SalaryStructureFormComponent } from './components/payroll/salary-structure-form/salary-structure-form.component';

const routes: Routes = [
  // ==================== PUBLIC ROUTES ====================
  { 
    path: '', 
    redirectTo: '/login', 
    pathMatch: 'full' 
  },
  { 
    path: 'login', 
    component: LoginComponent,
    data: { title: 'Login - Garment Management System' }
  },
  { 
    path: 'forgot-password', 
    component: ForgotPasswordComponent,
    data: { title: 'Forgot Password' }
  },

  // ==================== 👑 ADMIN ROUTES ====================
  {
    path: 'admin',
    component: DashboardLayoutComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { 
      roles: ['ROLE_ADMIN'],
      title: 'Admin Dashboard'
    },
    children: [
      // Dashboard
      { 
        path: 'dashboard', 
        component: AdminDashboardComponent,
        data: { title: 'Admin Dashboard' }
      },
      
      // 👥 USER MANAGEMENT - NEWLY ADDED
      { 
        path: 'users', 
        component: UserListComponent,
        data: { title: 'User Management' }
      },
      { 
        path: 'users/add', 
        component: UserFormComponent,
        data: { title: 'Add New User' }
      },
      { 
        path: 'users/edit/:id', 
        component: UserFormComponent,
        data: { title: 'Edit User' }
      },
      
      // Employee Management
      { 
        path: 'employees', 
        component: EmployeeListComponent,
        data: { title: 'All Employees' }
      },
      { 
        path: 'employees/add', 
        component: EmployeeFormComponent,
        data: { title: 'Add New Employee' }
      },
      { 
        path: 'employees/edit/:id', 
        component: EmployeeFormComponent,
        data: { title: 'Edit Employee' }
      },
      { 
        path: 'employees/details/:id', 
        component: EmployeeDetailsComponent,
        data: { title: 'Employee Details' }
      },
      
      // Department Management
      { 
        path: 'departments', 
        component: DepartmentListComponent,
        data: { title: 'Departments' }
      },
      { 
        path: 'departments/add', 
        component: DepartmentFormComponent,
        data: { title: 'Add Department' }
      },
      { 
        path: 'departments/edit/:id', 
        component: DepartmentFormComponent,
        data: { title: 'Edit Department' }
      },
      
      // Attendance Management
      { 
        path: 'attendance/reports', 
        component: AttendanceReportComponent,
        data: { title: 'Attendance Reports' }
      },
      
      // Leave Management
      { 
        path: 'leaves/approvals', 
        component: LeaveApprovalComponent,
        data: { title: 'Leave Approvals' }
      },
      { 
        path: 'leaves/history', 
        component: LeaveHistoryComponent,
        data: { title: 'Leave History' }
      },
      
      // Recruitment Management
      { 
        path: 'recruitment/jobs', 
        component: JobListComponent,
        data: { title: 'Job Postings' }
      },
      { 
        path: 'recruitment/jobs/add', 
        component: JobFormComponent,
        data: { title: 'Add Job Posting' }
      },
      { 
        path: 'recruitment/jobs/edit/:id', 
        component: JobFormComponent,
        data: { title: 'Edit Job Posting' }
      },
      { 
        path: 'recruitment/candidates', 
        component: CandidateListComponent,
        data: { title: 'Candidates' }
      },
      { 
        path: 'recruitment/candidates/add', 
        component: CandidateFormComponent,
        data: { title: 'Add Candidate' }
      },
      { 
        path: 'recruitment/candidates/edit/:id', 
        component: CandidateFormComponent,
        data: { title: 'Edit Candidate' }
      },
      { 
        path: 'recruitment/interviews', 
        component: InterviewScheduleComponent,
        data: { title: 'Interview Schedule' }
      },
      
      // Payroll Management
   { 
  path: 'payroll', 
  component: PayrollDashboardComponent,
  data: { title: 'Payroll Dashboard' }
},
{ 
  path: 'payroll/structures', 
  component: SalaryStructureComponent,
  data: { title: 'Salary Structures' }
},
{ 
  path: 'payroll/structures/add',  // ✅ এই line টি যোগ করুন
  component: SalaryStructureFormComponent, // আপনি এই component create করুন
  data: { title: 'Add Salary Structure' }
},
{ 
  path: 'payroll/structures/edit/:id',  // ✅ এই line টি যোগ করুন
  component: SalaryStructureFormComponent, // একই component edit-এর জন্য
  data: { title: 'Edit Salary Structure' }
},

{ 
  path: 'payroll/process', 
  component: PayrollProcessComponent,
  data: { title: 'Process Payroll' }
},
{ 
  path: 'payroll/payslips', 
  component: PayslipViewComponent,
  data: { title: 'Employee Payslips' }
},
{ 
  path: 'payroll/bonus', 
  component: BonusManagementComponent,
  data: { title: 'Bonus Management' }
},
      
      // Task Management
      { 
        path: 'tasks', 
        component: TaskListComponent,
        data: { title: 'All Tasks' }
      },
      { 
        path: 'tasks/add', 
        component: TaskFormComponent,
        data: { title: 'Create Task' }
      },
      { 
        path: 'tasks/edit/:id', 
        component: TaskFormComponent,
        data: { title: 'Edit Task' }
      },
      { 
        path: 'projects', 
        component: ProjectListComponent,
        data: { title: 'Projects' }
      },
      { 
        path: 'projects/add', 
        component: ProjectFormComponent,
        data: { title: 'Create Project' }
      },
      { 
        path: 'projects/edit/:id', 
        component: ProjectFormComponent,
        data: { title: 'Edit Project' }
      },
      
      // Analytics
      { 
        path: 'analytics/employees', 
        component: EmployeeAnalyticsComponent,
        data: { title: 'Employee Analytics' }
      },
      { 
        path: 'analytics/attendance', 
        component: AttendanceAnalyticsComponent,
        data: { title: 'Attendance Analytics' }
      },
      { 
        path: 'analytics/payroll', 
        component: PayrollAnalyticsComponent,
        data: { title: 'Payroll Analytics' }
      },
      
      // Default redirect
      { 
        path: '', 
        redirectTo: 'dashboard', 
        pathMatch: 'full' 
      }
    ]
  },

  // ==================== 👨‍💼 MANAGER ROUTES ====================
  {
    path: 'manager',
    component: DashboardLayoutComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { 
      roles: ['ROLE_MANAGER', 'ROLE_HR', 'ROLE_ACCOUNTANT'],
      title: 'Manager Dashboard'
    },
    children: [
      // Dashboard
      { 
        path: 'dashboard', 
        component: ManagerDashboardComponent,
        data: { title: 'Manager Dashboard' }
      },
      
      // Team Management (Manager)
      { 
        path: 'team', 
        component: EmployeeListComponent,
        data: { title: 'My Team' }
      },
      { 
        path: 'team/details/:id', 
        component: EmployeeDetailsComponent,
        data: { title: 'Team Member Details' }
      },
      
      // Attendance (Manager)
      { 
        path: 'attendance', 
        component: AttendanceReportComponent,
        data: { title: 'Team Attendance' }
      },
      { 
        path: 'attendance/team', 
        component: AttendanceHistoryComponent,
        data: { title: 'Team Attendance History' }
      },
      
      // Leave Approval (Manager)
      { 
        path: 'leaves/approvals', 
        component: LeaveApprovalComponent,
        data: { title: 'Leave Approvals' }
      },
      { 
        path: 'leaves/team', 
        component: LeaveHistoryComponent,
        data: { title: 'Team Leave History' }
      },
      
      // Recruitment (HR) - Different paths to avoid conflict
      { 
        path: 'recruitment/postings', 
        component: JobListComponent,
        data: { title: 'Job Postings' }
      },
      { 
        path: 'recruitment/postings/add', 
        component: JobFormComponent,
        data: { title: 'Add Job Posting' }
      },
      { 
        path: 'recruitment/postings/edit/:id', 
        component: JobFormComponent,
        data: { title: 'Edit Job Posting' }
      },
      { 
        path: 'recruitment/applicants', 
        component: CandidateListComponent,
        data: { title: 'Job Applicants' }
      },
      { 
        path: 'recruitment/applicants/add', 
        component: CandidateFormComponent,
        data: { title: 'Add Applicant' }
      },
      { 
        path: 'recruitment/applicants/edit/:id', 
        component: CandidateFormComponent,
        data: { title: 'Edit Applicant' }
      },
      { 
        path: 'recruitment/interviews', 
        component: InterviewScheduleComponent,
        data: { title: 'Interview Schedule' }
      },
      
      // Payroll (Accountant)
      { 
        path: 'payroll/processing', 
        component: PayrollProcessComponent,
        data: { title: 'Process Payroll' }
      },
      { 
        path: 'payroll/payslips', 
        component: PayslipViewComponent,
        data: { title: 'Employee Payslips' }
      },
      { 
        path: 'payroll/bonus', 
        component: BonusManagementComponent,
        data: { title: 'Bonus Management' }
      },
      
      // Task Management (Manager)
      { 
        path: 'tasks', 
        component: TaskListComponent,
        data: { title: 'Team Tasks' }
      },
      { 
        path: 'tasks/add', 
        component: TaskFormComponent,
        data: { title: 'Assign Task' }
      },
      { 
        path: 'tasks/edit/:id', 
        component: TaskFormComponent,
        data: { title: 'Edit Task' }
      },
      { 
        path: 'projects', 
        component: ProjectListComponent,
        data: { title: 'Team Projects' }
      },
      { 
        path: 'projects/add', 
        component: ProjectFormComponent,
        data: { title: 'Create Project' }
      },
      { 
        path: 'projects/edit/:id', 
        component: ProjectFormComponent,
        data: { title: 'Edit Project' }
      },
      
      // Default redirect
      { 
        path: '', 
        redirectTo: 'dashboard', 
        pathMatch: 'full' 
      }
    ]
  },

  // ==================== 👨‍🔧 EMPLOYEE ROUTES ====================
  {
    path: 'employee',
    component: DashboardLayoutComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { 
      roles: ['ROLE_EMPLOYEE'],
      title: 'Employee Dashboard'
    },
    children: [
      // Dashboard
      { 
        path: 'dashboard', 
        component: EmployeeDashboardComponent,
        data: { title: 'My Dashboard' }
      },
      
      // Profile
      { 
        path: 'profile', 
        component: EmployeeProfileComponent,
        data: { title: 'My Profile' }
      },
      { 
        path: 'profile/edit', 
        component: EmployeeFormComponent,
        data: { title: 'Edit Profile' }
      },
      
      // Attendance
      { 
        path: 'attendance/checkin', 
        component: AttendanceCheckinComponent,
        data: { title: 'Check-in/out' }
      },
      { 
        path: 'attendance/history', 
        component: AttendanceHistoryComponent,
        data: { title: 'My Attendance History' }
      },
      
      // Leave Management
      { 
        path: 'leaves/apply', 
        component: LeaveApplicationComponent,
        data: { title: 'Apply for Leave' }
      },
      { 
        path: 'leaves/balance', 
        component: LeaveBalanceComponent,
        data: { title: 'My Leave Balance' }
      },
      { 
        path: 'leaves/history', 
        component: LeaveHistoryComponent,
        data: { title: 'My Leave History' }
      },
      
      // Tasks
      { 
        path: 'tasks', 
        component: TaskListComponent,
        data: { title: 'My Tasks' }
      },
      
      // Payroll
      { 
        path: 'payroll/payslips', 
        component: PayslipViewComponent,
        data: { title: 'My Payslips' }
      },
      
      // Default redirect
      { 
        path: '', 
        redirectTo: 'dashboard', 
        pathMatch: 'full' 
      }
    ]
  },

  // ==================== WILDCARD ROUTE ====================
  { 
    path: '**', 
    redirectTo: '/login',
    data: { title: 'Page Not Found' }
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { 
    enableTracing: false, // Set to true for debugging routes
    scrollPositionRestoration: 'enabled'
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }