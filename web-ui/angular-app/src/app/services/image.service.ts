import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ImageUploadResponse, PlantImage } from '../models/image.model';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class ImageService {
    constructor(private http: HttpClient) {}

    uploadImage(file: File): Observable<ImageUploadResponse> {
        const formData = new FormData();
        formData.append('file', file);

        return this.http.post<ImageUploadResponse>(
            `${environment.apiUrl}/images`,
            formData
        ).pipe(
            catchError(this.handleError)
        );
    }

    getUserImages(): Observable<PlantImage[]> {
        return this.http.get<PlantImage[]>(`${environment.apiUrl}/images`)
            .pipe(
                catchError(this.handleError)
            );
    }

    getImage(imageId: string): Observable<PlantImage> {
        return this.http.get<PlantImage>(`${environment.apiUrl}/images/${imageId}`)
            .pipe(
                catchError(this.handleError)
            );
    }

    private handleError(error: HttpErrorResponse) {
        let errorMessage = 'An error occurred';
        if (error.error instanceof ErrorEvent) {
            // Client-side error
            errorMessage = error.error.message;
        } else {
            // Server-side error
            if (error.status === 401) {
                errorMessage = 'Please login to continue';
            } else if (error.status === 413) {
                errorMessage = 'File is too large';
            } else if (error.error?.message) {
                errorMessage = error.error.message;
            }
        }
        return throwError(() => new Error(errorMessage));
    }
} 