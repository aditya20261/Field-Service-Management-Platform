package com.keystone.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class WorkOrderPartRequest {

    @NotNull
    private Long partId;

    @NotNull
    @Min(1)
    private Integer quantity;

    public Long getPartId() {
        return partId;
    }

    public void setPartId(Long partId) {
        this.partId = partId;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }
}