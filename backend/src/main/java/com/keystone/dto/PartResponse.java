package com.keystone.dto;

public class PartResponse {

    private Long id;
    private String name;
    private String partNumber;
    private Integer quantity;
    private Double unitPrice;
    private Integer minimumStock;
    private boolean lowStock;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPartNumber() {
        return partNumber;
    }

    public void setPartNumber(String partNumber) {
        this.partNumber = partNumber;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public Double getUnitPrice() {
        return unitPrice;
    }

    public void setUnitPrice(Double unitPrice) {
        this.unitPrice = unitPrice;
    }

    public Integer getMinimumStock() {
        return minimumStock;
    }

    public void setMinimumStock(Integer minimumStock) {
        this.minimumStock = minimumStock;
    }

    public boolean isLowStock() {
        return quantity != null
                && minimumStock != null
                && quantity <= minimumStock;
    }

    public void setLowStock(boolean lowStock) {
        this.lowStock = lowStock;
    }
}