package com.keystone.controller;

import com.keystone.dto.WorkOrderResponse;
import com.keystone.service.WorkOrderService;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/sla")
public class SlaController {

    private final WorkOrderService workOrderService;

    public SlaController(WorkOrderService workOrderService) {
        this.workOrderService = workOrderService;
    }

    @GetMapping("/work-orders/{workOrderId}")
    @PreAuthorize("hasAnyRole('MANAGER','DISPATCHER','TECHNICIAN')")
    public WorkOrderResponse getSla(
            @PathVariable Long workOrderId) {

        return workOrderService.getById(workOrderId);
    }
}