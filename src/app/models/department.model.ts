export enum DepartmentStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED'
}

export interface Department {
  id: number;
  name: string;
  code: string;
  description: string;
  location: string;
  budget: number;
  status: DepartmentStatus;
  establishedDate: string;
  departmentHeadId: number;
  departmentHeadName: string;
  employeeCount: number;
  isActive: boolean;
}