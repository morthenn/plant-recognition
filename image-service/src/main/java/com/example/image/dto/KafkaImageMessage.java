package com.example.image.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class KafkaImageMessage {
    private String image_id;
    private String image_data;  // Base64 encoded image
    private String user_id;
} 