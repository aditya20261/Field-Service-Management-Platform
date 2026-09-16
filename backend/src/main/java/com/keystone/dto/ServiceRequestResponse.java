package com.keystone.dto;

import com.keystone.entity.ServiceRequestPriority;
import com.keystone.entity.ServiceRequestStatus;

import java.time.LocalDateTime;

public record ServiceRequestResponse(

        Long id,

        Long customerId,
        String customerName,

        Long siteId,
        String siteName,

        String title,
        String description,

        ServiceRequestPriority priority,
        ServiceRequestStatus status,

        LocalDateTime createdAt
) {
}