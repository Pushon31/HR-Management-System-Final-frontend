import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {

  private totalRequests = 0;

  constructor() {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    this.totalRequests++;
    // You can implement a loading service here to show/hide global loader
    // For now, we'll just log the request
    console.log('HTTP Request started:', request.method, request.url);

    return next.handle(request).pipe(
      finalize(() => {
        this.totalRequests--;
        console.log('HTTP Request completed:', request.method, request.url);
        if (this.totalRequests === 0) {
          // All requests completed
        }
      })
    );
  }
}