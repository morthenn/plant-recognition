package com.example.image.controller;

import com.example.image.dto.ImageUploadResponse;
import com.example.image.model.Image;
import com.example.image.service.ImageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

import static org.springframework.http.ResponseEntity.ok;
import static org.springframework.http.ResponseEntity.status;

@RestController
@RequestMapping("/api/images")
@RequiredArgsConstructor
public class ImageController {
    private final ImageService imageService;
    
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ImageUploadResponse> uploadImage(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ok(imageService.uploadImage(file, userDetails.getUsername()));
    }
    
    @GetMapping
    public ResponseEntity<List<Image>> getUserImages(@AuthenticationPrincipal UserDetails userDetails) {
        return ok(imageService.getUserImages(userDetails.getUsername()));
    }
    
    @GetMapping("/{imageId}")
    public ResponseEntity<Image> getImage(
            @PathVariable String imageId,
            @AuthenticationPrincipal UserDetails userDetails) {
        Image image = imageService.getImage(imageId);
        if (!image.getUserId().equals(userDetails.getUsername())) {
            return status(HttpStatus.FORBIDDEN).build();
        }
        return ok(image);
    }
} 
    
