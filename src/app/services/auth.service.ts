import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
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
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const savedUser = localStorage.getItem('currentUser');
    const token = localStorage.getItem('token');
    
    if (savedUser && token) {
      try {
        const user = JSON.parse(savedUser);
        // Verify token is still valid
        if (this.isTokenValid(token)) {
          user.token = token;
          this.currentUserSubject.next(user);
        } else {
          this.clearAuthData();
        }
      } catch (e) {
        this.clearAuthData();
      }
    }
  }

  private isTokenValid(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp > (Date.now() / 1000);
    } catch {
      return false;
    }
  }

login(loginData: LoginRequest): Observable<AuthResponse> {
  console.log('🔐 AuthService: Starting login process');
  console.log('🔐 Login endpoint:', `${this.apiUrl}/signin`);
  
  return this.http.post<AuthResponse>(`${this.apiUrl}/signin`, loginData)
    .pipe(
      tap(response => {
        console.log('✅ AuthService: Login API response received');
        console.log('✅ Response contains token:', !!response.token);
        console.log('✅ Full response:', response);
        
        const user: User = {
          id: response.id,
          username: response.username,
          email: response.email,
          fullName: response.fullName,
          roles: response.roles,
          token: response.token
        };
        
        console.log('💾 AuthService: About to store user data');
        this.setCurrentUser(user);
        
        // Verify storage worked
        setTimeout(() => {
          console.log('🔍 AuthService: Storage verification:');
          console.log('   - Token stored:', localStorage.getItem('token') !== null);
          console.log('   - User stored:', localStorage.getItem('currentUser') !== null);
          console.log('   - Current user subject updated:', this.currentUserSubject.value !== null);
        }, 50);
      }),
      catchError(error => {
        console.error('❌ AuthService: Login API error', error);
        let errorMessage = 'Login failed. Please check your credentials.';
        
        if (error.error && error.error.message) {
          errorMessage = error.error.message;
        }
        
        return throwError(() => new Error(errorMessage));
      })
    );
}

  signup(signupData: SignupRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/signup`, signupData)
      .pipe(
        catchError(error => {
          console.error('Signup error:', error);
          let errorMessage = 'Registration failed. Please try again.';
          
          if (error.error && error.error.message) {
            errorMessage = error.error.message;
          } else if (error.message) {
            errorMessage = error.message;
          }
          
          return throwError(() => new Error(errorMessage));
        })
      );
  }

private setCurrentUser(user: User): void {
  console.log('💾 setCurrentUser called with:', user);
  
  try {
    // Store in localStorage
    localStorage.setItem('currentUser', JSON.stringify(user));
    console.log('✅ User stored in localStorage');
    
    localStorage.setItem('token', user.token);
    console.log('✅ Token stored in localStorage');
    
    // Update BehaviorSubject
    this.currentUserSubject.next(user);
    console.log('✅ BehaviorSubject updated');
    
  } catch (error) {
    console.error('❌ Error in setCurrentUser:', error);
  }
}
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
  const token = this.getToken();
  if (!token) {
    console.log('🔐 No token found');
    return false;
  }

  try {
    // Decode the token payload
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000; // Current time in seconds
    
    console.log('🔐 Token expiration check:');
    console.log('   - Token expires at:', new Date(payload.exp * 1000));
    console.log('   - Current time:', new Date());
    console.log('   - Is expired?', payload.exp < currentTime);
    
    if (payload.exp < currentTime) {
      console.log('🔐 Token expired, logging out');
      this.logout();
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('🔐 Error decoding token:', error);
    this.logout();
    return false;
  }
}





// Also add this method for debugging
getTokenInfo(): any {
  const token = this.getToken();
  if (!token) return null;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      issuedAt: new Date(payload.iat * 1000),
      expiresAt: new Date(payload.exp * 1000),
      subject: payload.sub,
      roles: payload.roles || []
    };
  } catch (error) {
    return null;
  }
}

  // ✅ Renamed from isLoggedIn to isAuthenticated for consistency
  isLoggedIn(): boolean {
    return this.isAuthenticated();
  }

  logout(): void {
    this.clearAuthData();
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  private clearAuthData(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    localStorage.removeItem('user_role');
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    return user.roles.includes(role);
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

  // ✅ New method to refresh token (if you implement refresh tokens)
  refreshToken(): Observable<AuthResponse> {
    // Implement token refresh logic here if your backend supports it
    return throwError(() => new Error('Token refresh not implemented'));
  }
}