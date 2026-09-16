package com.keystone.controller;

import com.keystone.dto.ServiceRequestResponse;
import com.keystone.service.ServiceRequestService;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dispatcher/service-requests")
@PreAuthorize("hasRole('DISPATCHER')")
public class DispatcherServiceRequestController {

    private final ServiceRequestService service;

    public DispatcherServiceRequestController(
            ServiceRequestService service) {
        this.service = service;
    }

    @GetMapping
    public List<ServiceRequestResponse> getAllRequests() {
        return service.getAllRequests();
    }
}