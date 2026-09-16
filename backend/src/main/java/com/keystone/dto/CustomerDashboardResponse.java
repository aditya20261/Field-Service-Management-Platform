package com.keystone.dto;

public record CustomerDashboardResponse(

        long totalWorkOrders,

        long newWorkOrders,

        long inProgressWorkOrders,

        long completedWorkOrders,

        long totalServiceRequests,

        long newServiceRequests,

        long inProgressServiceRequests,

        long completedServiceRequests,

        long totalSites
) {
}