import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

describe('AuthService', () => {
    let service: AuthService;
    let httpMock: HttpTestingController;

    const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0dXNlciIsInJvbGUiOiJOT1JNQUwiLCJleHAiOjk5OTk5OTk5OTl9.mock-signature';
    const mockAuthResponse = {
        token: mockToken,
        username: 'testuser',
        role: 'NORMAL'
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, RouterTestingModule],
            providers: [AuthService]
        });
        service = TestBed.inject(AuthService);
        httpMock = TestBed.inject(HttpTestingController);

        // Clear storage before each test
        localStorage.clear();
        sessionStorage.clear();
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('login', () => {
        it('should store token and user info on successful login', () => {
            const loginRequest = { username: 'testuser', password: 'password' };

            service.login(loginRequest).subscribe(response => {
                expect(response).toEqual(mockAuthResponse);
                expect(service.getToken()).toBe(mockToken);
                expect(localStorage.getItem('token')).toBe(mockToken);
            });

            const req = httpMock.expectOne(`${environment.authUrl}/authenticate`);
            expect(req.request.method).toBe('POST');
            expect(req.request.headers.get('Content-Type')).toBe('application/json');
            req.flush(mockAuthResponse);
        });

        it('should handle login error correctly', () => {
            const loginRequest = { username: 'testuser', password: 'wrong' };

            service.login(loginRequest).subscribe({
                error: error => {
                    expect(error.message).toBe('Invalid credentials');
                    expect(service.getToken()).toBeNull();
                }
            });

            const req = httpMock.expectOne(`${environment.authUrl}/authenticate`);
            req.flush('Invalid credentials', { status: 401, statusText: 'Unauthorized' });
        });
    });

    describe('token validation', () => {
        it('should validate token expiration correctly', () => {
            // Set expired token
            const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0dXNlciIsInJvbGUiOiJOT1JNQUwiLCJleHAiOjF9.mock-signature';
            localStorage.setItem('token', expiredToken);
            
            expect(service.isAuthenticated()).toBeFalse();
            expect(localStorage.getItem('token')).toBeNull();
        });

        it('should handle invalid token format', () => {
            localStorage.setItem('token', 'invalid-token');
            
            expect(service.isAuthenticated()).toBeFalse();
            expect(localStorage.getItem('token')).toBeNull();
        });
    });

    describe('logout', () => {
        it('should clear auth data on logout', () => {
            // Setup initial state
            localStorage.setItem('token', mockToken);
            
            service.logout();
            
            expect(service.getToken()).toBeNull();
            expect(localStorage.getItem('token')).toBeNull();
        });
    });
}); 