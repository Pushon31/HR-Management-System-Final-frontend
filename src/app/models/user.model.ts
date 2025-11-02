export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  roles: string[];
  isActive: boolean;
  employeeId?: string; // ✅ ADDED: Employee ID
  createdAt?: string;
  updatedAt?: string;
}

export interface UserResponse {
  id: number;
  username: string;
  email: string;
  fullName: string;
  roles: string[];
  active: boolean;
  employeeId?: string; // ✅ CHANGED: from number to string
  employeeCode?: string;
  designation?: string;
  departmentName?: string;
  createdAt?: string;
  lastLogin?: string;
}

export interface UpdateRolesRequest {
  roleNames: string[];
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  fullName: string;
  roles: string[];
  employeeId?: string; // ✅ CHANGED: from number to string
}

export interface Role {
  id: number;
  name: string;
  description: string;
}

// Available roles in the system
export const SYSTEM_ROLES = {
  ROLE_ADMIN: 'ROLE_ADMIN',
  ROLE_MANAGER: 'ROLE_MANAGER', 
  ROLE_HR: 'ROLE_HR',
  ROLE_ACCOUNTANT: 'ROLE_ACCOUNTANT',
  ROLE_EMPLOYEE: 'ROLE_EMPLOYEE'
};

// Role display names
export const ROLE_DISPLAY_NAMES: { [key: string]: string } = {
  'ROLE_ADMIN': 'Administrator',
  'ROLE_MANAGER': 'Manager',
  'ROLE_HR': 'HR Manager', 
  'ROLE_ACCOUNTANT': 'Accountant',
  'ROLE_EMPLOYEE': 'Employee'
};

// Role descriptions
export const ROLE_DESCRIPTIONS: { [key: string]: string } = {
  'ROLE_ADMIN': 'Full system access and administration',
  'ROLE_MANAGER': 'Department management and team oversight',
  'ROLE_HR': 'Human resources and employee management',
  'ROLE_ACCOUNTANT': 'Financial management and payroll',
  'ROLE_EMPLOYEE': 'Basic system access for employees'
};