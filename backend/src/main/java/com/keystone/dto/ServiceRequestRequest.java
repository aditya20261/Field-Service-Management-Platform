package com.keystone.dto;

import com.keystone.entity.ServiceRequestPriority;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ServiceRequestRequest(

        @NotNull
        Long siteId,

        @NotBlank
        String title,

        String description,

        ServiceRequestPriority priority
) {
}