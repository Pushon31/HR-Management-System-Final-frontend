// attendance.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Attendance, AttendanceStatus, AttendanceSummary } from '../models/attendance.model';

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {
  private apiUrl = 'http://localhost:8080/api/attendance';

  constructor(private http: HttpClient) {}

  // Check-in
  checkIn(employeeId: string): Observable<Attendance> {
    return this.http.post<Attendance>(`${this.apiUrl}/check-in/${employeeId}`, {});
  }

  // Check-out
  checkOut(employeeId: string): Observable<Attendance> {
    return this.http.post<Attendance>(`${this.apiUrl}/check-out/${employeeId}`, {});
  }

  // Get today's attendance
  getTodayAttendance(employeeId: string): Observable<Attendance> {
    return this.http.get<Attendance>(`${this.apiUrl}/today/${employeeId}`);
  }

  // Get attendance by ID
  getAttendanceById(id: number): Observable<Attendance> {
    return this.http.get<Attendance>(`${this.apiUrl}/${id}`);
  }

  // Get all attendance records
  getAllAttendance(): Observable<Attendance[]> {
    return this.http.get<Attendance[]>(this.apiUrl);
  }

  // Get employee attendance history with date range
  getEmployeeAttendanceHistory(
    employeeId: string, 
    startDate: string, 
    endDate: string
  ): Observable<Attendance[]> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    
    return this.http.get<Attendance[]>(`${this.apiUrl}/history/${employeeId}`, { params });
  }

  // Get monthly attendance
  getMonthlyAttendance(employeeId: string, year: number, month: number): Observable<Attendance[]> {
    const params = new HttpParams()
      .set('year', year.toString())
      .set('month', month.toString());
    
    return this.http.get<Attendance[]>(`${this.apiUrl}/monthly/${employeeId}`, { params });
  }

  // Get attendance by date (for admin)
  getAttendanceByDate(date: string): Observable<Attendance[]> {
    return this.http.get<Attendance[]>(`${this.apiUrl}/date/${date}`);
  }

  // Get today's attendance by status
  getTodayAttendanceByStatus(status: AttendanceStatus): Observable<Attendance[]> {
    return this.http.get<Attendance[]>(`${this.apiUrl}/today/status/${status}`);
  }

  // Update attendance
  updateAttendance(id: number, attendance: Attendance): Observable<Attendance> {
    return this.http.put<Attendance>(`${this.apiUrl}/${id}`, attendance);
  }

  // Delete attendance
  deleteAttendance(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Reports
  getTodayPresentCount(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/reports/today-present`);
  }

  getTodayLateCount(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/reports/today-late`);
  }

  // Helper method to calculate attendance summary
  calculateAttendanceSummary(attendanceList: Attendance[]): AttendanceSummary {
    const employeeId = attendanceList[0]?.employeeId || '';
    const employeeName = attendanceList[0]?.employeeName || '';
    const departmentName = attendanceList[0]?.departmentName || '';

    const summary: AttendanceSummary = {
      employeeId,
      employeeName,
      departmentName,
      totalPresent: 0,
      totalAbsent: 0,
      totalLate: 0,
      totalHalfDay: 0,
      totalWorkingDays: attendanceList.length,
      attendancePercentage: 0
    };

    attendanceList.forEach(attendance => {
      switch (attendance.status) {
        case AttendanceStatus.PRESENT:
          summary.totalPresent++;
          break;
        case AttendanceStatus.ABSENT:
          summary.totalAbsent++;
          break;
        case AttendanceStatus.LATE:
          summary.totalLate++;
          break;
        case AttendanceStatus.HALF_DAY:
          summary.totalHalfDay++;
          break;
      }
    });

    summary.attendancePercentage = summary.totalWorkingDays > 0 
      ? (summary.totalPresent / summary.totalWorkingDays) * 100 
      : 0;

    return summary;
  }
}