package com.keystone.controller;

import com.keystone.dto.CustomerDashboardResponse;
import com.keystone.service.CustomerDashboardService;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/customer/dashboard")
@PreAuthorize("hasRole('CUSTOMER')")
public class CustomerDashboardController {

    private final CustomerDashboardService service;

    public CustomerDashboardController(
            CustomerDashboardService service) {

        this.service = service;
    }

    @GetMapping
    public CustomerDashboardResponse dashboard(
            Authentication authentication) {

        return service.getDashboard(
                authentication.getName()
        );
    }
}