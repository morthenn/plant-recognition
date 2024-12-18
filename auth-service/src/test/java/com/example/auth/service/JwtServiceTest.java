package com.example.auth.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {
    private JwtService jwtService;
    private static final String SECRET_KEY = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970";
    private static final long EXPIRATION = 86400000;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "secretKey", SECRET_KEY);
        ReflectionTestUtils.setField(jwtService, "jwtExpiration", EXPIRATION);
    }

    @Test
    void generateTokenAndValidateToken() {
        // Given
        UserDetails userDetails = User.builder()
                .username("testuser")
                .password("password")
                .authorities(Collections.emptyList())
                .build();

        // When
        String token = jwtService.generateToken(userDetails);

        // Then
        assertNotNull(token);
        assertTrue(jwtService.isTokenValid(token, userDetails));
        assertEquals("testuser", jwtService.extractUsername(token));
    }

    @Test
    void invalidTokenShouldFailValidation() {
        // Given
        UserDetails userDetails = User.builder()
                .username("testuser")
                .password("password")
                .authorities(Collections.emptyList())
                .build();

        // When
        String token = "invalid.token.here";

        // Then
        assertThrows(Exception.class, () -> jwtService.isTokenValid(token, userDetails));
    }
} 