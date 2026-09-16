package com.keystone.service;

import com.keystone.dto.TimeLogRequest;
import com.keystone.dto.TimeLogResponse;
import com.keystone.entity.TimeLog;
import com.keystone.entity.User;
import com.keystone.entity.WorkOrder;
import com.keystone.repository.TimeLogRepository;
import com.keystone.repository.UserRepository;
import com.keystone.repository.WorkOrderRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class TimeLogService {

    private final TimeLogRepository timeLogs;
    private final WorkOrderRepository workOrders;
    private final UserRepository users;

    public TimeLogService(
            TimeLogRepository timeLogs,
            WorkOrderRepository workOrders,
            UserRepository users) {

        this.timeLogs = timeLogs;
        this.workOrders = workOrders;
        this.users = users;
    }

    @Transactional
    public TimeLogResponse create(
            Long workOrderId,
            TimeLogRequest request,
            String username) {

        WorkOrder workOrder = workOrders.findById(workOrderId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Work order not found"));

        if (workOrder.getTechnician() == null) {
            throw new IllegalArgumentException(
                    "Work order has no assigned technician");
        }

        if (!workOrder.getTechnician().getEmail().equals(username)) {
            throw new SecurityException(
                    "You can only log time on your assigned work orders");
        }

        if (request.getStartTime() == null) {
            throw new IllegalArgumentException(
                    "Start time is required");
        }

        if (request.getEndTime() != null
                && !request.getEndTime().isAfter(request.getStartTime())) {

            throw new IllegalArgumentException(
                    "End time must be after start time");
        }

        User technician = users.findByEmail(username)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Technician not found"));

        TimeLog timeLog = new TimeLog();

        timeLog.setWorkOrder(workOrder);
        timeLog.setTechnician(technician);
        timeLog.setStartTime(request.getStartTime());
        timeLog.setEndTime(request.getEndTime());
        timeLog.setNotes(request.getNotes());

        if (request.getEndTime() != null) {

            long minutes = Duration.between(
                    request.getStartTime(),
                    request.getEndTime()
            ).toMinutes();

            timeLog.setDurationMinutes((int) minutes);
        }

        TimeLog saved = timeLogs.save(timeLog);

        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<TimeLogResponse> getByWorkOrder(
            Long workOrderId) {

        if (!workOrders.existsById(workOrderId)) {
            throw new IllegalArgumentException(
                    "Work order not found");
        }

        return timeLogs.findByWorkOrderId(workOrderId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<TimeLogResponse> getByTechnician(
            String username) {

        User technician = users.findByEmail(username)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Technician not found"));

        return timeLogs.findByTechnicianId(technician.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private TimeLogResponse toResponse(TimeLog timeLog) {

        TimeLogResponse response = new TimeLogResponse();

        response.setId(timeLog.getId());
        response.setWorkOrderId(
                timeLog.getWorkOrder().getId()
        );
        response.setTechnicianId(
                timeLog.getTechnician().getId()
        );
        response.setTechnicianName(
        timeLog.getTechnician().getEmail()
);
        response.setStartTime(timeLog.getStartTime());
        response.setEndTime(timeLog.getEndTime());
        response.setDurationMinutes(
                timeLog.getDurationMinutes()
        );
        response.setNotes(timeLog.getNotes());
        response.setCreatedAt(timeLog.getCreatedAt());

        return response;
    }
}