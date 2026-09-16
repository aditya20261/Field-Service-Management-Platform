
package com.keystone.controller;

import com.keystone.dto.PartRequest;
import com.keystone.dto.PartResponse;
import com.keystone.service.PartService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/inventory")
@PreAuthorize("hasAnyRole('MANAGER','DISPATCHER')")
public class InventoryController {

    private final PartService service;

    public InventoryController(PartService service) {
        this.service = service;
    }

    /*
     * GET ALL INVENTORY
     */
    @GetMapping
    public List<PartResponse> all() {
        return service.getAll();
    }

    /*
     * GET SINGLE PART
     */
    @GetMapping("/{id}")
    public PartResponse one(@PathVariable Long id) {
        return service.getById(id);
    }

    /*
     * GET LOW STOCK PARTS
     */
    @GetMapping("/low-stock")
    public List<PartResponse> lowStock() {
        return service.getLowStock();
    }

    /*
     * CREATE PART
     */
    @PostMapping
    public ResponseEntity<PartResponse> create(
            @Valid @RequestBody PartRequest request) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(service.create(request));
    }

    /*
     * UPDATE PART
     */
    @PutMapping("/{id}")
    public PartResponse update(
            @PathVariable Long id,
            @Valid @RequestBody PartRequest request) {

        return service.update(id, request);
    }

    /*
     * DELETE PART
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> delete(
            @PathVariable Long id) {

        service.delete(id);

        return ResponseEntity.ok(
                Map.of("message", "Part deleted successfully")
        );
    }

    /*
     * INVALID BUSINESS REQUEST
     */
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
}
