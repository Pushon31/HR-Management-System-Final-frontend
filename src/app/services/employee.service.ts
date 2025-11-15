import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, Observable, of } from 'rxjs';
import { Employee, EmployeeType, EmployeeStatus, EmployeeWorkType } from '../models/employee.model';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private apiUrl = 'http://localhost:8080/api/employees';

  constructor(private http: HttpClient) {}

  // Create new employee
  createEmployee(employee: Employee): Observable<Employee> {
  return this.http.post<Employee>(this.apiUrl, employee).pipe(
    catchError((error: any) => {
      console.error('Error creating employee:', error);
      if (error.status === 401) {
        // Redirect to login or show message
        alert('Your session has expired. Please login again.');
        // You can also redirect to login page
        // this.router.navigate(['/login']);
      }
      throw error;
    })
  );
}

  // Get all employees
  getAllEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(this.apiUrl);
  }
  

  // Get employee by ID


    getEmployeeById(userId: number): Observable<Employee> {
    return this.http.get<Employee>(`${this.apiUrl}/user/${userId}`);
  }

  

  // Get employee by employee ID
  getEmployeeByEmployeeId(employeeId: any): Observable<Employee> {
    return this.http.get<Employee>(`${this.apiUrl}/employee-id/${employeeId}`);
  }

  // Update employee
  updateEmployee(id: number, employee: Employee): Observable<Employee> {
    return this.http.put<Employee>(`${this.apiUrl}/${id}`, employee);
  }

  // Delete employee
  deleteEmployee(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Get employees by department
  getEmployeesByDepartment(departmentId: number): Observable<Employee[]> {
    return this.http.get<Employee[]>(`${this.apiUrl}/department/${departmentId}`);
  }

  // Get employees by type
  getEmployeesByType(employeeType: EmployeeType): Observable<Employee[]> {
    return this.http.get<Employee[]>(`${this.apiUrl}/type/${employeeType}`);
  }

  // Get employees by designation
  getEmployeesByDesignation(designation: string): Observable<Employee[]> {
    return this.http.get<Employee[]>(`${this.apiUrl}/designation/${designation}`);
  }

  // Get employees by status
  getEmployeesByStatus(status: EmployeeStatus): Observable<Employee[]> {
    return this.http.get<Employee[]>(`${this.apiUrl}/status/${status}`);
  }

  // Get manager's team
  getManagerTeam(managerId: number): Observable<Employee[]> {
    return this.http.get<Employee[]>(`${this.apiUrl}/manager/${managerId}/team`);
  }

  // Get work type statistics
getWorkTypeStats(): Observable<any> {  // Changed from Map<EmployeeWorkType, number> to any
  return this.http.get<any>(`${this.apiUrl}/worktype/stats`).pipe(
    catchError((error: any) => {
      console.error('Error loading work type stats:', error);
      // Return a default object instead of Map
      return of({
        'ONSITE': 0,
        'REMOTE': 0,
        'HYBRID': 0
      });
    })
  );
}
}