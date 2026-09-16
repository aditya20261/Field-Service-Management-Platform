package com.keystone.controller;

import com.keystone.dto.TimeLogRequest;
import com.keystone.dto.TimeLogResponse;
import com.keystone.service.TimeLogService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/work-orders/{workOrderId}/time-logs")
@PreAuthorize("hasAnyRole('MANAGER','DISPATCHER','TECHNICIAN')")
public class TimeLogController {

    private final TimeLogService service;

    public TimeLogController(TimeLogService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<TimeLogResponse> create(
            @PathVariable Long workOrderId,
            @Valid @RequestBody TimeLogRequest request,
            Authentication authentication) {

        TimeLogResponse result = service.create(
                workOrderId,
                request,
                authentication.getName()
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(result);
    }

    @GetMapping
    public List<TimeLogResponse> getByWorkOrder(
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