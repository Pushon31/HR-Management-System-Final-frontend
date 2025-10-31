// import { Injectable } from '@angular/core';
// import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
// import { Observable, throwError } from 'rxjs';
// import { catchError } from 'rxjs/operators';
// import { Router } from '@angular/router';
// import { AuthService } from '../services/auth.service';

// @Injectable()
// export class ErrorInterceptor implements HttpInterceptor {

//   constructor(
//     private router: Router,
//     private authService: AuthService
//   ) {}

//   intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
//     return next.handle(request).pipe(
//       catchError((error: HttpErrorResponse) => {
//         let errorMessage = 'An error occurred';
        
//         if (error.error instanceof ErrorEvent) {
//           // Client-side error
//           errorMessage = error.error.message;
//         } else {
//           // Server-side error
//           switch (error.status) {
//             case 400:
//               errorMessage = error.error?.message || 'Bad Request';
//               break;
//             case 401:
//               errorMessage = error.error?.message || 'Unauthorized access';
//               // Don't redirect here - let AuthInterceptor handle it to avoid double redirects
//               console.log('ErrorInterceptor: 401 detected - letting AuthInterceptor handle redirect');
//               break;
//             case 403:
//               errorMessage = 'Access forbidden';
//               // Show access denied message but don't redirect to login
//               this.showErrorMessage('You do not have permission to access this resource.');
//               break;
//             case 404:
//               errorMessage = 'Resource not found';
//               break;
//             case 500:
//               errorMessage = 'Internal server error';
//               break;
//             default:
//               errorMessage = error.error?.message || error.message;
//           }
//         }
        
//         console.error('HTTP Error:', errorMessage, error);
        
//         // Only throw error without redirecting for 401
//         if (error.status !== 401) {
//           return throwError(() => new Error(errorMessage));
//         } else {
//           return throwError(() => error); // Pass the original error for AuthInterceptor
//         }
//       })
//     );
//   }

//   private showErrorMessage(message: string): void {
//     // You can implement a toast service or use alert for now
//     alert(message);
//   }
// }


import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'An error occurred';
        
        if (error.error instanceof ErrorEvent) {
          // Client-side error
          errorMessage = error.error.message;
        } else {
          // Server-side error
          switch (error.status) {
            case 400:
              errorMessage = error.error?.message || 'Bad Request';
              break;
            case 401:
              errorMessage = error.error?.message || 'Unauthorized access';
              console.log('🔐 ErrorInterceptor: 401 detected - letting AuthInterceptor handle');
              // Let AuthInterceptor handle 401 errors
              break;
            case 403:
              errorMessage = 'Access forbidden';
              this.showErrorMessage('You do not have permission to access this resource.');
              break;
            case 404:
              errorMessage = 'Resource not found';
              break;
            case 500:
              errorMessage = 'Internal server error';
              break;
            default:
              errorMessage = error.error?.message || error.message;
          }
        }
        
        console.error('❌ HTTP Error:', errorMessage, error);
        
        // Don't handle 401 here - let AuthInterceptor handle it
        if (error.status !== 401) {
          return throwError(() => new Error(errorMessage));
        } else {
          return throwError(() => error);
        }
      })
    );
  }

  private showErrorMessage(message: string): void {
    // You can use a toast service here
    console.error('💬 Error Message:', message);
    alert(message);
  }
}