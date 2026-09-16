package com.keystone.service;

import com.keystone.dto.AuthResponse;
import com.keystone.dto.LoginRequest;
import com.keystone.dto.RegisterRequest;
import com.keystone.entity.Customer;
import com.keystone.entity.Role;
import com.keystone.entity.User;
import com.keystone.repository.CustomerRepository;
import com.keystone.repository.UserRepository;
import com.keystone.security.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {
    private final UserRepository users;
    private final CustomerRepository customers;
    private final PasswordEncoder encoder;
    private final JwtUtil jwt;

    public AuthService(UserRepository users, CustomerRepository customers, PasswordEncoder encoder, JwtUtil jwt) {
        this.users = users;
        this.customers = customers;
        this.encoder = encoder;
        this.jwt = jwt;
    }

    @Transactional
    public AuthResponse register(RegisterRequest x) {
        if (users.findByEmail(x.email()).isPresent()) {
            throw new IllegalArgumentException("Email already registered");
        }
        User u = new User();
        u.setFullName(x.fullName());
        u.setEmail(x.email());
        u.setPassword(encoder.encode(x.password()));
        u.setRole(Role.CUSTOMER);
        u.setActive(true);
        users.save(u);

        Customer customer = new Customer();
        customer.setUser(u);
        customer.setPhone("");
        customers.save(customer);

        return new AuthResponse(jwt.generate(u.getEmail(), u.getRole().name()), u.getRole().name(), u.getFullName());
    }

    public AuthResponse login(LoginRequest x) {
        User u = users.findByEmail(x.email())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));
        if (!u.isActive() || !encoder.matches(x.password(), u.getPassword())) {
            throw new IllegalArgumentException("Invalid email or password");
        }
        return new AuthResponse(jwt.generate(u.getEmail(), u.getRole().name()), u.getRole().name(), u.getFullName());
    }
}
