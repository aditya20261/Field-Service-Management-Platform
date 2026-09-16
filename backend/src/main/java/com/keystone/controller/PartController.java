package com.keystone.controller;

import com.keystone.dto.PartRequest;
import com.keystone.dto.PartResponse;
import com.keystone.service.PartService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/parts")
public class PartController {

    private final PartService service;

    public PartController(PartService service) {
        this.service = service;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('MANAGER','DISPATCHER')")
    public List<PartResponse> all() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER','DISPATCHER')")
    public PartResponse get(@PathVariable Long id) {
        return service.getById(id);
    }

    @GetMapping("/low-stock")
    @PreAuthorize("hasAnyRole('MANAGER','DISPATCHER')")
    public List<PartResponse> lowStock() {
        return service.getLowStock();
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('MANAGER','DISPATCHER')")
    public PartResponse create(
            @Valid @RequestBody PartRequest request) {

        return service.create(request);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER','DISPATCHER')")
    public PartResponse update(
            @PathVariable Long id,
            @Valid @RequestBody PartRequest request) {

        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER','DISPATCHER')")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}