package com.example.auth.service;

import com.example.auth.dto.AuthRequest;
import com.example.auth.dto.AuthResponse;
import com.example.auth.dto.UserRegistrationRequest;
import com.example.auth.model.User;
import com.example.auth.model.UserRole;
import com.example.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public User registerUser(UserRegistrationRequest request) {
        log.debug("Starting user registration process for username: {}", request.getUsername());
        
        if (userRepository.existsById(request.getUsername())) {
            log.warn("Registration failed - username already exists: {}", request.getUsername());
            throw new RuntimeException("Username already exists");
        }

        String encodedPassword = passwordEncoder.encode(request.getPassword());
        log.debug("Password encoded successfully for user: {}", request.getUsername());
        
        User user = new User(
            request.getUsername(),
            encodedPassword,
            true,
            UserRole.valueOf(request.getRole().toUpperCase())
        );

        log.debug("Saving new user to database: {}", user.getUsername());
        User savedUser = userRepository.save(user);
        log.info("User registered successfully: {}", request.getUsername());
        return savedUser;
    }

    public AuthResponse authenticate(AuthRequest request) {
        log.debug("Starting authentication process for username: {}", request.getUsername());
        
        try {
            // First check if user exists
            User user = userRepository.findById(request.getUsername())
                .orElseThrow(() -> {
                    log.warn("Authentication failed - user not found: {}", request.getUsername());
                    return new BadCredentialsException("Invalid username or password");
                });

            log.debug("User found in database: {}", request.getUsername());
            log.debug("Stored password hash: {}", user.getPasswordHash());
            
            // Attempt authentication
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
            );
            
            log.debug("Authentication successful for user: {}", request.getUsername());
            log.debug("User authorities: {}", authentication.getAuthorities());

            // Generate JWT token
            UserDetails userDetails = org.springframework.security.core.userdetails.User.builder()
                .username(user.getUsername())
                .password(user.getPasswordHash())
                .roles(user.getRole().name())
                .build();

            String token = jwtService.generateToken(userDetails);
            log.debug("JWT token generated successfully for user: {}", request.getUsername());

            AuthResponse response = new AuthResponse(token, user.getUsername(), user.getRole().name());
            log.info("Authentication completed successfully for user: {}", request.getUsername());
            return response;
            
        } catch (BadCredentialsException e) {
            log.warn("Authentication failed - bad credentials for user: {}", request.getUsername());
            throw new BadCredentialsException("Invalid username or password");
        } catch (AuthenticationException e) {
            log.error("Authentication failed for user: {}", request.getUsername(), e);
            throw new BadCredentialsException("Authentication failed: " + e.getMessage());
        }
    }
} 