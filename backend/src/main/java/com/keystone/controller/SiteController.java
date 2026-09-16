package com.keystone.controller;

import com.keystone.dto.SiteRequest;
import com.keystone.dto.SiteResponse;
import com.keystone.entity.Site;
import com.keystone.service.SiteService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sites")
public class SiteController {
    private final SiteService service;
    public SiteController(SiteService service) { this.service = service; }

    @GetMapping
    @PreAuthorize("hasAnyRole('MANAGER','DISPATCHER')")
    public List<SiteResponse> all() { return service.all(); }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER','DISPATCHER')")
    public SiteResponse get(@PathVariable Long id) { return service.get(id); }

    @GetMapping("/my")
    @PreAuthorize("hasRole('CUSTOMER')")
    public List<SiteResponse> my(org.springframework.security.core.Authentication authentication) {
        return service.byCustomer(service.customerIdForEmail(authentication.getName()));
    }

    @GetMapping("/customer/{customerId}")
    @PreAuthorize("hasAnyRole('MANAGER','DISPATCHER')")
    public List<SiteResponse> byCustomer(@PathVariable Long customerId) { return service.byCustomer(customerId); }

    @PostMapping("/customer/{customerId}")
    @PreAuthorize("hasAnyRole('MANAGER','DISPATCHER')")
    public SiteResponse create(@PathVariable Long customerId, @Valid @RequestBody SiteRequest request) { return service.create(customerId, request); }

    @PostMapping("/my")
    @PreAuthorize("hasRole('CUSTOMER')")
    public SiteResponse createMy(org.springframework.security.core.Authentication authentication, @Valid @RequestBody SiteRequest request) {
        return service.create(service.customerIdForEmail(authentication.getName()), request);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER','DISPATCHER')")
    public SiteResponse update(@PathVariable Long id, @Valid @RequestBody SiteRequest request) { return service.update(id, request); }

    @PutMapping("/my/{id}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public SiteResponse updateMy(@PathVariable Long id, org.springframework.security.core.Authentication authentication, @Valid @RequestBody SiteRequest request) {
        Site owned = service.getOwnedSite(id, authentication.getName());
        return service.update(owned.getId(), request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER','DISPATCHER')")
    public void delete(@PathVariable Long id) { service.delete(id); }

    @DeleteMapping("/my/{id}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public void deleteMy(@PathVariable Long id, org.springframework.security.core.Authentication authentication) {
        Site owned = service.getOwnedSite(id, authentication.getName());
        service.delete(owned.getId());
    }
}
