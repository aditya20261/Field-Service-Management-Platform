package com.keystone.controller;

import com.keystone.dto.ServiceRequestRequest;
import com.keystone.dto.ServiceRequestResponse;
import com.keystone.service.ServiceRequestService;

import jakarta.validation.Valid;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customer/service-requests")
@PreAuthorize("hasRole('CUSTOMER')")
public class ServiceRequestController {

    private final ServiceRequestService service;

    public ServiceRequestController(
            ServiceRequestService service) {
        this.service = service;
    }

    @GetMapping
    public List<ServiceRequestResponse> getMyRequests(
            Authentication authentication) {

        return service.getMyRequests(
                authentication.getName()
        );
    }

    @GetMapping("/{id}")
    public ServiceRequestResponse getMyRequest(
            @PathVariable Long id,
            Authentication authentication) {

        return service.getMyRequest(
                id,
                authentication.getName()
        );
    }

    @PostMapping
    public ServiceRequestResponse create(
            Authentication authentication,
            @Valid @RequestBody ServiceRequestRequest request) {

        return service.create(
                authentication.getName(),
                request
        );
    }
}