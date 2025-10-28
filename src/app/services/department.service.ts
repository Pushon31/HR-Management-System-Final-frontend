import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Department, DepartmentStatus } from '../models/department.model';

@Injectable({
  providedIn: 'root'
})
export class DepartmentService {
  private apiUrl = 'http://localhost:8080/api/departments';

  constructor(private http: HttpClient) {}

  // Create new department
  createDepartment(department: Department): Observable<Department> {
    return this.http.post<Department>(this.apiUrl, department).pipe(
      catchError((error: any) => {
        console.error('Error creating department:', error);
        throw error;
      })
    );
  }

  // Get all departments
  getAllDepartments(): Observable<Department[]> {
    return this.http.get<Department[]>(this.apiUrl).pipe(
      catchError((error: any) => {
        console.error('Error loading departments:', error);
        return of([]);
      })
    );
  }

  // Get department by ID
  getDepartmentById(id: number): Observable<Department> {
    return this.http.get<Department>(`${this.apiUrl}/${id}`).pipe(
      catchError((error: any) => {
        console.error(`Error loading department with ID ${id}:`, error);
        throw error;
      })
    );
  }

  // Get department by name
  getDepartmentByName(name: string): Observable<Department> {
    return this.http.get<Department>(`${this.apiUrl}/name/${name}`).pipe(
      catchError((error: any) => {
        console.error(`Error loading department with name ${name}:`, error);
        throw error;
      })
    );
  }

  // Get department by code
  getDepartmentByCode(code: string): Observable<Department> {
    return this.http.get<Department>(`${this.apiUrl}/code/${code}`).pipe(
      catchError((error: any) => {
        console.error(`Error loading department with code ${code}:`, error);
        throw error;
      })
    );
  }

  // Update department
  updateDepartment(id: number, department: Department): Observable<Department> {
    return this.http.put<Department>(`${this.apiUrl}/${id}`, department).pipe(
      catchError((error: any) => {
        console.error(`Error updating department with ID ${id}:`, error);
        throw error;
      })
    );
  }

  // Delete department
  deleteDepartment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError((error: any) => {
        console.error(`Error deleting department with ID ${id}:`, error);
        throw error;
      })
    );
  }

  // Get departments by status
  getDepartmentsByStatus(status: DepartmentStatus): Observable<Department[]> {
    return this.http.get<Department[]>(`${this.apiUrl}/status/${status}`).pipe(
      catchError((error: any) => {
        console.error(`Error loading departments with status ${status}:`, error);
        return of([]);
      })
    );
  }

  // Get departments by location
  getDepartmentsByLocation(location: string): Observable<Department[]> {
    return this.http.get<Department[]>(`${this.apiUrl}/location/${location}`).pipe(
      catchError((error: any) => {
        console.error(`Error loading departments in location ${location}:`, error);
        return of([]);
      })
    );
  }

  // Assign department head
  assignDepartmentHead(departmentId: number, employeeId: number): Observable<Department> {
    return this.http.post<Department>(`${this.apiUrl}/${departmentId}/assign-head/${employeeId}`, {}).pipe(
      catchError((error: any) => {
        console.error(`Error assigning head to department ${departmentId}:`, error);
        throw error;
      })
    );
  }

  // Remove department head
  removeDepartmentHead(departmentId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${departmentId}/remove-head`).pipe(
      catchError((error: any) => {
        console.error(`Error removing head from department ${departmentId}:`, error);
        throw error;
      })
    );
  }

  // Get employee count
  getEmployeeCount(departmentId: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/${departmentId}/employee-count`).pipe(
      catchError((error: any) => {
        console.error(`Error getting employee count for department ${departmentId}:`, error);
        return of(0);
      })
    );
  }
}