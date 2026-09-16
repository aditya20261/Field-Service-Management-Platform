package com.keystone.service;

import com.keystone.dto.CustomerDashboardResponse;
import com.keystone.entity.Customer;
import com.keystone.entity.ServiceRequestStatus;
import com.keystone.entity.User;
import com.keystone.entity.WorkOrderStatus;
import com.keystone.repository.CustomerRepository;
import com.keystone.repository.ServiceRequestRepository;
import com.keystone.repository.SiteRepository;
import com.keystone.repository.UserRepository;
import com.keystone.repository.WorkOrderRepository;

import org.springframework.stereotype.Service;

@Service
public class CustomerDashboardService {

    private final CustomerRepository customers;
    private final UserRepository users;
    private final WorkOrderRepository workOrders;
    private final ServiceRequestRepository serviceRequests;
    private final SiteRepository sites;

    public CustomerDashboardService(
            CustomerRepository customers,
            UserRepository users,
            WorkOrderRepository workOrders,
            ServiceRequestRepository serviceRequests,
            SiteRepository sites) {

        this.customers = customers;
        this.users = users;
        this.workOrders = workOrders;
        this.serviceRequests = serviceRequests;
        this.sites = sites;
    }

    public CustomerDashboardResponse getDashboard(
            String email) {

        Customer customer = getCustomerByEmail(email);

        Long customerId = customer.getId();

        long totalWorkOrders =
                workOrders.countByCustomerId(customerId);

        long newWorkOrders =
                workOrders.countByCustomerIdAndStatus(
                        customerId,
                        WorkOrderStatus.NEW
                );

        long inProgressWorkOrders =
                workOrders.countByCustomerIdAndStatus(
                        customerId,
                        WorkOrderStatus.IN_PROGRESS
                );

        long completedWorkOrders =
                workOrders.countByCustomerIdAndStatus(
                        customerId,
                        WorkOrderStatus.COMPLETED
                );

        long totalServiceRequests =
                serviceRequests.countByCustomerId(customerId);

        long newServiceRequests =
                serviceRequests.countByCustomerIdAndStatus(
                        customerId,
                        ServiceRequestStatus.NEW
                );

        long inProgressServiceRequests =
                serviceRequests.countByCustomerIdAndStatus(
                        customerId,
                        ServiceRequestStatus.IN_PROGRESS
                );

        long completedServiceRequests =
                serviceRequests.countByCustomerIdAndStatus(
                        customerId,
                        ServiceRequestStatus.COMPLETED
                );

        long totalSites =
                sites.countByCustomerId(customerId);

        return new CustomerDashboardResponse(
                totalWorkOrders,
                newWorkOrders,
                inProgressWorkOrders,
                completedWorkOrders,
                totalServiceRequests,
                newServiceRequests,
                inProgressServiceRequests,
                completedServiceRequests,
                totalSites
        );
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
}