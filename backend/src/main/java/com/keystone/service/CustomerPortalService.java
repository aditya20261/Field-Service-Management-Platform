package com.keystone.service;

import com.keystone.dto.WorkOrderResponse;
import com.keystone.entity.Customer;
import com.keystone.entity.User;
import com.keystone.entity.WorkOrder;
import com.keystone.repository.CustomerRepository;
import com.keystone.repository.UserRepository;
import com.keystone.repository.WorkOrderRepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CustomerPortalService {

    private final CustomerRepository customers;
    private final UserRepository users;
    private final WorkOrderRepository workOrders;
    private final WorkOrderService workOrderService;

    public CustomerPortalService(
            CustomerRepository customers,
            UserRepository users,
            WorkOrderRepository workOrders,
            WorkOrderService workOrderService) {

        this.customers = customers;
        this.users = users;
        this.workOrders = workOrders;
        this.workOrderService = workOrderService;
    }

    public List<WorkOrderResponse> getMyWorkOrders(String email) {

        Customer customer = getCustomerByEmail(email);

        return workOrders.findByCustomerId(customer.getId())
                .stream()
                .map(workOrder ->
                        workOrderService.getById(workOrder.getId()))
                .toList();
    }

    public WorkOrderResponse getMyWorkOrder(
            Long workOrderId,
            String email) {

        Customer customer = getCustomerByEmail(email);

        WorkOrder workOrder = workOrders.findById(workOrderId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Work Order not found"));

        if (!customer.getId().equals(
                workOrder.getCustomer().getId())) {

            throw new SecurityException(
                    "You are not authorized to access this Work Order");
        }

        return workOrderService.getById(workOrderId);
    }

    private Customer getCustomerByEmail(String email) {

        User user = users.findByEmail(email)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "User not found"));

        return customers.findByUserId(user.getId())
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Customer profile not found"));
    }
}