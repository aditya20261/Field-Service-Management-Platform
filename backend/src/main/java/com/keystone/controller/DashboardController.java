package com.keystone.controller;

import com.keystone.dto.DashboardResponse;
import com.keystone.service.DashboardService;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService service;

    public DashboardController(DashboardService service) {
        this.service = service;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('MANAGER','DISPATCHER')")
    public DashboardResponse dashboard() {
        return service.getDashboard();
    }
}