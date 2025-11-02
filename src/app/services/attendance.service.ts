import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, tap } from 'rxjs';
import { Attendance, AttendanceStatus } from '../models/attendance.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {
  private apiUrl = 'http://localhost:8080/api/attendance';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  // ✅ FIXED: Get current employee ID with proper error handling
  private getCurrentEmployeeId(): string {
    const employeeId = this.authService.getEmployeeId();
    if (!employeeId) {
      throw new Error('No employee ID found. Please login again.');
    }
    return employeeId;
  }

  getAllAttendance(): Observable<Attendance[]> {
    console.log('🔄 Fetching all attendance records');
    return this.http.get<Attendance[]>(this.apiUrl)
      .pipe(
        tap(attendance => console.log(`✅ Loaded ${attendance.length} attendance records`)),
        catchError((error: any) => {
          console.error('❌ Error loading all attendance:', error);
          throw error;
        })
      );
  }

  // ✅ FIXED: Check-in without parameter
  checkIn(): Observable<Attendance> {
    const employeeId = this.getCurrentEmployeeId();
    console.log('🔐 Checking in employee:', employeeId);
    
    return this.http.post<Attendance>(`${this.apiUrl}/check-in/${employeeId}`, {})
      .pipe(
        tap(response => console.log('✅ Check-in successful:', response)),
        catchError((error: any) => {
          console.error('❌ Check-in error:', error);
          throw error;
        })
      );
  }

  // ✅ FIXED: Check-out without parameter
  checkOut(): Observable<Attendance> {
    const employeeId = this.getCurrentEmployeeId();
    return this.http.post<Attendance>(`${this.apiUrl}/check-out/${employeeId}`, {})
      .pipe(
        catchError((error: any) => {
          console.error('❌ Check-out error:', error);
          throw error;
        })
      );
  }

  // ✅ FIXED: Get today's attendance without parameter
  getTodayAttendance(): Observable<Attendance> {
    const employeeId = this.getCurrentEmployeeId();
    return this.http.get<Attendance>(`${this.apiUrl}/today/${employeeId}`)
      .pipe(
        catchError((error: any) => {
          console.error('❌ Error loading today attendance:', error);
          throw error;
        })
      );
  }

  // ✅ FIXED: Employee attendance history (for specific employee)
  getEmployeeAttendanceHistory(employeeId: string, startDate: string, endDate: string): Observable<Attendance[]> {
    let params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    
    return this.http.get<Attendance[]>(`${this.apiUrl}/history/${employeeId}`, { params })
      .pipe(
        catchError((error: any) => {
          console.error('❌ Error loading attendance history:', error);
          throw error;
        })
      );
  }

  // ✅ FIXED: Get current user's attendance history
  getMyAttendanceHistory(startDate: string, endDate: string): Observable<Attendance[]> {
    const employeeId = this.getCurrentEmployeeId();
    return this.getEmployeeAttendanceHistory(employeeId, startDate, endDate);
  }

  // ✅ FIXED: Monthly attendance for specific employee
  getEmployeeMonthlyAttendance(employeeId: string, year: number, month: number): Observable<Attendance[]> {
    let params = new HttpParams()
      .set('year', year.toString())
      .set('month', month.toString());
    
    return this.http.get<Attendance[]>(`${this.apiUrl}/monthly/${employeeId}`, { params })
      .pipe(
        catchError((error: any) => {
          console.error('❌ Error loading monthly attendance:', error);
          throw error;
        })
      );
  }

  // ✅ FIXED: Get current user's monthly attendance
  getMyMonthlyAttendance(year: number, month: number): Observable<Attendance[]> {
    const employeeId = this.getCurrentEmployeeId();
    return this.getEmployeeMonthlyAttendance(employeeId, year, month);
  }

  // ✅ FIXED: Attendance by date (Admin)
  getAttendanceByDate(date: string): Observable<Attendance[]> {
    return this.http.get<Attendance[]>(`${this.apiUrl}/date/${date}`)
      .pipe(
        catchError((error: any) => {
          console.error('❌ Error loading attendance by date:', error);
          throw error;
        })
      );
  }

  // ✅ FIXED: Attendance summary for current user
  getMyAttendanceSummary(year: number, month: number): Observable<any> {
    const employeeId = this.getCurrentEmployeeId();
    return this.calculateAttendanceSummary(employeeId, year, month);
  }

  // ✅ FIXED: Calculate attendance summary with all parameters
  calculateAttendanceSummary(employeeId: string, year: number, month: number): Observable<any> {
    let params = new HttpParams()
      .set('year', year.toString())
      .set('month', month.toString());
    
    return this.http.get<any>(`${this.apiUrl}/summary/${employeeId}`, { params })
      .pipe(
        catchError((error: any) => {
          console.error('❌ Error calculating attendance summary:', error);
          throw error;
        })
      );
  }

  // ✅ NEW: Today's counts
  getTodayPresentCount(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/reports/today-present`)
      .pipe(
        catchError((error: any) => {
          console.error('❌ Error loading today present count:', error);
          throw error;
        })
      );
  }

  getTodayLateCount(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/reports/today-late`)
      .pipe(
        catchError((error: any) => {
          console.error('❌ Error loading today late count:', error);
          throw error;
        })
      );
  }

  getTodayAbsentCount(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/reports/today-absent`)
      .pipe(
        catchError((error: any) => {
          console.error('❌ Error loading today absent count:', error);
          throw error;
        })
      );
  }

  // ✅ FIXED: Manual check-in/out methods
  manualCheckIn(employeeId: string, checkInTime: string): Observable<Attendance> {
    let params = new HttpParams().set('checkInTime', checkInTime);
    return this.http.post<Attendance>(`${this.apiUrl}/manual/check-in/${employeeId}`, {}, { params })
      .pipe(
        catchError((error: any) => {
          console.error('❌ Error in manual check-in:', error);
          throw error;
        })
      );
  }

  manualCheckOut(employeeId: string, checkOutTime: string): Observable<Attendance> {
    let params = new HttpParams().set('checkOutTime', checkOutTime);
    return this.http.post<Attendance>(`${this.apiUrl}/manual/check-out/${employeeId}`, {}, { params })
      .pipe(
        catchError((error: any) => {
          console.error('❌ Error in manual check-out:', error);
          throw error;
        })
      );
  }

  // ✅ ADDED: Check if current user has employee record
  hasEmployeeRecord(): boolean {
    return this.authService.hasEmployeeRecord();
  }
}