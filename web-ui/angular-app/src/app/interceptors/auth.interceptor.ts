import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    constructor(
        private router: Router,
        private authService: AuthService
    ) {}

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const token = this.authService.getToken();
        
        if (token) {
            // Create headers object
            const headers: any = {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            };

            // Check if request is multipart/form-data
            const isMultipartForm = request.body instanceof FormData;
            
            // Only set Content-Type for non-multipart requests
            if (!isMultipartForm) {
                headers['Content-Type'] = 'application/json';
            }

            // Clone request with updated headers
            request = request.clone({
                setHeaders: headers,
                withCredentials: false // Prevent browser from showing auth popup
            });

            // Log request details for debugging
            console.debug('Request details:', {
                url: request.url,
                method: request.method,
                headers: request.headers.keys(),
                isMultipart: isMultipartForm
            });
        }

        return next.handle(request).pipe(
            catchError((error: HttpErrorResponse) => {
                console.error('Auth interceptor error:', error);
                
                if (error.status === 401) {
                    this.authService.logout();
                    this.router.navigate(['/login']);
                }
                return throwError(() => error);
            })
        );
    }
} 