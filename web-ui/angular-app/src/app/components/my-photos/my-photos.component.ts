import { Component, OnInit } from '@angular/core';
import { ImageService } from '../../services/image.service';
import { PlantImage } from '../../models/image.model';

@Component({
    selector: 'app-my-photos',
    templateUrl: './my-photos.component.html',
    styleUrls: ['./my-photos.component.scss']
})
export class MyPhotosComponent implements OnInit {
    images: PlantImage[] = [];
    loading = true;

    constructor(private imageService: ImageService) {}

    ngOnInit(): void {
        this.loadImages();
    }

    private loadImages(): void {
        this.imageService.getUserImages()
            .subscribe({
                next: images => {
                    this.images = images;
                    this.loading = false;
                },
                error: error => {
                    console.error('Failed to load images:', error);
                    this.loading = false;
                }
            });
    }
} 