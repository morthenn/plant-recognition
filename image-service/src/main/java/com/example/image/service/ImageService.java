package com.example.image.service;

import com.example.image.dto.ImageUploadResponse;
import com.example.image.dto.KafkaImageMessage;
import com.example.image.model.Image;
import com.example.image.repository.ImageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.Base64;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ImageService {
    private final ImageRepository imageRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;
    
    @Value("${kafka.topic.plant-images}")
    private String topicName;
    
    public ImageUploadResponse uploadImage(MultipartFile file, String userId) {
        try {
            // Validate file
            validateImage(file);
            
            // Create and save image document
            Image image = new Image();
            image.setId(UUID.randomUUID().toString());
            image.setUserId(userId);
            image.setFileName(file.getOriginalFilename());
            image.setContentType(file.getContentType());
            image.setData(file.getBytes());
            image.setStatus(Image.ProcessingStatus.PENDING);
            
            imageRepository.save(image);
            
            // Send to Kafka
            sendToKafka(image);
            
            return ImageUploadResponse.builder()
                    .imageId(image.getId())
                    .message("Image uploaded successfully")
                    .status("PENDING")
                    .build();
                    
        } catch (Exception e) {
            throw new RuntimeException("Could not upload image: " + e.getMessage());
        }
    }
    
    private void validateImage(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }
        
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("File is not an image");
        }
        
        // Add size validation (e.g., 5MB max)
        if (file.getSize() > 5_000_000) {
            throw new IllegalArgumentException("File size exceeds maximum limit");
        }
    }
    
    private void sendToKafka(Image image) {
        KafkaImageMessage message = KafkaImageMessage.builder()
                .image_id(image.getId())
                .image_data(Base64.getEncoder().encodeToString(image.getData()))
                .user_id(image.getUserId())
                .build();
                
        kafkaTemplate.send(topicName, image.getId(), message);
    }
    
    public List<Image> getUserImages(String userId) {
        return imageRepository.findByUserId(userId);
    }
    
    public Image getImage(String imageId) {
        return imageRepository.findById(imageId)
                .orElseThrow(() -> new RuntimeException("Image not found"));
    }
} 