import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // ✅ FIX: Check if user is logged in first
    if (!this.authService.isLoggedIn()) {
      return next.handle(request);
    }

    // Add auth header with jwt token if available
    const token = this.authService.getToken();
    
    // Skip auth for login and signup requests
    if (request.url.includes('/auth/signin') || request.url.includes('/auth/signup')) {
      return next.handle(request);
    }

    // ✅ FIX: Always add token if user is logged in
    if (token && this.authService.isLoggedIn()) {
      request = this.addToken(request, token);
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        console.log('AuthInterceptor: HTTP Error', error.status, error.url);
        
        if (error.status === 401) {
          return this.handle401Error(request, next);
        }
        return throwError(() => error);
      })
    );
  }

  private addToken(request: HttpRequest<any>, token: string) {
    console.log('AuthInterceptor: Adding token to request', request.url);
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      console.log('AuthInterceptor: 401 Unauthorized - Logging out');
      
      // For now, just logout the user since we don't have refresh token implemented
      this.authService.logout();
      this.router.navigate(['/login']);
      return throwError(() => new Error('Session expired. Please login again.'));
    }

    return this.refreshTokenSubject.pipe(
      filter(token => token !== null),
      take(1),
      switchMap(token => next.handle(this.addToken(request, token)))
    );
  }
}