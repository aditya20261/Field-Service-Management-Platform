package com.keystone.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SiteRequest(
        @NotBlank @Size(max = 255) String name,
        @NotBlank @Size(max = 500) String address,
        @Size(max = 100) String city,
        @Size(max = 100) String state,
        @Size(max = 30) String postalCode
) {}
