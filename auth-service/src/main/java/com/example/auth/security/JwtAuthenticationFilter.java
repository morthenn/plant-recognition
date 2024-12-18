package com.example.auth.security;

import java.io.IOException;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.example.auth.service.JwtService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        try {
            final String authHeader = request.getHeader("Authorization");
            log.debug("Processing request to '{}' with auth header: {}", request.getRequestURI(), authHeader != null ? "present" : "absent");
            
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                log.debug("No Bearer token found in request to: {}", request.getRequestURI());
                filterChain.doFilter(request, response);
                return;
            }

            final String jwt = authHeader.substring(7);
            log.debug("JWT token extracted from request");
            
            final String username = jwtService.extractUsername(jwt);
            log.debug("Username extracted from JWT: {}", username);

            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                log.debug("Loading user details for username: {}", username);
                UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);
                
                if (jwtService.isTokenValid(jwt, userDetails)) {
                    log.debug("JWT token is valid for user: {}", username);
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        userDetails.getAuthorities()
                    );
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    log.debug("Authentication token set in SecurityContext for user: {}", username);
                } else {
                    log.warn("Invalid JWT token for user: {}", username);
                }
            }
            filterChain.doFilter(request, response);
        } catch (Exception e) {
            log.error("Error processing JWT authentication", e);
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("Invalid token");
        }
    }
}