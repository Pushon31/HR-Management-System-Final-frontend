import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Department, DepartmentStatus } from '../models/department.model';

@Injectable({
  providedIn: 'root'
})
export class DepartmentService {
  private apiUrl = 'http://localhost:8080/api/departments';

  constructor(private http: HttpClient) {}

  // Create new department
  createDepartment(department: Department): Observable<Department> {
    return this.http.post<Department>(this.apiUrl, department);
  }

  // Get all departments
  getAllDepartments(): Observable<Department[]> {
    return this.http.get<Department[]>(this.apiUrl);
  }

  // Get department by ID
  getDepartmentById(id: number): Observable<Department> {
    return this.http.get<Department>(`${this.apiUrl}/${id}`);
  }

  // Get department by name
  getDepartmentByName(name: string): Observable<Department> {
    return this.http.get<Department>(`${this.apiUrl}/name/${name}`);
  }

  // Get department by code
  getDepartmentByCode(code: string): Observable<Department> {
    return this.http.get<Department>(`${this.apiUrl}/code/${code}`);
  }

  // Update department
  updateDepartment(id: number, department: Department): Observable<Department> {
    return this.http.put<Department>(`${this.apiUrl}/${id}`, department);
  }

  // Delete department
  deleteDepartment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Get departments by status
  getDepartmentsByStatus(status: DepartmentStatus): Observable<Department[]> {
    return this.http.get<Department[]>(`${this.apiUrl}/status/${status}`);
  }

  // Get departments by location
  getDepartmentsByLocation(location: string): Observable<Department[]> {
    return this.http.get<Department[]>(`${this.apiUrl}/location/${location}`);
  }

  // Assign department head
  assignDepartmentHead(departmentId: number, employeeId: number): Observable<Department> {
    return this.http.post<Department>(`${this.apiUrl}/${departmentId}/assign-head/${employeeId}`, {});
  }

  // Remove department head
  removeDepartmentHead(departmentId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${departmentId}/remove-head`);
  }

  // Get employee count
  getEmployeeCount(departmentId: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/${departmentId}/employee-count`);
  }
}