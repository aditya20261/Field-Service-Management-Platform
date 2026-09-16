package com.keystone.service;

import com.keystone.dto.CustomerRequest;
import com.keystone.dto.CustomerResponse;
import com.keystone.entity.Customer;
import com.keystone.entity.Role;
import com.keystone.entity.User;
import com.keystone.repository.CustomerRepository;
import com.keystone.repository.SiteRepository;
import com.keystone.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CustomerService {
    private final CustomerRepository customers;
    private final UserRepository users;
    private final SiteRepository sites;
    private final PasswordEncoder encoder;

    public CustomerService(CustomerRepository customers, UserRepository users, SiteRepository sites, PasswordEncoder encoder) {
        this.customers = customers;
        this.users = users;
        this.sites = sites;
        this.encoder = encoder;
    }

    public List<CustomerResponse> findAll() {
        return customers.findAll().stream().map(this::toResponse).toList();
    }

    public CustomerResponse findById(Long id) {
        return toResponse(customers.findById(id).orElseThrow(() -> new IllegalArgumentException("Customer not found")));
    }

    public CustomerResponse findForEmail(String email) {
        User user = users.findByEmail(email).orElseThrow(() -> new IllegalArgumentException("User not found"));
        Customer customer = customers.findByUserId(user.getId()).orElseThrow(() -> new IllegalArgumentException("Customer profile not found"));
        return toResponse(customer);
    }

    @Transactional
    public CustomerResponse create(CustomerRequest request) {
        if (users.findByEmail(request.email()).isPresent()) {
            throw new IllegalArgumentException("Email already registered");
        }
        if (request.password() == null || request.password().isBlank()) {
            throw new IllegalArgumentException("Password is required when creating a customer");
        }
        User user = new User();
        user.setFullName(request.fullName());
        user.setEmail(request.email());
        user.setPassword(encoder.encode(request.password()));
        user.setRole(Role.CUSTOMER);
        user.setActive(true);
        users.save(user);

        Customer customer = new Customer();
        customer.setUser(user);
        customer.setPhone(request.phone() == null ? "" : request.phone());
        return toResponse(customers.save(customer));
    }

    @Transactional
    public CustomerResponse update(Long id, CustomerRequest request) {
        Customer customer = customers.findById(id).orElseThrow(() -> new IllegalArgumentException("Customer not found"));
        User user = customer.getUser();
        if (!user.getEmail().equalsIgnoreCase(request.email()) && users.findByEmail(request.email()).isPresent()) {
            throw new IllegalArgumentException("Email already registered");
        }
        user.setFullName(request.fullName());
        user.setEmail(request.email());
        if (request.password() != null && !request.password().isBlank()) user.setPassword(encoder.encode(request.password()));
        customer.setPhone(request.phone() == null ? "" : request.phone());
        users.save(user);
        return toResponse(customers.save(customer));
    }

    @Transactional
    public void delete(Long id) {
        Customer customer = customers.findById(id).orElseThrow(() -> new IllegalArgumentException("Customer not found"));
        if (sites.existsByCustomerId(id)) {
            throw new IllegalStateException("Cannot delete customer while service sites exist");
        }
        User user = customer.getUser();
        customers.delete(customer);
        users.delete(user);
    }

    private CustomerResponse toResponse(Customer c) {
        return new CustomerResponse(c.getId(), c.getUser().getId(), c.getUser().getFullName(), c.getUser().getEmail(), c.getPhone());
    }
}
