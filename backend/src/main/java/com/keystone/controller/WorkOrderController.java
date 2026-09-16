
package com.keystone.controller;

import com.keystone.dto.WorkOrderRequest;
import com.keystone.dto.WorkOrderResponse;
import com.keystone.entity.User;
import com.keystone.entity.WorkOrderStatus;
import com.keystone.entity.WorkOrderStatusHistory;
import com.keystone.repository.UserRepository;
import com.keystone.repository.WorkOrderStatusHistoryRepository;
import com.keystone.service.WorkOrderService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/work-orders")
public class WorkOrderController {

    private final WorkOrderService service;
    private final WorkOrderStatusHistoryRepository historyRepository;
    private final UserRepository users;

    public WorkOrderController(
            WorkOrderService service,
            WorkOrderStatusHistoryRepository historyRepository,
            UserRepository users) {

        this.service = service;
        this.historyRepository = historyRepository;
        this.users = users;
    }

    /*
     * GET ALL WORK ORDERS
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('MANAGER','DISPATCHER','TECHNICIAN','CUSTOMER')")
    public List<WorkOrderResponse> all() {
        return service.getAll();
    }

    /*
     * GET SINGLE WORK ORDER
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER','DISPATCHER','TECHNICIAN','CUSTOMER')")
    public WorkOrderResponse one(@PathVariable Long id) {
        return service.getById(id);
    }

    /*
     * CUSTOMER CREATE
     */
    @PostMapping("/my")
    @PreAuthorize("hasRole('CUSTOMER')")
    public WorkOrderResponse createMy(
            @RequestBody WorkOrderRequest request,
            org.springframework.security.core.Authentication authentication) {

        return service.create(
                request,
                authentication.getName(),
                true
        );
    }

    /*
     * MANAGER / DISPATCHER CREATE
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('MANAGER','DISPATCHER')")
    public WorkOrderResponse create(
            @RequestBody WorkOrderRequest request,
            org.springframework.security.core.Authentication authentication) {

        return service.create(
                request,
                authentication.getName(),
                false
        );
    }

    /*
     * UPDATE
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER','DISPATCHER')")
    public WorkOrderResponse update(
            @PathVariable Long id,
            @RequestBody WorkOrderRequest request) {

        return service.update(id, request);
    }

    /*
     * ASSIGN TECHNICIAN
     */
    @PostMapping("/{id}/assign/{technicianId}")
    @PreAuthorize("hasAnyRole('MANAGER','DISPATCHER')")
    public WorkOrderResponse assign(
            @PathVariable Long id,
            @PathVariable Long technicianId,
            org.springframework.security.core.Authentication authentication) {

        return service.assign(
                id,
                technicianId,
                authentication.getName()
        );
    }

    /*
     * CHANGE STATUS
     */
    @PostMapping("/{id}/status/{status}")
    @PreAuthorize("hasAnyRole('MANAGER','DISPATCHER','TECHNICIAN')")
    public WorkOrderResponse status(
            @PathVariable Long id,
            @PathVariable WorkOrderStatus status,
            org.springframework.security.core.Authentication authentication) {

        return service.changeStatus(
                id,
                status,
                authentication.getName()
        );
    }

    /*
     * WORK ORDER HISTORY
     */
    @GetMapping("/{id}/history")
    @PreAuthorize("hasAnyRole('MANAGER','DISPATCHER','TECHNICIAN','CUSTOMER')")
    public List<HistoryResponse> history(
            @PathVariable Long id) {

        return historyRepository
                .findByWorkOrderIdOrderByChangedAtAsc(id)
                .stream()
                .map(this::toHistoryResponse)
                .toList();
    }

    /*
     * SAFE HISTORY RESPONSE
     *
     * Never return WorkOrderStatusHistory directly.
     * It could expose User.password.
     */
    private HistoryResponse toHistoryResponse(
            WorkOrderStatusHistory history) {

        String changedByName = null;

        User user = history.getChangedBy();

        if (user != null) {
            changedByName = user.getFullName();
        }

        return new HistoryResponse(
                history.getId(),
                history.getStatus(),
                changedByName,
                history.getChangedAt()
        );
    }

    /*
     * SAFE HISTORY DTO
     */
    public record HistoryResponse(
            Long id,
            WorkOrderStatus status,
            String changedBy,
            java.time.LocalDateTime changedAt
    ) {
    }

    /*
     * INVALID BUSINESS REQUEST
     *
     * Converts IllegalArgumentException
     * from the service into HTTP 400.
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleIllegalArgumentException(
            IllegalArgumentException ex) {

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(Map.of(
                        "message",
                        ex.getMessage()
                ));
    }

@ExceptionHandler(SecurityException.class)
public ResponseEntity<Map<String, String>> handleSecurityException(
        SecurityException ex) {

    return ResponseEntity
            .status(HttpStatus.FORBIDDEN)
            .body(Map.of(
                    "message",
                    ex.getMessage()
            ));
}


}

