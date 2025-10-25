export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  roles: string[];
  isActive: boolean;
}

export interface UserResponse {
  id: number;
  username: string;
  email: string;
  fullName: string;
  roles: string[];
  active: boolean;
  employeeId?: number;
  employeeCode?: string;
  designation?: string;
  departmentName?: string;
}