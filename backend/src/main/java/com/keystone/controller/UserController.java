package com.keystone.controller;

import com.keystone.dto.UserRequest;
import com.keystone.dto.UserResponse;
import com.keystone.entity.User;
import com.keystone.repository.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository users;
    private final PasswordEncoder passwordEncoder;

    public UserController(
            UserRepository users,
            PasswordEncoder passwordEncoder) {

        this.users = users;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping
    @PreAuthorize("hasRole('MANAGER')")
    public List<UserResponse> all() {
        return users.findAll()
                .stream()
                .map(UserResponse::from)
                .toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('MANAGER')")
    public UserResponse create(
            @RequestBody UserRequest request) {

        if (users.findByEmail(request.email()).isPresent()) {
            throw new RuntimeException(
                    "Email already exists"
            );
        }

        User user = new User();

        user.setEmail(request.email());
        user.setPassword(
                passwordEncoder.encode(
                        request.password()
                )
        );
        user.setFullName(request.fullName());
        user.setRole(request.role());
        user.setActive(request.active());

        return UserResponse.from(
                users.save(user)
        );
    }
}