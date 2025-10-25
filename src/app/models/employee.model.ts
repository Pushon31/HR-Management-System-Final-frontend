export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER'
}

export enum MaritalStatus {
  SINGLE = 'SINGLE',
  MARRIED = 'MARRIED',
  DIVORCED = 'DIVORCED',
  WIDOWED = 'WIDOWED'
}

export enum EmployeeType {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  CONTRACT = 'CONTRACT',
  INTERN = 'INTERN',
  PROBATION = 'PROBATION'
}

export enum EmployeeStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  TERMINATED = 'TERMINATED',
  SUSPENDED = 'SUSPENDED',
  ON_LEAVE = 'ON_LEAVE'
}

export enum EmployeeWorkType {
  ONSITE = 'ONSITE',
  REMOTE = 'REMOTE',
  HYBRID = 'HYBRID'
}

export interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  employeeId: string;
  email: string;
  nidNumber: string;
  bankAccountNumber: string;
  gender: Gender;
  maritalStatus: MaritalStatus;
  departmentId: number;
  departmentName: string;
  birthDate: string;
  joinDate: string;
  phoneNumber: string;
  emergencyContact: string;
  address: string;
  designation: string;
  employeeType: EmployeeType;
  shift: string;
  basicSalary: number;
  profilePic: string;
  managerId: number;
  managerName: string;
  status: EmployeeStatus;
  workType: EmployeeWorkType;
}