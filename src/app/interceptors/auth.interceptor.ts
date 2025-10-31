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

// auth.interceptor.ts - More detailed debugging
intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
  console.log('🔄 AuthInterceptor: Processing request to', request.url);
  
  // Check what's in localStorage directly
  const storedToken = localStorage.getItem('token');
  const storedUser = localStorage.getItem('currentUser');
  
  console.log('🔍 Interceptor Debug:');
  console.log('   - Stored Token:', storedToken);
  console.log('   - Stored User:', storedUser);
  console.log('   - AuthService says authenticated:', this.authService.isAuthenticated());
  console.log('   - AuthService token:', this.authService.getToken());
  
  // Skip auth for login, signup, and public endpoints
  if (this.isPublicEndpoint(request.url)) {
    console.log('🔓 AuthInterceptor: Skipping auth for public endpoint');
    return next.handle(request);
  }

  // Add auth token for authenticated requests
  const token = this.authService.getToken();
  
  if (token && this.authService.isAuthenticated()) {
    console.log('🔑 AuthInterceptor: Adding token to request');
    console.log('🔑 Token being sent:', token.substring(0, 20) + '...');
    request = this.addTokenToRequest(request, token);
  } else {
    console.log('🚫 AuthInterceptor: No valid token found - sending request without auth header');
    // Don't add any auth header
  }

  return next.handle(request).pipe(
    catchError((error: HttpErrorResponse) => {
      console.log('❌ AuthInterceptor: HTTP Error', error.status, 'for', request.url);
      console.log('❌ Error details:', error);
      
      if (error.status === 401) {
        console.log('🔐 AuthInterceptor: 401 Unauthorized detected');
        console.log('🔐 Request URL:', request.url);
        console.log('🔐 Request Headers:', request.headers);
        return this.handleUnauthorizedError();
      }
      
      return throwError(() => error);
    })
  );
}
  private isPublicEndpoint(url: string): boolean {
    const publicEndpoints = [
      '/auth/signin',
      '/auth/signup',
      '/assets/',
      '.json'
    ];
    return publicEndpoints.some(endpoint => url.includes(endpoint));
  }

  private addTokenToRequest(request: HttpRequest<any>, token: string): HttpRequest<any> {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  private handleUnauthorizedError(): Observable<never> {
    console.log('🚪 AuthInterceptor: Performing logout due to authentication failure');
    
    // Clear auth data
    this.authService.logout();
    
    // Navigate to login with return URL
    const currentUrl = this.router.url;
    this.router.navigate(['/login'], { 
      queryParams: { 
        returnUrl: currentUrl,
        error: 'session_expired'
      } 
    });
    
    return throwError(() => new Error('Authentication failed. Please login again.'));
  }
}