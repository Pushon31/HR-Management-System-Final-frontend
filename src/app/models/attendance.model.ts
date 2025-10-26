export interface Attendance {
  id: number;
  employeeId: string;        // Business ID (EMP-001)
  employeeName: string;
  attendanceDate: string;    // LocalDate as string
  checkinTime: string;       // LocalTime as string
  checkoutTime: string;      // LocalTime as string
  status: AttendanceStatus;
  totalHours: number;
  remarks: string;
  departmentName: string;
}

export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT', 
  LATE = 'LATE',
  HALF_DAY = 'HALF_DAY'
}

export interface CheckInRequest {
  employeeId: string;  // Using business ID (EMP-001)
}

export interface CheckOutRequest {
  employeeId: string;  // Using business ID (EMP-001)
}

export interface AttendanceSummary {
  employeeId: string;
  employeeName: string;
  departmentName: string;
  totalPresent: number;
  totalAbsent: number;
  totalLate: number;
  totalHalfDay: number;
  totalWorkingDays: number;
  attendancePercentage: number;
}