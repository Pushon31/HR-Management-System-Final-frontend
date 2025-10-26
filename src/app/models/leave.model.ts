// leave.model.ts
export interface LeaveApplication {
  id?: number;
  employeeId: number;
  employeeName?: string;
  employeeCode?: string;
  leaveTypeId: number;
  leaveTypeName?: string;
  leaveTypeCode?: string;
  startDate: string;
  endDate: string;
  totalDays?: number;
  status: LeaveStatus;
  reason: string;
  remarks?: string;
  approvedById?: number;
  approvedByName?: string;
  appliedDate?: string;
  processedDate?: string;
  contactNumber?: string;
  addressDuringLeave?: string;
  departmentName?: string;
}

export interface LeaveBalance {
  id?: number;
  employeeId: number;
  employeeName?: string;
  employeeCode?: string;
  leaveTypeId: number;
  leaveTypeName?: string;
  leaveTypeCode?: string;
  totalDays: number;
  usedDays: number;
  remainingDays: number;
  carryForwardDays: number;
  year: number;
}

export interface LeaveType {
  id?: number;
  name: string;
  code: string;
  category: LeaveCategory;
  description?: string;
  maxDaysPerYear: number;
  isActive: boolean;
  requiresApproval: boolean;
  allowEncashment: boolean;
  carryForwardDays: number;
}

export enum LeaveStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED'
}

export enum LeaveCategory {
  PAID = 'PAID',
  UNPAID = 'UNPAID',
  SICK = 'SICK',
  MATERNITY = 'MATERNITY',
  PATERNITY = 'PATERNITY',
  SPECIAL = 'SPECIAL'
}

// Helper function to calculate working days excluding weekends
export function calculateWorkingDays(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  let count = 0;
  
  for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
    const day = date.getDay();
    // Exclude weekends (Saturday = 6, Sunday = 0)
    if (day !== 0 && day !== 6) {
      count++;
    }
  }
  
  return count;
}