import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { AuthInterceptor } from './auth.interceptor';
import { AuthService } from '../services/auth.service';

describe('AuthInterceptor', () => {
    let httpMock: HttpTestingController;
    let httpClient: HttpClient;
    let authService: AuthService;
    const mockToken = 'mock-token';

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, RouterTestingModule],
            providers: [
                AuthService,
                {
                    provide: HTTP_INTERCEPTORS,
                    useClass: AuthInterceptor,
                    multi: true
                }
            ]
        });

        httpClient = TestBed.inject(HttpClient);
        httpMock = TestBed.inject(HttpTestingController);
        authService = TestBed.inject(AuthService);

        localStorage.clear();
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should add auth header when token exists', () => {
        localStorage.setItem('token', mockToken);

        httpClient.get('/api/test').subscribe();

        const req = httpMock.expectOne('/api/test');
        expect(req.request.headers.has('Authorization')).toBeTrue();
        expect(req.request.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
    });

    it('should not add auth header when token does not exist', () => {
        httpClient.get('/api/test').subscribe();

        const req = httpMock.expectOne('/api/test');
        expect(req.request.headers.has('Authorization')).toBeFalse();
    });

    it('should not add Content-Type header for FormData requests', () => {
        localStorage.setItem('token', mockToken);
        const formData = new FormData();
        formData.append('file', new Blob(['test']), 'test.txt');

        httpClient.post('/api/upload', formData).subscribe();

        const req = httpMock.expectOne('/api/upload');
        expect(req.request.headers.has('Content-Type')).toBeFalse();
        expect(req.request.headers.has('Authorization')).toBeTrue();
    });

    it('should add Content-Type header for JSON requests', () => {
        localStorage.setItem('token', mockToken);
        const jsonData = { test: 'data' };

        httpClient.post('/api/data', jsonData).subscribe();

        const req = httpMock.expectOne('/api/data');
        expect(req.request.headers.get('Content-Type')).toBe('application/json');
        expect(req.request.headers.has('Authorization')).toBeTrue();
    });

    it('should handle 401 error by logging out and redirecting', () => {
        localStorage.setItem('token', mockToken);
        const logoutSpy = spyOn(authService, 'logout');

        httpClient.get('/api/test').subscribe({
            error: (error) => {
                expect(error.status).toBe(401);
                expect(logoutSpy).toHaveBeenCalled();
            }
        });

        const req = httpMock.expectOne('/api/test');
        req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    });

    it('should preserve existing headers', () => {
        localStorage.setItem('token', mockToken);
        const customHeaders = { 'Custom-Header': 'test-value' };

        httpClient.get('/api/test', { headers: customHeaders }).subscribe();

        const req = httpMock.expectOne('/api/test');
        expect(req.request.headers.has('Custom-Header')).toBeTrue();
        expect(req.request.headers.get('Custom-Header')).toBe('test-value');
        expect(req.request.headers.has('Authorization')).toBeTrue();
    });
}); 