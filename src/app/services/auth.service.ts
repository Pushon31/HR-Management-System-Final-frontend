import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs'; // ✅ Added throwError
import { tap, catchError, map } from 'rxjs/operators'; // ✅ Added catchError and map
import { Router } from '@angular/router';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface SignupRequest {
  username: string;
  email: string;
  fullName: string;
  password: string;
  roles: string[];
}

export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  roles: string[];
  token: string;
}

export interface AuthResponse {
  token: string;
  type: string;
  id: number;
  username: string;
  email: string;
  fullName: string;
  roles: string[];
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Check if user data exists in localStorage on service initialization
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      this.currentUserSubject.next(JSON.parse(savedUser));
    }
  }

  login(loginData: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/signin`, loginData)
      .pipe(
        tap(response => {
          const user: User = {
            id: response.id,
            username: response.username,
            email: response.email,
            fullName: response.fullName,
            roles: response.roles,
            token: response.token
          };
          this.setCurrentUser(user); // ✅ This will be fixed below
        })
      );
  }

  signup(signupData: SignupRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/signup`, signupData)
      .pipe(
        catchError(error => { // ✅ Now catchError is available
          console.error('Signup error:', error);
          
          let errorMessage = 'Registration failed. Please try again.';
          
          if (error.error && error.error.message) {
            errorMessage = error.error.message;
          } else if (error.message) {
            errorMessage = error.message;
          }
          
          return throwError(() => new Error(errorMessage)); // ✅ Now throwError is available
        })
      );
  }

  // ✅ ADD THE MISSING setCurrentUser METHOD
  private setCurrentUser(user: User): void {
    // Store user data in localStorage
    localStorage.setItem('currentUser', JSON.stringify(user));
    localStorage.setItem('token', user.token);
    this.currentUserSubject.next(user);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const isExpired = payload.exp < (Date.now() / 1000);
      
      if (isExpired) {
        this.logout();
        return false;
      }
      
      return true;
    } catch (e) {
      this.logout();
      return false;
    }
  }

  logout(): void {
    // Remove user data from localStorage
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user ? user.roles.includes(role) : false;
  }

  getBaseRoute(): string {
    const user = this.getCurrentUser();
    if (!user) return 'login';

    if (this.hasRole('ROLE_ADMIN')) {
      return 'admin';
    } else if (this.hasRole('ROLE_MANAGER') || this.hasRole('ROLE_HR') || this.hasRole('ROLE_ACCOUNTANT')) {
      return 'manager';
    } else {
      return 'employee';
    }
  }
}