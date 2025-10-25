import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserResponse } from '../models/user.model';

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
    return this.http.put(`${this.apiUrl}/${userId}/roles`, { roleNames });
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
}