package com.keystone.dto;

public record CustomerResponse(Long id, Long userId, String fullName, String email, String phone) {}
