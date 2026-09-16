package com.keystone.service;

import com.keystone.dto.WorkOrderPartRequest;
import com.keystone.dto.WorkOrderPartResponse;
import com.keystone.entity.Part;
import com.keystone.entity.WorkOrder;
import com.keystone.entity.WorkOrderPart;
import com.keystone.repository.PartRepository;
import com.keystone.repository.WorkOrderPartRepository;
import com.keystone.repository.WorkOrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class WorkOrderPartService {

    private final WorkOrderPartRepository workOrderParts;
    private final WorkOrderRepository workOrders;
    private final PartRepository parts;

    public WorkOrderPartService(
            WorkOrderPartRepository workOrderParts,
            WorkOrderRepository workOrders,
            PartRepository parts) {

        this.workOrderParts = workOrderParts;
        this.workOrders = workOrders;
        this.parts = parts;
    }

    @Transactional
    public WorkOrderPartResponse usePart(
            Long workOrderId,
            WorkOrderPartRequest request,
            String username) {

        WorkOrder workOrder = workOrders.findById(workOrderId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Work order not found"));

        Part part = parts.findById(request.getPartId())
                .orElseThrow(() ->
                        new IllegalArgumentException("Part not found"));

        if (workOrder.getTechnician() == null) {
            throw new IllegalArgumentException(
                    "Work order has no assigned technician");
        }

        if (!workOrder.getTechnician().getEmail().equals(username)) {
            throw new SecurityException(
                    "You can only use parts on your assigned work orders");
        }

        if (part.getQuantity() < request.getQuantity()) {
            throw new IllegalArgumentException(
                    "Insufficient stock");
        }

        part.setQuantity(
                part.getQuantity() - request.getQuantity()
        );

        WorkOrderPart usage = new WorkOrderPart();

        usage.setWorkOrder(workOrder);
        usage.setPart(part);
        usage.setQuantity(request.getQuantity());
        usage.setUnitPrice(part.getUnitPrice());
        usage.setUsedBy(username);
        usage.setUsedAt(LocalDateTime.now());

        parts.save(part);

        WorkOrderPart saved = workOrderParts.save(usage);

        return toResponse(saved);
    }

    @Transactional(readOnly = true)
public List<WorkOrderPartResponse> getByWorkOrder(
        Long workOrderId) { {

        if (!workOrders.existsById(workOrderId)) {
            throw new IllegalArgumentException(
                    "Work order not found");
        }

        return workOrderParts.findByWorkOrderId(workOrderId)
                .stream()
                .map(this::toResponse)
                .toList();
    }
        }

    private WorkOrderPartResponse toResponse(
            WorkOrderPart usage) {

        WorkOrderPartResponse response =
                new WorkOrderPartResponse();

        response.setId(usage.getId());
        response.setWorkOrderId(
                usage.getWorkOrder().getId()
        );
        response.setPartId(
                usage.getPart().getId()
        );
        response.setPartName(
                usage.getPart().getName()
        );
        response.setPartNumber(
                usage.getPart().getPartNumber()
        );
        response.setQuantity(
                usage.getQuantity()
        );
        response.setUnitPrice(
                usage.getUnitPrice()
        );
        response.setUsedBy(
                usage.getUsedBy()
        );
        response.setUsedAt(
                usage.getUsedAt()
        );

        return response;
    }
}