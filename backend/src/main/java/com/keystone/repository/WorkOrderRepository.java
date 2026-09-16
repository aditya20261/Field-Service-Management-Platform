package com.keystone.repository;

import com.keystone.entity.SlaStatus;
import com.keystone.entity.WorkOrder;
import com.keystone.entity.WorkOrderStatus;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WorkOrderRepository
        extends JpaRepository<WorkOrder, Long> {

   List<WorkOrder> findByCustomerId(Long customerId);

List<WorkOrder> findByTechnicianId(Long technicianId);

long countByCustomerId(Long customerId);

long countByCustomerIdAndStatus(
        Long customerId,
        WorkOrderStatus status
);

long countByStatus(WorkOrderStatus status);

long countBySlaStatus(SlaStatus slaStatus);
}