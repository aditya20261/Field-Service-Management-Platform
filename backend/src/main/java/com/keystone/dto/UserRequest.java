package com.keystone.dto;

import com.keystone.entity.Role;

public record UserRequest(
        String email,
        String password,
        String fullName,
        Role role,
        boolean active
) {
}