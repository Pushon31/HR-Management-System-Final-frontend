import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { User, CreateUserRequest, UserResponse, UpdateRolesRequest } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:8080/api/users';
  private authUrl = 'http://localhost:8080/api/auth';

  constructor(private http: HttpClient) {}

  // ✅ IMPROVED: Better error handling for getAllUsers
  getAllUsers(): Observable<UserResponse[]> {
    console.log('🔄 UserService: Fetching all users from', this.apiUrl);
    
    return this.http.get<UserResponse[]>(this.apiUrl).pipe(
      catchError((error) => {
        console.error('❌ UserService: Failed to load users', error);
        
        let errorMessage = 'Failed to load users';
        if (error.status === 401) {
          errorMessage = 'Authentication failed. Please login again.';
        } else if (error.status === 403) {
          errorMessage = 'You do not have permission to view users.';
        } else if (error.status === 0) {
          errorMessage = 'Cannot connect to server. Please check your connection.';
        }
        
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  createUser(userData: CreateUserRequest): Observable<any> {
    console.log('🔄 Creating user with data:', userData);
    return this.http.post(`${this.authUrl}/signup`, userData).pipe(
      catchError((error) => {
        console.error('❌ UserService: Failed to create user', error);
        return throwError(() => error);
      })
    );
  }

  getUserById(id: number): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.apiUrl}/${id}`).pipe(
      catchError((error) => {
        console.error('❌ UserService: Failed to get user', error);
        return throwError(() => error);
      })
    );
  }

  updateUser(id: number, userData: any): Observable<UserResponse> {
    return this.http.put<UserResponse>(`${this.apiUrl}/${id}`, userData);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  updateUserRoles(id: number, roles: UpdateRolesRequest): Observable<UserResponse> {
    return this.http.put<UserResponse>(`${this.apiUrl}/${id}/roles`, roles);
  }

  deactivateUser(id: number): Observable<UserResponse> {
    return this.http.put<UserResponse>(`${this.apiUrl}/${id}/deactivate`, {});
  }

  activateUser(id: number): Observable<UserResponse> {
    return this.http.put<UserResponse>(`${this.apiUrl}/${id}/activate`, {});
  }

  createEmployeeForUser(userId: number): Observable<any> {
    return this.http.post(`${this.authUrl}/create-employee/${userId}`, {});
  }

  getUserWithEmployee(username: string): Observable<any> {
    return this.http.get(`${this.authUrl}/user-with-employee/${username}`);
  }
}