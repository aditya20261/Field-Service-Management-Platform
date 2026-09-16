package com.keystone.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "work_orders")
public class WorkOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "customer_id")
    private Customer customer;

    @ManyToOne(optional = false)
    @JoinColumn(name = "site_id")
    private Site site;

    @ManyToOne
    @JoinColumn(name = "technician_id")
    private User technician;

    @Column(nullable = false)
    private String title;

    @Column(length = 2000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private WorkOrderStatus status = WorkOrderStatus.NEW;

    private LocalDateTime scheduledAt;

    private LocalDateTime createdAt = LocalDateTime.now();

    // =========================
    // SLA Fields - Phase 11
    // =========================

    @Column(name = "sla_due_at")
    private LocalDateTime slaDueAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "sla_status")
    private SlaStatus slaStatus;

    // =========================
    // Getters and Setters
    // =========================

    public Long getId() {
        return id;
    }

    public Customer getCustomer() {
        return customer;
    }

    public void setCustomer(Customer v) {
        customer = v;
    }

    public Site getSite() {
        return site;
    }

    public void setSite(Site v) {
        site = v;
    }

    public User getTechnician() {
        return technician;
    }

    public void setTechnician(User v) {
        technician = v;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String v) {
        title = v;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String v) {
        description = v;
    }

    public WorkOrderStatus getStatus() {
        return status;
    }

    public void setStatus(WorkOrderStatus v) {
        status = v;
    }

    public LocalDateTime getScheduledAt() {
        return scheduledAt;
    }

    public void setScheduledAt(LocalDateTime v) {
        scheduledAt = v;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    // =========================
    // SLA Getters and Setters
    // =========================

    public LocalDateTime getSlaDueAt() {
        return slaDueAt;
    }

    public void setSlaDueAt(LocalDateTime slaDueAt) {
        this.slaDueAt = slaDueAt;
    }

    public SlaStatus getSlaStatus() {
        return slaStatus;
    }

    public void setSlaStatus(SlaStatus slaStatus) {
        this.slaStatus = slaStatus;
    }
}