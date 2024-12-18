package com.example.image.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ImageUploadResponse {
    private String imageId;
    private String message;
    private String status;
} 