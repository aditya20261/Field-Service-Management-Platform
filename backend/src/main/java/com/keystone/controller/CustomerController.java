package com.keystone.controller;

import com.keystone.dto.CustomerRequest;
import com.keystone.dto.CustomerResponse;
import com.keystone.service.CustomerService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {
    private final CustomerService service;
    public CustomerController(CustomerService service) { this.service = service; }

    @GetMapping
    @PreAuthorize("hasAnyRole('MANAGER','DISPATCHER')")
    public List<CustomerResponse> all() { return service.findAll(); }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER','DISPATCHER')")
    public CustomerResponse get(@PathVariable Long id) { return service.findById(id); }

    @GetMapping("/me")
    @PreAuthorize("hasRole('CUSTOMER')")
    public CustomerResponse me(org.springframework.security.core.Authentication authentication) { return service.findForEmail(authentication.getName()); }

    @PostMapping
    @PreAuthorize("hasAnyRole('MANAGER','DISPATCHER')")
    public CustomerResponse create(@Valid @RequestBody CustomerRequest request) { return service.create(request); }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER','DISPATCHER')")
    public CustomerResponse update(@PathVariable Long id, @Valid @RequestBody CustomerRequest request) { return service.update(id, request); }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER','DISPATCHER')")
    public void delete(@PathVariable Long id) { service.delete(id); }
}
