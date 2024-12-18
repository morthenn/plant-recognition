import { Component } from '@angular/core';
import { ImageService } from '../../services/image.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
    selector: 'app-upload',
    templateUrl: './upload.component.html',
    styleUrls: ['./upload.component.scss']
})
export class UploadComponent {
    selectedFile: File | null = null;
    loading = false;

    constructor(
        private imageService: ImageService,
        private snackBar: MatSnackBar
    ) {}

    onFileSelected(event: any): void {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            this.selectedFile = file;
        } else {
            this.snackBar.open('Please select an image file', 'Close', {
                duration: 3000
            });
        }
    }

    uploadImage(): void {
        if (!this.selectedFile) {
            return;
        }

        this.loading = true;
        this.imageService.uploadImage(this.selectedFile)
            .subscribe({
                next: response => {
                    this.snackBar.open('Image uploaded successfully!', 'Close', {
                        duration: 3000
                    });
                    this.selectedFile = null;
                    this.loading = false;
                },
                error: error => {
                    this.snackBar.open('Upload failed: ' + error.message, 'Close', {
                        duration: 3000
                    });
                    this.loading = false;
                }
            });
    }
} 