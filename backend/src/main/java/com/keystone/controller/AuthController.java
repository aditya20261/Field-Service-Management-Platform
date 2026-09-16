package com.keystone.controller;

import com.keystone.dto.AuthResponse;
import com.keystone.dto.LoginRequest;
import com.keystone.dto.RegisterRequest;
import com.keystone.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService service;

    public AuthController(AuthService service) {
        this.service = service;
    }

    @PostMapping("/login")
    public AuthResponse login(@RequestBody LoginRequest x) {
        return service.login(x);
    }

    @PostMapping("/register")
    public AuthResponse register(@RequestBody RegisterRequest x) {
        return service.register(x);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> badRequest(IllegalArgumentException ex) {
        return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
    }
}
