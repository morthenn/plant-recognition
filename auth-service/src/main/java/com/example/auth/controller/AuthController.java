package com.example.auth.controller;

import com.example.auth.dto.AuthRequest;
import com.example.auth.dto.AuthResponse;
import com.example.auth.dto.UserRegistrationRequest;
import com.example.auth.model.User;
import com.example.auth.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<User> register(@RequestBody UserRegistrationRequest request) {
        return ResponseEntity.ok(userService.registerUser(request));
    }

    @PostMapping("/authenticate")
    public ResponseEntity<AuthResponse> authenticate(@RequestBody AuthRequest request) {
        return ResponseEntity.ok(userService.authenticate(request));
    }
} 