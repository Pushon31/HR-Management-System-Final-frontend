import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Employee, EmployeeType, EmployeeStatus, EmployeeWorkType } from '../models/employee.model';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private apiUrl = 'http://localhost:8080/api/employees';

  constructor(private http: HttpClient) {}

  // Create new employee
  createEmployee(employee: Employee): Observable<Employee> {
    return this.http.post<Employee>(this.apiUrl, employee);
  }

  // Get all employees
  getAllEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(this.apiUrl);
  }

  // Get employee by ID
  getEmployeeById(id: number): Observable<Employee> {
    return this.http.get<Employee>(`${this.apiUrl}/${id}`);
  }

  // Get employee by employee ID
  getEmployeeByEmployeeId(employeeId: string): Observable<Employee> {
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
  getWorkTypeStats(): Observable<Map<EmployeeWorkType, number>> {
    return this.http.get<Map<EmployeeWorkType, number>>(`${this.apiUrl}/worktype/stats`);
  }
}