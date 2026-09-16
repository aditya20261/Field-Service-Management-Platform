package com.keystone.entity;
import jakarta.persistence.*;
@Entity @Table(name="part_usage")
public class PartUsage { @Id @GeneratedValue(strategy=GenerationType.IDENTITY) Long id; @ManyToOne(optional=false) @JoinColumn(name="work_order_id") WorkOrder workOrder; @ManyToOne(optional=false) @JoinColumn(name="part_id") Part part; @Column(nullable=false) int quantity; public Long getId(){return id;} public WorkOrder getWorkOrder(){return workOrder;} public void setWorkOrder(WorkOrder v){workOrder=v;} public Part getPart(){return part;} public void setPart(Part v){part=v;} public int getQuantity(){return quantity;} public void setQuantity(int v){quantity=v;} }
