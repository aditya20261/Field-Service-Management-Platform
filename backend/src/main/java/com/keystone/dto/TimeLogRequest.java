package com.keystone.dto;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public class TimeLogRequest {

    @NotNull
    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private String notes;

    public LocalDateTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }

    public LocalDateTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalDateTime endTime) {
        this.endTime = endTime;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}