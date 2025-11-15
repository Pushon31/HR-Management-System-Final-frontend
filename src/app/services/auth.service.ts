import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { EmployeeService } from './employee.service';

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
  employeeId?: string;  // ✅ ADDED: Employee ID field
}

export interface AuthResponse {
  token: string;
  type: string;
  id: number;
  username: string;
  email: string;
  fullName: string;
  roles: string[];
  employeeId?: string;  // ✅ ADDED: Employee ID field
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
    private router: Router,
    private employeeService: EmployeeService
  ) {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const savedUser = localStorage.getItem('currentUser');
    const token = localStorage.getItem('token');

    if (savedUser && token) {
      try {
        const user = JSON.parse(savedUser);
        if (this.isTokenValid(token)) {
          user.token = token;
          this.currentUserSubject.next(user);
          console.log('✅ User loaded from storage:', user.username);
        } else {
          console.log('❌ Token expired, clearing storage');
          this.clearAuthData();
        }
      } catch (e) {
        console.error('❌ Error parsing stored user:', e);
        this.clearAuthData();
      }
    }
  }

  hasEmployeeRecord(id?: number): boolean {

    console.log("get" + id);


    const employeeId: string = this.getEmployeeIds(id!) || '';
    console.log("sdfsdt" + employeeId);


    const hasRecord = true
    console.log('🔍 Employee record check:', {
      hasRecord,
      employeeId,
      username: this.getCurrentUser()?.username
    });
    return hasRecord;
  }

  private isTokenValid(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp > currentTime;
    } catch {
      return false;
    }
  }

  login(loginData: LoginRequest): Observable<AuthResponse> {
    console.log('🔐 AuthService: Starting login process for:', loginData.username);

    return this.http.post<AuthResponse>(`${this.apiUrl}/signin`, loginData)
      .pipe(
        tap(response => {
          console.log('✅ AuthService: Login API response received');
          console.log('✅ User roles:', response.roles);
          console.log('✅ Employee ID:', response.employeeId); // ✅ ADDED

          const user: User = {
            id: response.id,
            username: response.username,
            email: response.email,
            fullName: response.fullName,
            roles: response.roles,
            token: response.token,
            employeeId: response.employeeId // ✅ ADDED
          };

          this.setCurrentUser(user);
          console.log('✅ Login successful for user:', user.username);
        }),
        catchError(error => {
          console.error('❌ AuthService: Login API error', error);
          let errorMessage = 'Login failed. Please check your credentials.';

          if (error.error && error.error.message) {
            errorMessage = error.error.message;
          } else if (error.status === 401) {
            errorMessage = 'Invalid username or password.';
          } else if (error.status === 0) {
            errorMessage = 'Cannot connect to server. Please check your connection.';
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
    try {
      // Store in localStorage
      localStorage.setItem('currentUser', JSON.stringify({
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        roles: user.roles,
        employeeId: user.employeeId // ✅ ADDED
      }));
      localStorage.setItem('token', user.token);

      // Update BehaviorSubject
      this.currentUserSubject.next(user);

      console.log('✅ User stored successfully:', user.username);
    } catch (error) {
      console.error('❌ Error storing user data:', error);
    }
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getToken(): string | null {
    // Check both service state and localStorage
    const storedToken = localStorage.getItem('token');
    console.log('🔐 getToken():', storedToken ? 'Found in storage' : 'Not in storage');
    return storedToken;
  }

  isAuthenticated(): boolean {
    const token = this.getToken();

    if (!token) {
      console.log('🔐 isAuthenticated(): No token found');
      return false;
    }

    try {
      // Decode token to check expiry
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      const isExpired = payload.exp < currentTime;

      console.log('🔐 Token validation details:');
      console.log('   - Token issued:', new Date(payload.iat * 1000));
      console.log('   - Token expires:', new Date(payload.exp * 1000));
      console.log('   - Current time:', new Date(currentTime * 1000));
      console.log('   - Time until expiry:', (payload.exp - currentTime).toFixed(0) + ' seconds');
      console.log('   - Is expired:', isExpired);

      if (isExpired) {
        console.log('🔐 Token expired, clearing auth data');
        this.clearAuthData();
        return false;
      }

      console.log('🔐 Token is valid');
      return true;
    } catch (error) {
      console.error('🔐 Error decoding token:', error);
      console.log('🔐 Token might be malformed, clearing auth data');
      this.clearAuthData();
      return false;
    }
  }

  isTokenLikelyValid(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp > currentTime;
    } catch {
      return false;
    }
  }
  // Make sure clearAuthData is properly implemented
  private clearAuthData(): void {
    console.log('🧹 Clearing auth data from storage');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
  }
  isLoggedIn(): boolean {
    return this.isAuthenticated();
  }

  // ✅ UPDATED: Get employee ID from user data
  getEmployeeId(): string | null {
    const user = this.getCurrentUser();
    if (!user) {
      this.employeeService.getEmployeeById(user!.id).subscribe((x) => {

        console.log(x);
        console.log(x.employeeId);


        return x.employeeId;


      })

    }

    return user?.employeeId || null;
  }


  getEmployeeIds(id: number): string | null {



    let empId: string | undefined;

    this.employeeService.getEmployeeById(id).subscribe((x) => {

      console.log(x, '-----------------val-----------------------');
      console.log(x.employeeId, '-----------------val2-----------------------');

      empId = x.employeeId

      return empId;

    });


    return empId || null;


  }

  getUserRole(): string {
    const user = this.getCurrentUser();
    if (!user) return '';

    const roleMap: { [key: string]: string } = {
      'ROLE_ADMIN': 'admin',
      'ROLE_MANAGER': 'manager',
      'ROLE_HR': 'hr',
      'ROLE_ACCOUNTANT': 'accountant',
      'ROLE_EMPLOYEE': 'employee'
    };

    const priorityOrder = ['ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_HR', 'ROLE_ACCOUNTANT', 'ROLE_EMPLOYEE'];

    for (const role of priorityOrder) {
      if (user.roles.includes(role)) {
        return roleMap[role] || 'employee';
      }
    }

    return 'employee';
  }



  getBaseRoute(): string {
    const role = this.getUserRole();

    if (role === 'admin') {
      return 'admin';
    } else if (role === 'manager' || role === 'hr' || role === 'accountant') {
      return 'manager';
    } else {
      return 'employee';
    }
  }

  redirectBasedOnRole(): void {
    const role = this.getUserRole();
    console.log('🔄 Redirecting user with role:', role);

    const routes: { [key: string]: string } = {
      'admin': '/admin/dashboard',
      'manager': '/manager/dashboard',
      'hr': '/hr/dashboard',
      'accountant': '/accountant/dashboard',
      'employee': '/employee/dashboard'
    };

    const route = routes[role] || '/login';
    this.router.navigate([route]);
  }

  logout(): void {
    console.log('👋 Logging out user');
    this.clearAuthData();
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }



  //   getEmployeeInfo(): { hasEmployee: boolean; employeeId: string | null; user: any } {
  //   return {
  //     hasEmployee: this.hasEmployeeRecord(),
  //     employeeId: this.getEmployeeId(),
  //     user: this.getCurrentUser()
  //   };
  // }

  getEmployeeInfo(): { employeeId: string | null; user: any } {
    return {
      employeeId: this.getEmployeeId(),
      user: this.getCurrentUser()
    };
  }
  // ✅ ADDED: Get user info with employee data
  getUserInfo(): any {
    const user = this.getCurrentUser();
    const token = this.getToken();

    return {
      user: user,
      employeeId: this.getEmployeeId(),
      hasEmployee: this.hasEmployeeRecord(),
      tokenInfo: token ? this.getTokenInfo() : null,
      isAuthenticated: this.isAuthenticated(),
      userRole: this.getUserRole(),
      baseRoute: this.getBaseRoute()
    };
  }

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

  hasAnyRole(roles: string[]): boolean {
    return roles.some(role => this.hasRole(role));
  }

  getAllUserRoles(): string[] {
    const user = this.getCurrentUser();
    return user ? user.roles : [];
  }

  isAdmin(): boolean {
    return this.hasRole('admin');
  }

  isManagerOrAbove(): boolean {
    return this.hasRole('manager') || this.hasRole('admin');
  }

  isHrOrAbove(): boolean {
    return this.hasRole('hr') || this.hasRole('admin');
  }

  isAccountantOrAbove(): boolean {
    return this.hasRole('accountant') || this.hasRole('admin');
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    if (!user || !user.roles) {
      console.log('🔍 AuthService: No user or roles found');
      return false;
    }

    console.log('🔍 AuthService: Checking role', role, 'in user roles:', user.roles);

    // Handle both role formats: 'admin' and 'ROLE_ADMIN'
    const roleFormats = [
      role, // original format ('admin')
      `ROLE_${role.toUpperCase()}`, // convert 'admin' to 'ROLE_ADMIN'
      role.toUpperCase() // convert 'admin' to 'ADMIN'
    ];

    const roleMapping: { [key: string]: string[] } = {
      'admin': ['ROLE_ADMIN'],
      'manager': ['ROLE_MANAGER', 'ROLE_ADMIN'],
      'hr': ['ROLE_HR', 'ROLE_ADMIN'],
      'accountant': ['ROLE_ACCOUNTANT', 'ROLE_ADMIN'],
      'employee': ['ROLE_EMPLOYEE', 'ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_HR', 'ROLE_ACCOUNTANT']
    };

    // Get allowed roles for the requested role
    const allowedRoles = roleMapping[role] || [];

    // Check if user has any of the allowed roles OR any of the role formats
    const hasRole = user.roles.some(userRole =>
      allowedRoles.includes(userRole) ||
      roleFormats.includes(userRole)
    );

    console.log('🔍 AuthService: Role check result:', hasRole);
    console.log('🔍 Allowed roles:', allowedRoles);
    console.log('🔍 Role formats:', roleFormats);

    return hasRole;
  }

  // Or create a separate method for role checking with the role string format you're using
  hasRoleString(roleString: string): boolean {
    const user = this.getCurrentUser();
    return user ? user.roles.includes(roleString) : false;
  }
}