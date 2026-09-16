package com.keystone.dto;

public class DashboardResponse {

    private long totalWorkOrders;
    private long newWorkOrders;
    private long assignedWorkOrders;
    private long inProgressWorkOrders;
    private long completedWorkOrders;

    private long onTimeSla;
    private long atRiskSla;
    private long breachedSla;

    private long totalTechnicians;
    private long activeTechnicians;

    private long totalParts;
    private long lowStockParts;

    private long totalLoggedMinutes;

    public long getTotalWorkOrders() {
        return totalWorkOrders;
    }

    public void setTotalWorkOrders(long totalWorkOrders) {
        this.totalWorkOrders = totalWorkOrders;
    }

    public long getNewWorkOrders() {
        return newWorkOrders;
    }

    public void setNewWorkOrders(long newWorkOrders) {
        this.newWorkOrders = newWorkOrders;
    }

    public long getAssignedWorkOrders() {
        return assignedWorkOrders;
    }

    public void setAssignedWorkOrders(long assignedWorkOrders) {
        this.assignedWorkOrders = assignedWorkOrders;
    }

    public long getInProgressWorkOrders() {
        return inProgressWorkOrders;
    }

    public void setInProgressWorkOrders(long inProgressWorkOrders) {
        this.inProgressWorkOrders = inProgressWorkOrders;
    }

    public long getCompletedWorkOrders() {
        return completedWorkOrders;
    }

    public void setCompletedWorkOrders(long completedWorkOrders) {
        this.completedWorkOrders = completedWorkOrders;
    }

    public long getOnTimeSla() {
        return onTimeSla;
    }

    public void setOnTimeSla(long onTimeSla) {
        this.onTimeSla = onTimeSla;
    }

    public long getAtRiskSla() {
        return atRiskSla;
    }

    public void setAtRiskSla(long atRiskSla) {
        this.atRiskSla = atRiskSla;
    }

    public long getBreachedSla() {
        return breachedSla;
    }

    public void setBreachedSla(long breachedSla) {
        this.breachedSla = breachedSla;
    }

    public long getTotalTechnicians() {
        return totalTechnicians;
    }

    public void setTotalTechnicians(long totalTechnicians) {
        this.totalTechnicians = totalTechnicians;
    }

    public long getActiveTechnicians() {
        return activeTechnicians;
    }

    public void setActiveTechnicians(long activeTechnicians) {
        this.activeTechnicians = activeTechnicians;
    }

    public long getTotalParts() {
        return totalParts;
    }

    public void setTotalParts(long totalParts) {
        this.totalParts = totalParts;
    }

    public long getLowStockParts() {
        return lowStockParts;
    }

    public void setLowStockParts(long lowStockParts) {
        this.lowStockParts = lowStockParts;
    }

    public long getTotalLoggedMinutes() {
        return totalLoggedMinutes;
    }

    public void setTotalLoggedMinutes(long totalLoggedMinutes) {
        this.totalLoggedMinutes = totalLoggedMinutes;
    }
}