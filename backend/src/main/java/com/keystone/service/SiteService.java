package com.keystone.service;

import com.keystone.dto.SiteRequest;
import com.keystone.dto.SiteResponse;
import com.keystone.entity.Customer;
import com.keystone.entity.Site;
import com.keystone.repository.CustomerRepository;
import com.keystone.repository.SiteRepository;
import com.keystone.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class SiteService {
    private final SiteRepository sites;
    private final CustomerRepository customers;
    private final UserRepository users;

    public SiteService(SiteRepository sites, CustomerRepository customers, UserRepository users) {
        this.sites = sites;
        this.customers = customers;
        this.users = users;
    }

    public List<SiteResponse> all() { return sites.findAll().stream().map(this::toResponse).toList(); }
    public SiteResponse get(Long id) { return toResponse(sites.findById(id).orElseThrow(() -> new IllegalArgumentException("Site not found"))); }
    public List<SiteResponse> byCustomer(Long customerId) {
        if (!customers.existsById(customerId)) throw new IllegalArgumentException("Customer not found");
        return sites.findByCustomerId(customerId).stream().map(this::toResponse).toList();
    }

    @Transactional
    public SiteResponse create(Long customerId, SiteRequest request) {
        Customer customer = customers.findById(customerId).orElseThrow(() -> new IllegalArgumentException("Customer not found"));
        return toResponse(sites.save(fromRequest(request, customer)));
    }

    @Transactional
    public SiteResponse update(Long id, SiteRequest request) {
        Site site = sites.findById(id).orElseThrow(() -> new IllegalArgumentException("Site not found"));
        apply(site, request);
        return toResponse(sites.save(site));
    }

    @Transactional
    public void delete(Long id) { sites.deleteById(id); }

    public Long customerIdForEmail(String email) {
        var user = users.findByEmail(email).orElseThrow(() -> new IllegalArgumentException("User not found"));
        return customers.findByUserId(user.getId()).orElseThrow(() -> new IllegalArgumentException("Customer profile not found")).getId();
    }

    public Site getOwnedSite(Long id, String email) {
        Site site = sites.findById(id).orElseThrow(() -> new IllegalArgumentException("Site not found"));
        if (!site.getCustomer().getId().equals(customerIdForEmail(email))) throw new SecurityException("Access denied");
        return site;
    }

    private Site fromRequest(SiteRequest r, Customer c) { Site s = new Site(); s.setCustomer(c); apply(s, r); return s; }
    private void apply(Site s, SiteRequest r) { s.setName(r.name()); s.setAddress(r.address()); s.setCity(r.city()); s.setState(r.state()); s.setPostalCode(r.postalCode()); }
    private SiteResponse toResponse(Site s) { return new SiteResponse(s.getId(), s.getCustomer().getId(), s.getName(), s.getAddress(), s.getCity(), s.getState(), s.getPostalCode()); }
}
