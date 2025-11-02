import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    console.log('🔄 AuthInterceptor: Processing request to', request.url);
    
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('currentUser');
    
    console.log('🔍 Direct Storage Check:');
    console.log('   - Token in storage:', token ? 'Present' : 'Missing');
    console.log('   - User in storage:', user ? 'Present' : 'Missing');
    
    // ✅ Check if token is likely valid before using it
    if (token && this.authService.isTokenLikelyValid()) {
      console.log('🔑 AuthInterceptor: Adding valid token to request');
      const authRequest = this.addTokenToRequest(request, token);
      return next.handle(authRequest).pipe(
        catchError((error: HttpErrorResponse) => {
          return this.handleError(error, request, next);
        })
      );
    } else if (token) {
      console.log('⚠️ AuthInterceptor: Token exists but appears invalid/expired');
      // Don't add the token, but don't logout yet - let server decide
      return next.handle(request).pipe(
        catchError((error: HttpErrorResponse) => {
          return this.handleError(error, request, next);
        })
      );
    } else {
      console.log('🚫 AuthInterceptor: No token in storage, proceeding without auth');
      return next.handle(request).pipe(
        catchError((error: HttpErrorResponse) => {
          return this.handleError(error, request, next);
        })
      );
    }
  }

  private addTokenToRequest(request: HttpRequest<any>, token: string): HttpRequest<any> {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  private handleError(error: HttpErrorResponse, request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    console.log('❌ AuthInterceptor: HTTP Error', error.status, 'for', request.url);
    
    if (error.status === 401) {
      console.log('🔐 AuthInterceptor: 401 Unauthorized detected');
      
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('currentUser');
      
      console.log('🔐 Storage state during 401:');
      console.log('   - Token:', token ? 'Present' : 'Missing');
      console.log('   - User:', user ? 'Present' : 'Missing');
      
      if (token && user) {
        console.log('🔐 Token exists but server rejected it - checking validity');
        
        // ✅ Check if token is actually expired on client side
        if (this.isTokenExpired(token)) {
          console.log('🔐 Token is expired on client side - logging out');
          this.performLogout('Your session has expired. Please login again.');
        } else {
          console.log('🔐 Token not expired on client side - might be server issue or invalid token');
          console.log('🔐 Not logging out immediately - letting component handle');
          // Don't logout - let the component decide what to do
          // This could be a permission issue rather than authentication issue
        }
      } else {
        console.log('🔐 No auth data in storage - redirecting to login');
        this.performLogout('Please login to continue.');
      }
    }
    
    return throwError(() => error);
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch {
      return true;
    }
  }

  private performLogout(message: string): void {
    console.log('🚪 Performing logout:', message);
    this.authService.logout();
    
    const currentUrl = this.router.url;
    this.router.navigate(['/login'], { 
      queryParams: { 
        returnUrl: currentUrl,
        error: 'session_expired'
      } 
    });
  }
}