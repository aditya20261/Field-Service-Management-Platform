package com.keystone.controller;

import com.keystone.dto.WorkOrderPartRequest;
import com.keystone.dto.WorkOrderPartResponse;
import com.keystone.service.WorkOrderPartService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/work-orders/{workOrderId}/parts")
@PreAuthorize("hasRole('TECHNICIAN')")
public class WorkOrderPartController {

    private final WorkOrderPartService service;

    public WorkOrderPartController(WorkOrderPartService service) {
        this.service = service;
    }

    @PostMapping
public ResponseEntity<WorkOrderPartResponse> usePart(
        @PathVariable Long workOrderId,
        @Valid @RequestBody WorkOrderPartRequest request,
        Authentication authentication) {

    WorkOrderPartResponse result = service.usePart(
            workOrderId,
            request,
            authentication.getName()
    );

    return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(result);
}

    @GetMapping
    public List<WorkOrderPartResponse> getParts(
            @PathVariable Long workOrderId) {

        return service.getByWorkOrder(workOrderId);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>>
    handleIllegalArgumentException(
            IllegalArgumentException ex) {

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(Map.of(
                        "message",
                        ex.getMessage()
                ));
    }

    @ExceptionHandler(SecurityException.class)
    public ResponseEntity<Map<String, String>>
    handleSecurityException(
            SecurityException ex) {

        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(Map.of(
                        "message",
                        ex.getMessage()
                ));
    }
}