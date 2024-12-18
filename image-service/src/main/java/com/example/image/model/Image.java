package com.example.image.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Data
@Document(collection = "images")
public class Image {
    @Id
    private String id;
    private String userId;
    private String fileName;
    private String contentType;
    private byte[] data;
    private LocalDateTime uploadedAt = LocalDateTime.now();
    private ProcessingStatus status = ProcessingStatus.PENDING;
    private String recognitionResult;
    
    public enum ProcessingStatus {
        PENDING,
        PROCESSING,
        COMPLETED,
        FAILED
    }
} 