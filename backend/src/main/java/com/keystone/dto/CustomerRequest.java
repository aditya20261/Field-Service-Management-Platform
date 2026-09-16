package com.keystone.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CustomerRequest(
        @NotBlank @Size(max = 120) String fullName,
        @NotBlank @Email @Size(max = 180) String email,
        @Size(max = 50) String phone,
        @Size(min = 6, max = 100) String password
) {}
