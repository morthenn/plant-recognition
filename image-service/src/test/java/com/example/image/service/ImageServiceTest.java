package com.example.image.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Arrays;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.multipart.MultipartFile;

import com.example.image.dto.ImageUploadResponse;
import com.example.image.model.Image;
import com.example.image.repository.ImageRepository;

@ExtendWith(MockitoExtension.class)
class ImageServiceTest {
    private static final String TOPIC_NAME = "test-topic";
    
    @Mock
    private ImageRepository imageRepository;
    @Mock
    private KafkaTemplate<String, Object> kafkaTemplate;

    private ImageService imageService;

    @BeforeEach
    void setUp() {
        imageService = new ImageService(imageRepository, kafkaTemplate);
        ReflectionTestUtils.setField(imageService, "topicName", TOPIC_NAME);
    }

    @Test
    void uploadImageSuccessfully() {
        // Given
        MultipartFile file = new MockMultipartFile(
            "test.jpg",
            "test.jpg",
            "image/jpeg",
            "test image content".getBytes()
        );
        String userId = "testuser";

        when(imageRepository.save(any(Image.class))).thenAnswer(i -> i.getArgument(0));

        // When
        ImageUploadResponse response = imageService.uploadImage(file, userId);

        // Then
        assertNotNull(response);
        assertNotNull(response.getImageId());
        assertEquals("Image uploaded successfully", response.getMessage());
        assertEquals("PENDING", response.getStatus());
        verify(imageRepository).save(any(Image.class));
        verify(kafkaTemplate).send(org.mockito.ArgumentMatchers.eq(TOPIC_NAME), anyString(), any(Object.class));
    }

    @Test
    void getUserImagesSuccessfully() {
        // Given
        String userId = "testuser";
        List<Image> images = Arrays.asList(
            createTestImage("1", userId),
            createTestImage("2", userId)
        );

        when(imageRepository.findByUserId(userId)).thenReturn(images);

        // When
        List<Image> result = imageService.getUserImages(userId);

        // Then
        assertEquals(2, result.size());
        verify(imageRepository).findByUserId(userId);
    }

    private Image createTestImage(String id, String userId) {
        Image image = new Image();
        image.setId(id);
        image.setUserId(userId);
        return image;
    }
} 