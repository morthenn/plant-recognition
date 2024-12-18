package com.example.auth.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.example.auth.dto.UserRegistrationRequest;
import com.example.auth.model.User;
import com.example.auth.model.UserRole;
import com.example.auth.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {
    @Mock
    private UserRepository userRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private JwtService jwtService;
    @Mock
    private AuthenticationManager authenticationManager;

    private UserService userService;

    @BeforeEach
    void setUp() {
        userService = new UserService(userRepository, passwordEncoder, jwtService, authenticationManager);
    }

    @Test
    void registerUserSuccessfully() {
        // Given
        UserRegistrationRequest request = new UserRegistrationRequest();
        request.setUsername("testuser");
        request.setPassword("password");
        request.setRole("NORMAL");

        when(userRepository.existsById(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArgument(0));

        // When
        User result = userService.registerUser(request);

        // Then
        assertNotNull(result);
        assertEquals("testuser", result.getUsername());
        assertEquals(UserRole.NORMAL, result.getRole());
        assertTrue(result.isActive());
        verify(userRepository).save(any(User.class));
    }

    @Test
    void registerUserWithExistingUsernameShouldThrowException() {
        // Given
        UserRegistrationRequest request = new UserRegistrationRequest();
        request.setUsername("existinguser");
        request.setPassword("password");
        request.setRole("NORMAL");

        when(userRepository.existsById("existinguser")).thenReturn(true);

        // Then
        assertThrows(RuntimeException.class, () -> userService.registerUser(request));
        verify(userRepository, never()).save(any(User.class));
    }
} 