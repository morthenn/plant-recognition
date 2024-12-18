export interface LoginRequest {
    username: string;
    password: string;
}

export interface RegisterRequest {
    username: string;
    password: string;
    role: string;
}

export interface AuthResponse {
    token: string;
    username: string;
    role: string;
}

export interface User {
    username: string;
    role: string;
} 