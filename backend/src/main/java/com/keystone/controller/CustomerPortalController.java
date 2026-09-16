package com.keystone.controller;

import com.keystone.dto.WorkOrderResponse;
import com.keystone.service.CustomerPortalService;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customer")
@PreAuthorize("hasRole('CUSTOMER')")
public class CustomerPortalController {

    private final CustomerPortalService service;

    public CustomerPortalController(CustomerPortalService service) {
        this.service = service;
    }

    @GetMapping("/work-orders")
    public List<WorkOrderResponse> getMyWorkOrders(
            Authentication authentication) {

        return service.getMyWorkOrders(authentication.getName());
    }

    @GetMapping("/work-orders/{id}")
    public WorkOrderResponse getMyWorkOrder(
            @PathVariable Long id,
            Authentication authentication) {

        return service.getMyWorkOrder(
                id,
                authentication.getName()
        );
    }
}