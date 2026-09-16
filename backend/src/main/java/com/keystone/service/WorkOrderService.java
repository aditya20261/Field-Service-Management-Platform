package com.keystone.service;

import com.keystone.dto.WorkOrderRequest;
import com.keystone.dto.WorkOrderResponse;
import com.keystone.entity.Customer;
import com.keystone.entity.Role;
import com.keystone.entity.Site;
import com.keystone.entity.User;
import com.keystone.entity.WorkOrder;
import com.keystone.entity.WorkOrderStatus;
import com.keystone.entity.WorkOrderStatusHistory;
import com.keystone.repository.CustomerRepository;
import com.keystone.repository.SiteRepository;
import com.keystone.repository.UserRepository;
import com.keystone.repository.WorkOrderRepository;
import com.keystone.repository.WorkOrderStatusHistoryRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class WorkOrderService {

    private final WorkOrderRepository workOrders;
    private final WorkOrderStatusHistoryRepository historyRepository;
    private final CustomerRepository customers;
    private final SiteRepository sites;
    private final UserRepository users;
    private final SlaService slaService;

    public WorkOrderService(
            WorkOrderRepository workOrders,
            WorkOrderStatusHistoryRepository historyRepository,
            CustomerRepository customers,
            SiteRepository sites,
            UserRepository users,
            SlaService slaService) {

        this.workOrders = workOrders;
        this.historyRepository = historyRepository;
        this.customers = customers;
        this.sites = sites;
        this.users = users;
        this.slaService = slaService;
    }

    /*
     * GET ALL WORK ORDERS
     */
    public List<WorkOrderResponse> getAll() {

        return workOrders.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    /*
     * GET CUSTOMER WORK ORDERS
     */
    public List<WorkOrderResponse> getCustomerOrders(Long customerId) {

        return workOrders.findByCustomerId(customerId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    /*
     * GET TECHNICIAN WORK ORDERS
     */
    public List<WorkOrderResponse> getTechnicianOrders(Long technicianId) {

        return workOrders.findByTechnicianId(technicianId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    /*
     * GET SINGLE WORK ORDER
     */
    public WorkOrderResponse getById(Long id) {

        return toResponse(findOrder(id));
    }

    /*
     * CREATE WORK ORDER
     */
    public WorkOrderResponse create(
            WorkOrderRequest request,
            String currentEmail,
            boolean customerRequest) {

        Customer customer;

        if (customerRequest) {

            User currentUser = users.findByEmail(currentEmail)
                    .orElseThrow(() ->
                            new IllegalArgumentException(
                                    "User not found"));

            customer = customers.findByUserId(currentUser.getId())
                    .orElseThrow(() ->
                            new IllegalArgumentException(
                                    "Customer profile not found"));

        } else {

            if (request.getCustomerId() == null) {
                throw new IllegalArgumentException(
                        "Customer ID is required");
            }

            customer = customers.findById(request.getCustomerId())
                    .orElseThrow(() ->
                            new IllegalArgumentException(
                                    "Customer not found"));
        }

        if (request.getSiteId() == null) {
            throw new IllegalArgumentException(
                    "Site ID is required");
        }

        Site site = sites.findById(request.getSiteId())
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Site not found"));

        /*
         * Site must belong to customer
         */
        if (!site.getCustomer().getId().equals(customer.getId())) {

            throw new IllegalArgumentException(
                    "Site does not belong to the customer");
        }

        if (request.getTitle() == null ||
                request.getTitle().isBlank()) {

            throw new IllegalArgumentException(
                    "Work order title is required");
        }

        WorkOrder order = new WorkOrder();

        order.setCustomer(customer);
        order.setSite(site);
        order.setTitle(request.getTitle());
        order.setDescription(request.getDescription());
        order.setScheduledAt(request.getScheduledAt());
        order.setStatus(WorkOrderStatus.NEW);

        /*
         * =========================
         * SLA - Phase 11
         * =========================
         *
         * Default SLA:
         * 24 hours from work order creation.
         */
        order.setSlaDueAt(
                java.time.LocalDateTime.now().plusHours(24)
        );

        /*
         * Calculate initial SLA status
         */
        slaService.updateStatus(order);

        WorkOrder saved = workOrders.save(order);

        addHistory(
                saved,
                WorkOrderStatus.NEW,
                currentEmail
        );

        return toResponse(saved);
    }

    /*
     * MANAGER / DISPATCHER UPDATE
     */
    public WorkOrderResponse update(
            Long id,
            WorkOrderRequest request) {

        WorkOrder order = findOrder(id);

        if (order.getStatus() == WorkOrderStatus.COMPLETED ||
                order.getStatus() == WorkOrderStatus.CANCELLED) {

            throw new IllegalArgumentException(
                    "Completed or cancelled work order cannot be updated");
        }

        if (request.getTitle() != null &&
                !request.getTitle().isBlank()) {

            order.setTitle(request.getTitle());
        }

        order.setDescription(request.getDescription());
        order.setScheduledAt(request.getScheduledAt());

        /*
         * Refresh SLA status
         */
        slaService.updateStatus(order);

        return toResponse(workOrders.save(order));
    }

    /*
     * ASSIGN TECHNICIAN
     *
     * NEW -> ASSIGNED
     */
    public WorkOrderResponse assign(
            Long id,
            Long technicianId,
            String currentEmail) {

        WorkOrder order = findOrder(id);

        User technician = users.findById(technicianId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Technician not found"));

        if (technician.getRole() != Role.TECHNICIAN) {

            throw new IllegalArgumentException(
                    "Selected user is not a technician");
        }

        if (!technician.isActive()) {

            throw new IllegalArgumentException(
                    "Technician account is inactive");
        }

        if (order.getStatus() != WorkOrderStatus.NEW) {

            throw new IllegalArgumentException(
                    "Only NEW work orders can be assigned");
        }

        order.setTechnician(technician);
        order.setStatus(WorkOrderStatus.ASSIGNED);

        /*
         * Refresh SLA status
         */
        slaService.updateStatus(order);

        addHistory(
                order,
                WorkOrderStatus.ASSIGNED,
                currentEmail
        );

        return toResponse(workOrders.save(order));
    }

    /*
     * CHANGE STATUS
     *
     * Valid lifecycle:
     *
     * NEW
     *   ↓
     * ASSIGNED
     *   ↓
     * IN_PROGRESS
     *   ↓
     * COMPLETED
     *
     * CANCELLED:
     * Manager / Dispatcher only
     */
    public WorkOrderResponse changeStatus(
            Long id,
            WorkOrderStatus newStatus,
            String currentEmail) {

        WorkOrder order = findOrder(id);

        User currentUser = users.findByEmail(currentEmail)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "User not found"));

        boolean managerOrDispatcher =
                currentUser.getRole() == Role.MANAGER ||
                currentUser.getRole() == Role.DISPATCHER;

        boolean technician =
                currentUser.getRole() == Role.TECHNICIAN;

        /*
         * Technician permissions
         */
        if (technician) {

            if (order.getTechnician() == null ||
                    !order.getTechnician()
                            .getId()
                            .equals(currentUser.getId())) {

                throw new SecurityException(
                        "You can only update your assigned work orders");
            }

            if (newStatus != WorkOrderStatus.IN_PROGRESS &&
                    newStatus != WorkOrderStatus.COMPLETED) {

                throw new IllegalArgumentException(
                        "Technician can only start or complete assigned jobs");
            }
        }

        /*
         * Only Manager, Dispatcher and Technician
         * can change status.
         */
        if (!managerOrDispatcher && !technician) {

            throw new SecurityException(
                    "You are not allowed to change work order status");
        }

        WorkOrderStatus current = order.getStatus();

        /*
         * Same status does not create duplicate history.
         */
        if (current == newStatus) {
            return toResponse(order);
        }

        /*
         * Cancellation
         */
        if (newStatus == WorkOrderStatus.CANCELLED) {

            if (!managerOrDispatcher) {

                throw new SecurityException(
                        "Only Manager or Dispatcher can cancel work orders");
            }

            if (current == WorkOrderStatus.COMPLETED ||
                    current == WorkOrderStatus.CANCELLED) {

                throw new IllegalArgumentException(
                        "This work order cannot be cancelled");
            }

        } else {

            /*
             * Normal lifecycle transition validation
             */
            if (!isValidTransition(current, newStatus)) {

                throw new IllegalArgumentException(
                        "Invalid status transition: "
                                + current + " -> " + newStatus);
            }
        }

        /*
         * Apply status
         */
        order.setStatus(newStatus);

        /*
         * Refresh SLA status
         */
        slaService.updateStatus(order);

        /*
         * Record history
         */
        addHistory(
                order,
                newStatus,
                currentEmail
        );

        return toResponse(workOrders.save(order));
    }

    /*
     * VALID WORK ORDER LIFECYCLE
     */
    private boolean isValidTransition(
            WorkOrderStatus current,
            WorkOrderStatus next) {

        return
                current == WorkOrderStatus.NEW &&
                        next == WorkOrderStatus.ASSIGNED

                ||

                current == WorkOrderStatus.ASSIGNED &&
                        next == WorkOrderStatus.IN_PROGRESS

                ||

                current == WorkOrderStatus.IN_PROGRESS &&
                        next == WorkOrderStatus.COMPLETED;
    }

    /*
     * ADD STATUS HISTORY
     */
    private void addHistory(
            WorkOrder order,
            WorkOrderStatus status,
            String email) {

        User user = users.findByEmail(email)
                .orElse(null);

        WorkOrderStatusHistory history =
                new WorkOrderStatusHistory();

        history.setWorkOrder(order);
        history.setStatus(status);
        history.setChangedBy(user);

        historyRepository.save(history);
    }

    /*
     * FIND WORK ORDER
     */
    private WorkOrder findOrder(Long id) {

        return workOrders.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Work order not found: " + id));
    }

    /*
     * ENTITY -> RESPONSE DTO
     */
    private WorkOrderResponse toResponse(
            WorkOrder order) {

        /*
         * Refresh SLA status before returning response
         */
        slaService.updateStatus(order);

        WorkOrderResponse response =
                new WorkOrderResponse();

        response.setId(order.getId());

        Customer customer = order.getCustomer();

        response.setCustomerId(
                customer.getId());

        if (customer.getUser() != null) {

            response.setCustomerName(
                    customer.getUser().getFullName());
        }

        Site site = order.getSite();

        response.setSiteId(
                site.getId());

        response.setSiteName(
                site.getName());

        if (order.getTechnician() != null) {

            response.setTechnicianId(
                    order.getTechnician().getId());

            response.setTechnicianName(
                    order.getTechnician().getFullName());
        }

        response.setTitle(order.getTitle());
        response.setDescription(order.getDescription());
        response.setStatus(order.getStatus());
        response.setScheduledAt(order.getScheduledAt());
        response.setCreatedAt(order.getCreatedAt());

        /*
         * SLA response
         */
        response.setSlaDueAt(order.getSlaDueAt());
        response.setSlaStatus(order.getSlaStatus());

        return response;
    }
}