// leave.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { LeaveApplication, LeaveBalance, LeaveType, LeaveStatus, LeaveCategory } from '../models/leave.model';

@Injectable({
  providedIn: 'root'
})
export class LeaveService {
  private apiUrl = 'http://localhost:8080/api/leaves';

  constructor(private http: HttpClient) {}

  // ==================== LEAVE TYPE METHODS ====================

  createLeaveType(leaveType: LeaveType): Observable<LeaveType> {
    return this.http.post<LeaveType>(`${this.apiUrl}/types`, leaveType);
  }

  getAllLeaveTypes(): Observable<LeaveType[]> {
    return this.http.get<LeaveType[]>(`${this.apiUrl}/types`);
  }

  getActiveLeaveTypes(): Observable<LeaveType[]> {
    return this.http.get<LeaveType[]>(`${this.apiUrl}/types/active`).pipe(
      // যদি backend থেকে data পায়
      map(types => {
        if (types && types.length > 0) {
          console.log('✅ Leave types loaded from backend:', types.length);
          return types;
        } else {
          // যদি backend empty array return করে
          console.warn('⚠️ Backend returned empty leave types, using defaults');
          return this.getDefaultLeaveTypes();
        }
      }),
      // যদি backend error দেয়
      catchError(error => {
        console.error('❌ Backend error, using default leave types:', error);
        return of(this.getDefaultLeaveTypes());
      })
    );
  }

  private getDefaultLeaveTypes(): LeaveType[] {
    return [
      {
        id: 1,
        name: 'Sick Leave',
        code: 'SL',
        category: LeaveCategory.SICK, // Use enum instead of string
        description: 'Leave for health issues',
        maxDaysPerYear: 14,
        isActive: true,
        requiresApproval: true,
        allowEncashment: false,
        carryForwardDays: 7
      },
      {
        id: 2,
        name: 'Casual Leave', 
        code: 'CL',
        category: LeaveCategory.PAID, // Use enum instead of string
        description: 'Casual leave for personal work',
        maxDaysPerYear: 10,
        isActive: true,
        requiresApproval: true,
        allowEncashment: false,
        carryForwardDays: 5
      },
      {
        id: 3,
        name: 'Annual Leave',
        code: 'AL',
        category: LeaveCategory.PAID, // Use enum instead of string
        description: 'Annual vacation leave',
        maxDaysPerYear: 21,
        isActive: true,
        requiresApproval: true,
        allowEncashment: true,
        carryForwardDays: 10
      },
      {
        id: 4,
        name: 'Maternity Leave',
        code: 'ML',
        category: LeaveCategory.MATERNITY, // Use enum instead of string
        description: 'Maternity leave for female employees',
        maxDaysPerYear: 180,
        isActive: true,
        requiresApproval: true,
        allowEncashment: false,
        carryForwardDays: 0
      },
      {
        id: 5,
        name: 'Paternity Leave',
        code: 'PL',
        category: LeaveCategory.PATERNITY, // Use enum instead of string
        description: 'Paternity leave for male employees',
        maxDaysPerYear: 15,
        isActive: true,
        requiresApproval: true,
        allowEncashment: false,
        carryForwardDays: 0
      }
    ];
  }

  getLeaveTypeById(id: number): Observable<LeaveType> {
    return this.http.get<LeaveType>(`${this.apiUrl}/types/${id}`);
  }

  updateLeaveType(id: number, leaveType: LeaveType): Observable<LeaveType> {
    return this.http.put<LeaveType>(`${this.apiUrl}/types/${id}`, leaveType);
  }

