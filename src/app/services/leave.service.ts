// leave.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LeaveApplication, LeaveBalance, LeaveType, LeaveStatus } from '../models/leave.model';

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
    return this.http.get<LeaveType[]>(`${this.apiUrl}/types/active`);
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