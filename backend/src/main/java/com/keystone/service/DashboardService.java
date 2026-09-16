package com.keystone.service;

import com.keystone.dto.DashboardResponse;
import com.keystone.entity.WorkOrderStatus;
import com.keystone.entity.Role;
import com.keystone.repository.PartRepository;
import com.keystone.repository.TimeLogRepository;
import com.keystone.repository.UserRepository;
import com.keystone.repository.WorkOrderRepository;

import org.springframework.stereotype.Service;

@Service
public class DashboardService {

    private final WorkOrderRepository workOrders;
    private final UserRepository users;
    private final PartRepository parts;
    private final TimeLogRepository timeLogs;

    public DashboardService(
            WorkOrderRepository workOrders,
            UserRepository users,
            PartRepository parts,
            TimeLogRepository timeLogs) {

        this.workOrders = workOrders;
        this.users = users;
        this.parts = parts;
        this.timeLogs = timeLogs;
    }

    public DashboardResponse getDashboard() {

        DashboardResponse response = new DashboardResponse();

        // Work Orders
        response.setTotalWorkOrders(
                workOrders.count()
        );

        response.setNewWorkOrders(
                workOrders.countByStatus(WorkOrderStatus.NEW)
        );

        response.setAssignedWorkOrders(
                workOrders.countByStatus(WorkOrderStatus.ASSIGNED)
        );

        response.setInProgressWorkOrders(
                workOrders.countByStatus(WorkOrderStatus.IN_PROGRESS)
        );

        response.setCompletedWorkOrders(
                workOrders.countByStatus(WorkOrderStatus.COMPLETED)
        );

        // SLA
        response.setOnTimeSla(
                workOrders.countBySlaStatus(
                        com.keystone.entity.SlaStatus.ON_TIME
                )
        );

        response.setAtRiskSla(
                workOrders.countBySlaStatus(
                        com.keystone.entity.SlaStatus.AT_RISK
                )
        );

        response.setBreachedSla(
                workOrders.countBySlaStatus(
                        com.keystone.entity.SlaStatus.BREACHED
                )
        );

        response.setTotalTechnicians(
        users.countByRole(Role.TECHNICIAN)
);

response.setActiveTechnicians(
        users.countByRoleAndActive(
                Role.TECHNICIAN,
                true
        )
);
        // Inventory
        response.setTotalParts(
                parts.count()
        );

        response.setLowStockParts(
                parts.findAll()
                        .stream()
                        .filter(p ->
                                p.getQuantity()
                                        <= p.getMinimumStock())
                        .count()
        );

        // Time Logs
        response.setTotalLoggedMinutes(
                timeLogs.findAll()
                        .stream()
                        .filter(t ->
                                t.getDurationMinutes() != null)
                        .mapToLong(t ->
                                t.getDurationMinutes())
                        .sum()
        );

        return response;
    }
}
