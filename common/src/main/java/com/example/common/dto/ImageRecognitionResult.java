package com.example.common.dto;

import lombok.Data;

@Data
public class ImageRecognitionResult {
    private String imageId;
    private boolean isPlant;
    private double confidence;
    private String plantType;
} 