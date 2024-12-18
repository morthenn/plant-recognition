package com.example.auth.model;

import javax.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    private String username;
    private String passwordHash;
    private boolean active;
    
    @Enumerated(EnumType.STRING)
    private UserRole role;
} 