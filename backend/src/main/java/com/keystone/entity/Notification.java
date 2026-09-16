package com.keystone.entity;
import jakarta.persistence.*; import java.time.LocalDateTime;
@Entity @Table(name="notifications")
public class Notification { @Id @GeneratedValue(strategy=GenerationType.IDENTITY) Long id; @ManyToOne(optional=false) @JoinColumn(name="user_id") User user; @Column(nullable=false,length=1000) String message; @Column(nullable=false) boolean readFlag=false; @Column(nullable=false) LocalDateTime createdAt=LocalDateTime.now(); public Long getId(){return id;} public User getUser(){return user;} public void setUser(User v){user=v;} public String getMessage(){return message;} public void setMessage(String v){message=v;} public boolean isReadFlag(){return readFlag;} public void setReadFlag(boolean v){readFlag=v;} public LocalDateTime getCreatedAt(){return createdAt;} }
