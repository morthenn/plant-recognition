export interface ImageUploadResponse {
    imageId: string;
    message: string;
    status: string;
}

export interface PlantImage {
    id: string;
    userId: string;
    fileName: string;
    uploadedAt: Date;
    status: string;
    recognitionResult: string;
    imageUrl: string;
} 