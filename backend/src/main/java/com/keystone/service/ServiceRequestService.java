package com.keystone.service;

import com.keystone.dto.ServiceRequestRequest;
import com.keystone.dto.ServiceRequestResponse;
import com.keystone.entity.Customer;
import com.keystone.entity.ServiceRequest;
import com.keystone.entity.ServiceRequestPriority;
import com.keystone.entity.ServiceRequestStatus;
import com.keystone.entity.Site;
import com.keystone.entity.User;
import com.keystone.repository.CustomerRepository;
import com.keystone.repository.ServiceRequestRepository;
import com.keystone.repository.UserRepository;

import jakarta.transaction.Transactional;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ServiceRequestService {

    private final ServiceRequestRepository serviceRequests;
    private final CustomerRepository customers;
    private final UserRepository users;
    private final SiteService siteService;

    public ServiceRequestService(
            ServiceRequestRepository serviceRequests,
            CustomerRepository customers,
            UserRepository users,
            SiteService siteService) {

        this.serviceRequests = serviceRequests;
        this.customers = customers;
        this.users = users;
        this.siteService = siteService;
    }

    @Transactional
    public ServiceRequestResponse create(
            String email,
            ServiceRequestRequest request) {

        Customer customer = getCustomerByEmail(email);

        // Verify that the site belongs to the logged-in customer.
        Site site = siteService.getOwnedSite(
                request.siteId(),
                email
        );

        ServiceRequest serviceRequest = new ServiceRequest();

        serviceRequest.setCustomer(customer);
        serviceRequest.setSite(site);
        serviceRequest.setTitle(request.title());
        serviceRequest.setDescription(request.description());

        serviceRequest.setPriority(
                request.priority() != null
                        ? request.priority()
                        : ServiceRequestPriority.MEDIUM
        );

        serviceRequest.setStatus(
                ServiceRequestStatus.NEW
        );

        ServiceRequest saved =
                serviceRequests.save(serviceRequest);

        return toResponse(saved);
    }

    @Transactional
public List<ServiceRequestResponse> getMyRequests(
        String email) {

    Customer customer = getCustomerByEmail(email);

    return serviceRequests
            .findByCustomerId(customer.getId())
            .stream()
            .map(this::toResponse)
            .toList();
}

@Transactional
public List<ServiceRequestResponse> getAllRequests() {

    return serviceRequests
            .findAll()
            .stream()
            .map(this::toResponse)
            .toList();
}
    @Transactional
    public ServiceRequestResponse getMyRequest(
            Long id,
            String email) {

        Customer customer = getCustomerByEmail(email);

        ServiceRequest request =
                serviceRequests.findById(id)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Service Request not found"
                                ));

        if (!customer.getId().equals(
                request.getCustomer().getId())) {

            throw new SecurityException(
                    "You are not authorized to access this Service Request"
            );
        }

        return toResponse(request);
    }

    private Customer getCustomerByEmail(String email) {

        User user = users.findByEmail(email)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "User not found"
                        ));

        return customers.findByUserId(user.getId())
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Customer profile not found"
                        ));
    }

    private ServiceRequestResponse toResponse(
            ServiceRequest request) {

        Customer customer = request.getCustomer();
        Site site = request.getSite();

        String customerName = null;

        if (customer != null && customer.getUser() != null) {
            customerName = customer.getUser().getFullName();
        }

        String siteName = site != null
                ? site.getName()
                : null;

        return new ServiceRequestResponse(
                request.getId(),

                customer != null
                        ? customer.getId()
                        : null,

                customerName,

                site != null
                        ? site.getId()
                        : null,

                siteName,

                request.getTitle(),
                request.getDescription(),
                request.getPriority(),
                request.getStatus(),
                request.getCreatedAt()
        );
    }
}