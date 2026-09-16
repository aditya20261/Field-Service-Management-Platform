package com.keystone.entity;
import jakarta.persistence.*;
@Entity @Table(name="customers")
public class Customer { @Id @GeneratedValue(strategy=GenerationType.IDENTITY) Long id; @OneToOne(optional=false) @JoinColumn(name="user_id",unique=true) User user; @Column(nullable=false) String phone; public Long getId(){return id;} public User getUser(){return user;} public void setUser(User v){user=v;} public String getPhone(){return phone;} public void setPhone(String v){phone=v;} }
