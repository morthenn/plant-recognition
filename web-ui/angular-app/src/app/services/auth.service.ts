import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { LoginRequest, RegisterRequest, AuthResponse, User } from '../models/auth.model';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private currentUserSubject = new BehaviorSubject<User | null>(null);
    public currentUser$ = this.currentUserSubject.asObservable();
    private tokenKey = 'token';
    private tokenRefreshTimeout: any;

    constructor(
        private http: HttpClient,
        private router: Router
    ) {
        this.loadStoredUser();
    }

    private loadStoredUser(): void {
        const token = this.getToken();
        if (token) {
            const user = this.getUserFromToken(token);
            if (user) {
                this.currentUserSubject.next(user);
                this.scheduleTokenRefresh(token);
            } else {
                this.clearAuth();
            }
        }
    }

    login(request: LoginRequest): Observable<AuthResponse> {
        const headers = new HttpHeaders()
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json');

        return this.http.post<AuthResponse>(`${environment.authUrl}/authenticate`, request, { headers })
            .pipe(
                tap(response => {
                    this.setToken(response.token);
                    this.currentUserSubject.next({
                        username: response.username,
                        role: response.role
                    });
                    this.scheduleTokenRefresh(response.token);
                }),
                catchError(this.handleError.bind(this))
            );
    }

    register(request: RegisterRequest): Observable<AuthResponse> {
        const headers = new HttpHeaders()
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json');

        return this.http.post<AuthResponse>(`${environment.authUrl}/register`, request, { headers })
            .pipe(
                catchError(this.handleError.bind(this))
            );
    }

    logout(): void {
        this.clearAuth();
        this.router.navigate(['/login']);
    }

    private clearAuth(): void {
        localStorage.removeItem(this.tokenKey);
        sessionStorage.clear();
        this.currentUserSubject.next(null);
        if (this.tokenRefreshTimeout) {
            clearTimeout(this.tokenRefreshTimeout);
        }
    }

    getToken(): string | null {
        const token = localStorage.getItem(this.tokenKey);
        if (token && this.isTokenValid(token)) {
            return token;
        }
        this.clearAuth();
        return null;
    }

    private setToken(token: string): void {
        localStorage.setItem(this.tokenKey, token);
    }

    isAuthenticated(): boolean {
        const token = this.getToken();
        return token !== null && this.isTokenValid(token);
    }

    private isTokenValid(token: string): boolean {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            // Add 5 minute buffer for token expiration
            return payload.exp * 1000 > (Date.now() + 5 * 60 * 1000);
        } catch (e) {
            console.error('Error validating token:', e);
            return false;
        }
    }

    private scheduleTokenRefresh(token: string): void {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const expiresIn = payload.exp * 1000 - Date.now();
            // Refresh 5 minutes before expiration
            const refreshTime = expiresIn - (5 * 60 * 1000);
            
            if (this.tokenRefreshTimeout) {
                clearTimeout(this.tokenRefreshTimeout);
            }

            if (refreshTime > 0) {
                this.tokenRefreshTimeout = setTimeout(() => {
                    console.debug('Token refresh needed');
                    this.clearAuth();
                    this.router.navigate(['/login']);
                }, refreshTime);
            }
        } catch (e) {
            console.error('Error scheduling token refresh:', e);
        }
    }

    private getUserFromToken(token: string): User | null {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            if (!this.isTokenValid(token)) {
                return null;
            }
            return {
                username: payload.sub,
                role: payload.role || 'USER'
            };
        } catch (e) {
            console.error('Error parsing token:', e);
            return null;
        }
    }

    private handleError(error: HttpErrorResponse) {
        console.error('Auth error:', error);
        if (error.status === 401 || error.status === 403) {
            this.clearAuth();
        }
        
        let errorMessage = 'An error occurred';
        if (error.error instanceof ErrorEvent) {
            errorMessage = error.error.message;
        } else {
            if (error.status === 401) {
                errorMessage = 'Invalid credentials';
            } else if (error.status === 403) {
                errorMessage = 'Access denied';
            } else if (error.status === 400) {
                errorMessage = error.error?.message || 'Invalid request';
            } else if (error.status === 404) {
                errorMessage = 'Service not found';
            }
        }
        return throwError(() => new Error(errorMessage));
    }
} 