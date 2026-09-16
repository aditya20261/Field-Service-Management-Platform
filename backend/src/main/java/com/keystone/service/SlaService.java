package com.keystone.service;

import com.keystone.entity.SlaStatus;
import com.keystone.entity.WorkOrder;
import com.keystone.entity.WorkOrderStatus;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;

@Service
public class SlaService {

    public SlaStatus calculateStatus(WorkOrder workOrder) {

        // No SLA deadline
        if (workOrder.getSlaDueAt() == null) {
            return null;
        }

        // Completed work orders are no longer at risk
        if (workOrder.getStatus() == WorkOrderStatus.COMPLETED) {
            return SlaStatus.ON_TIME;
        }

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime dueAt = workOrder.getSlaDueAt();

        // SLA already passed
        if (now.isAfter(dueAt)) {
            return SlaStatus.BREACHED;
        }

        // Less than or equal to 2 hours remaining
        long minutesRemaining =
                Duration.between(now, dueAt).toMinutes();

        if (minutesRemaining <= 120) {
            return SlaStatus.AT_RISK;
        }

        return SlaStatus.ON_TIME;
    }

    public void updateStatus(WorkOrder workOrder) {

        SlaStatus status = calculateStatus(workOrder);

        workOrder.setSlaStatus(status);
    }
}