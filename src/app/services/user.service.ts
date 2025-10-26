import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserResponse, CreateUserRequest, UpdateRolesRequest } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:8080/api/admin/users';

  constructor(private http: HttpClient) {}

  // Get all users
  getAllUsers(): Observable<UserResponse[]> {
    return this.http.get<UserResponse[]>(this.apiUrl);
  }

  // Update user roles
  updateUserRoles(userId: number, roleNames: string[]): Observable<any> {
    const request: UpdateRolesRequest = { roleNames };
    return this.http.put(`${this.apiUrl}/${userId}/roles`, request);
  }

  // Assign role to user
  assignRoleToUser(userId: number, roleName: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${userId}/roles/${roleName}`, {});
  }

  // Remove role from user
  removeRoleFromUser(userId: number, roleName: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${userId}/roles/${roleName}`);
  }

  // Get users by role
  getUsersByRole(roleName: string): Observable<UserResponse[]> {
    return this.http.get<UserResponse[]>(`${this.apiUrl}/role/${roleName}`);
  }

  // Create new user
  createUser(userData: CreateUserRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}`, userData);
  }

  // Update user
  updateUser(userId: number, userData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${userId}`, userData);
  }

  // Delete user
  deleteUser(userId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${userId}`);
  }

  // Activate user
  activateUser(userId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${userId}/activate`, {});
  }

  // Deactivate user
  deactivateUser(userId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${userId}/deactivate`, {});
  }

  // Get user by ID
  getUserById(userId: number): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.apiUrl}/${userId}`);
  }
}