package com.example.auth.service;

import com.example.auth.model.User;
import com.example.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;

@Service
@RequiredArgsConstructor
@Slf4j
public class CustomUserDetailsService implements UserDetailsService {
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        log.debug("Loading user details for username: {}", username);
        
        User user = userRepository.findById(username)
                .orElseThrow(() -> {
                    log.warn("User not found with username: {}", username);
                    return new UsernameNotFoundException("User not found with username: " + username);
                });

        if (!user.isActive()) {
            log.warn("User is not active: {}", username);
            throw new UsernameNotFoundException("User is not active: " + username);
        }

        log.debug("Building UserDetails for user: {}", username);
        
        UserDetails userDetails = org.springframework.security.core.userdetails.User.builder()
                .username(user.getUsername())
                .password(user.getPasswordHash())
                .disabled(!user.isActive())
                .accountExpired(false)
                .credentialsExpired(false)
                .accountLocked(false)
                .authorities(Collections.singleton(new SimpleGrantedAuthority("ROLE_" + user.getRole().name())))
                .build();
                
        log.debug("UserDetails built successfully for user: {}", username);
        return userDetails;
    }
} 