  deleteLeaveType(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/types/${id}`);
  }

  // ==================== LEAVE APPLICATION METHODS ====================

  applyForLeave(leaveApplication: LeaveApplication): Observable<LeaveApplication> {
    return this.http.post<LeaveApplication>(`${this.apiUrl}/applications`, leaveApplication);
  }

  getAllLeaveApplications(): Observable<LeaveApplication[]> {
    return this.http.get<LeaveApplication[]>(`${this.apiUrl}/applications`);
  }

  getLeaveApplicationsByEmployee(employeeId: number): Observable<LeaveApplication[]> {
    return this.http.get<LeaveApplication[]>(`${this.apiUrl}/applications/employee/${employeeId}`);
  }

  getLeaveApplicationById(id: number): Observable<LeaveApplication> {
    return this.http.get<LeaveApplication>(`${this.apiUrl}/applications/${id}`);
  }

  getPendingLeaveApplications(): Observable<LeaveApplication[]> {
    return this.http.get<LeaveApplication[]>(`${this.apiUrl}/applications/pending`);
  }

  getPendingLeavesForManager(managerId: number): Observable<LeaveApplication[]> {
    return this.http.get<LeaveApplication[]>(`${this.apiUrl}/applications/manager/${managerId}/pending`);
  }

  getLeaveApplicationsByStatus(status: LeaveStatus): Observable<LeaveApplication[]> {
    return this.http.get<LeaveApplication[]>(`${this.apiUrl}/applications/status/${status}`);
  }

  getLeavesByDateRange(startDate: string, endDate: string): Observable<LeaveApplication[]> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    return this.http.get<LeaveApplication[]>(`${this.apiUrl}/applications/date-range`, { params });
  }

  getLeavesByDepartment(departmentId: number): Observable<LeaveApplication[]> {
    return this.http.get<LeaveApplication[]>(`${this.apiUrl}/applications/department/${departmentId}`);
  }

  // ==================== LEAVE APPROVAL METHODS ====================

  approveLeave(leaveId: number, approvedBy: number, remarks?: string): Observable<LeaveApplication> {
    const params = new HttpParams()
      .set('approvedBy', approvedBy.toString())
      .set('remarks', remarks || '');
    return this.http.put<LeaveApplication>(`${this.apiUrl}/applications/${leaveId}/approve`, {}, { params });
  }

  rejectLeave(leaveId: number, approvedBy: number, remarks?: string): Observable<LeaveApplication> {
    const params = new HttpParams()
      .set('approvedBy', approvedBy.toString())
      .set('remarks', remarks || '');
    return this.http.put<LeaveApplication>(`${this.apiUrl}/applications/${leaveId}/reject`, {}, { params });
  }

  cancelLeave(leaveId: number, employeeId: number): Observable<LeaveApplication> {
    const params = new HttpParams()
      .set('employeeId', employeeId.toString());
    return this.http.put<LeaveApplication>(`${this.apiUrl}/applications/${leaveId}/cancel`, {}, { params });
  }

  updateLeaveApplication(id: number, leaveApplication: LeaveApplication): Observable<LeaveApplication> {
    return this.http.put<LeaveApplication>(`${this.apiUrl}/applications/${id}`, leaveApplication);
  }

  // ==================== LEAVE BALANCE METHODS ====================

  getEmployeeLeaveBalances(employeeId: number): Observable<LeaveBalance[]> {
    return this.http.get<LeaveBalance[]>(`${this.apiUrl}/balance/employee/${employeeId}`);
  }

  getLeaveBalance(employeeId: number, leaveTypeId: number): Observable<LeaveBalance> {
    return this.http.get<LeaveBalance>(`${this.apiUrl}/balance/employee/${employeeId}/type/${leaveTypeId}`);
  }

  // ==================== DASHBOARD & REPORTING METHODS ====================

  getLeaveStatistics(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/statistics`);
  }

  getEmployeeLeaveStatistics(employeeId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/statistics/employee/${employeeId}`);
  }

  getUpcomingLeaves(days: number = 30): Observable<LeaveApplication[]> {
    const params = new HttpParams().set('days', days.toString());
    return this.http.get<LeaveApplication[]>(`${this.apiUrl}/upcoming`, { params });
  }

  checkLeaveAvailability(employeeId: number, leaveTypeId: number, startDate: string, endDate: string): Observable<boolean> {
    const params = new HttpParams()
      .set('employeeId', employeeId.toString())
      .set('leaveTypeId', leaveTypeId.toString())
      .set('startDate', startDate)
      .set('endDate', endDate);
    return this.http.get<boolean>(`${this.apiUrl}/check-availability`, { params });
  }

  initializeYearlyLeaveBalances(year: number): Observable<void> {
    const params = new HttpParams().set('year', year.toString());
    return this.http.post<void>(`${this.apiUrl}/initialize-yearly-balances`, {}, { params });
  }
}